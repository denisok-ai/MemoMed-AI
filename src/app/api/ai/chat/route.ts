/**
 * @file route.ts
 * @description API: POST /api/ai/chat — стриминговый чат с DeepSeek AI
 * Функции: кэш Redis (1ч), token budget (50K/мес), rate limit (20 запр/15мин),
 * сохранение в БД, медицинский дисклеймер в каждом ответе
 * @dependencies openai, prisma, next-auth, redis
 * @created 2026-02-22
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { deepseekClient } from '@/lib/ai/deepseek.service';
import { getCachedResponse, setCachedResponse } from '@/lib/ai/cache.service';
import { checkTokenBudget, incrementTokenUsage } from '@/lib/ai/token-budget';
import { checkRateLimit } from '@/lib/rate-limit';
import { CHAT_SYSTEM_PROMPT } from '@/lib/ai/prompts/chat.prompt';

const chatSchema = z.object({
  message: z
    .string()
    .min(1, 'Сообщение не может быть пустым')
    .max(1000, 'Сообщение слишком длинное'),
  /** История последних сообщений (без системного промпта, не более 10) */
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(2000),
      })
    )
    .max(10)
    .default([]),
});

/** Добавляет дисклеймер к каждому ответу AI */
function appendDisclaimer(text: string): string {
  return `${text}\n\n---\n_При любых сомнениях проконсультируйтесь с врачом. Это не медицинская рекомендация._`;
}

export async function POST(request: NextRequest): Promise<Response> {
  const session = await auth();

  if (!session?.user) {
    return Response.json({ error: 'Необходима авторизация' }, { status: 401 });
  }

  // Rate limit: 20 запросов за 15 минут
  const rl = await checkRateLimit(`ai:chat:${session.user.id}`, 20, 15 * 60).catch(() => ({
    allowed: true,
    remaining: 20,
    resetInSeconds: 900,
  }));

  if (!rl.allowed) {
    return Response.json(
      { error: `Слишком много запросов. Подождите ${Math.ceil(rl.resetInSeconds / 60)} мин` },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Некорректное тело запроса' }, { status: 400 });
  }

  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? 'Некорректные данные' },
      { status: 400 }
    );
  }

  const { message, history } = parsed.data;

  // Проверяем token budget
  const budget = await checkTokenBudget(session.user.id).catch(() => ({
    remaining: 50000,
    exceeded: false,
  }));

  if (budget.exceeded) {
    return Response.json(
      { error: 'Исчерпан месячный лимит запросов к ИИ (50 000 токенов)' },
      { status: 429 }
    );
  }

  // Проверяем кэш Redis для повторяющихся вопросов
  const cacheKey = message.toLowerCase().trim().slice(0, 200);
  const cached = await getCachedResponse(cacheKey).catch(() => null);

  if (cached) {
    // Сохраняем сообщения в БД даже для кэшированных ответов
    await saveMessages(session.user.id, message, cached).catch(() => {});

    const stream = createTextStream(appendDisclaimer(cached));
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Cache': 'HIT',
        'Transfer-Encoding': 'chunked',
      },
    });
  }

  // Формируем сообщения для API
  const messages = [
    { role: 'system' as const, content: CHAT_SYSTEM_PROMPT },
    ...history.map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
    { role: 'user' as const, content: message },
  ];

  // Стриминговый запрос к DeepSeek
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let fullResponse = '';

      try {
        const aiStream = await deepseekClient.chat.completions.create({
          model: 'deepseek-chat',
          messages,
          stream: true,
          max_tokens: 1000,
          temperature: 0.7,
        });

        for await (const chunk of aiStream) {
          const delta = chunk.choices[0]?.delta?.content ?? '';
          if (delta) {
            fullResponse += delta;
            controller.enqueue(encoder.encode(delta));
          }

          // Подсчёт токенов при завершении
          if (chunk.usage) {
            const totalTokens = chunk.usage.total_tokens ?? 0;
            await incrementTokenUsage(session.user.id, totalTokens).catch(() => {});
          }
        }

        // Добавляем дисклеймер
        const disclaimer = '\n\n---\n_При любых сомнениях проконсультируйтесь с врачом. Это не медицинская рекомендация._';
        controller.enqueue(encoder.encode(disclaimer));
        fullResponse += disclaimer;

        // Кэшируем успешный ответ (без дисклеймера)
        const responseWithoutDisclaimer = fullResponse.replace(/\n\n---\n_.*_$/, '');
        await setCachedResponse(cacheKey, responseWithoutDisclaimer).catch(() => {});

        // Сохраняем в БД
        await saveMessages(session.user.id, message, fullResponse).catch(() => {});
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Ошибка AI-сервиса';
        controller.enqueue(encoder.encode(`\n\n⚠️ ${errMsg}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Cache': 'MISS',
      'Transfer-Encoding': 'chunked',
    },
  });
}

/** Сохраняет пару сообщений (user + assistant) в базу данных */
async function saveMessages(userId: string, userMsg: string, aiMsg: string): Promise<void> {
  await prisma.chatMessage.createMany({
    data: [
      { userId, role: 'user', content: userMsg },
      { userId, role: 'assistant', content: aiMsg },
    ],
  });
}

/** Создаёт стрим из готовой строки (для кэшированных ответов) */
function createTextStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      // Имитируем потоковую передачу блоками по 20 символов
      const chunkSize = 20;
      for (let i = 0; i < text.length; i += chunkSize) {
        controller.enqueue(encoder.encode(text.slice(i, i + chunkSize)));
      }
      controller.close();
    },
  });
}
