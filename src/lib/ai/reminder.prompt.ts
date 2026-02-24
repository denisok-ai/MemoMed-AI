/**
 * @file reminder.prompt.ts
 * @description AI-персонализация текста напоминаний о лекарствах.
 * Схема из project.md: temp 0.5, max 200, Redis 7д.
 * @dependencies openai, redis, crypto
 * @created 2026-02-24
 */

import { createHash } from 'crypto';
import OpenAI from 'openai';
import { redis } from '@/lib/db/redis';

const CACHE_PREFIX = 'ai:reminder:';
const CACHE_TTL_SECONDS = 7 * 24 * 3600; // 7 дней

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com/v1',
});

export interface ReminderContext {
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  delayMinutes: number;
  patientName?: string;
}

/**
 * Генерирует персонализированный текст напоминания через DeepSeek.
 * Кэшируется в Redis на 7 дней (ключ по medication+dosage+scheduledTime+delayMinutes).
 * При отсутствии API-ключа или ошибке возвращает null — используется стандартный текст.
 */
export async function getPersonalizedReminderText(ctx: ReminderContext): Promise<string | null> {
  if (!process.env.DEEPSEEK_API_KEY?.trim()) {
    return null;
  }

  const cacheKey = `${ctx.medicationName}:${ctx.dosage}:${ctx.scheduledTime}:${ctx.delayMinutes}`;
  const cacheHash = createHash('sha256').update(cacheKey).digest('hex').slice(0, 16);
  const redisKey = `${CACHE_PREFIX}${cacheHash}`;

  const cached = await redis.get(redisKey).catch(() => null);
  if (cached) return cached;

  const urgency =
    ctx.delayMinutes === 0
      ? 'время приёма'
      : ctx.delayMinutes <= 10
        ? 'небольшое опоздание'
        : ctx.delayMinutes <= 20
          ? 'напоминание'
          : 'срочное напоминание';

  const prompt = `Сгенерируй одно короткое дружелюбное предложение напоминания о приёме лекарства "${ctx.medicationName}" (${ctx.dosage}).
Запланировано на ${ctx.scheduledTime}. Контекст: ${urgency}.
${ctx.patientName ? `Обращение к пациенту: ${ctx.patientName}.` : ''}
Правила: без эмодзи, максимум 15 слов, на русском, тон заботливый. Только текст, без кавычек.`;

  try {
    const response = await client.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL ?? 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 80,
      temperature: 0.5,
    });

    const text = response.choices[0]?.message?.content?.trim();
    if (!text || text.length > 200) return null;

    await redis.setex(redisKey, CACHE_TTL_SECONDS, text).catch(() => {});
    return text;
  } catch {
    return null;
  }
}
