/**
 * @file route.ts
 * @description API отзывов о лекарствах.
 *   POST /api/feedback — оставить отзыв + AI-анализ
 *   GET  /api/feedback?medicationId=UUID — список отзывов по лекарству
 * @created 2026-02-22
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import { medicationFeedbackSchema } from '@/lib/validations/feedback.schema';
import { analyzeFeedback } from '@/lib/ai/feedback-analyzer';
import type { ApiResponse } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
  }

  // Rate limit: 10 отзывов в час
  const rl = await checkRateLimit(`feedback:${session.user.id}`, 10, 3600);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error: `Слишком много запросов. Повторите через ${Math.ceil(rl.resetInSeconds / 60)} мин.`,
      },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Некорректный JSON' }, { status: 400 });
  }

  const parsed = medicationFeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Ошибка валидации' },
      { status: 422 }
    );
  }

  const { medicationId, effectivenessScore, sideEffects, freeText } = parsed.data;

  // Проверяем принадлежность лекарства пациенту
  const medication = await prisma.medication.findFirst({
    where: { id: medicationId, patientId: session.user.id, isActive: true },
    select: { name: true, dosage: true },
  });

  if (!medication) {
    return NextResponse.json({ error: 'Лекарство не найдено' }, { status: 404 });
  }

  // AI-анализ (только если есть текст)
  let aiAnalysis = null;
  if (freeText || sideEffects) {
    aiAnalysis = await analyzeFeedback(
      medication.name,
      medication.dosage,
      freeText ?? '',
      sideEffects
    );
  }

  const feedback = await prisma.medicationFeedback.create({
    data: {
      patientId: session.user.id,
      medicationId,
      effectivenessScore: effectivenessScore ?? null,
      sideEffects: sideEffects ?? null,
      freeText: freeText ?? null,
      aiAnalysis: aiAnalysis ? (aiAnalysis as object) : undefined,
    },
  });

  return NextResponse.json(
    {
      data: {
        id: feedback.id,
        aiAnalysis,
        // Если AI выявил высокий риск — предупреждаем
        warning:
          aiAnalysis?.concernLevel === 'high' || aiAnalysis?.recommendation === 'urgent'
            ? '⚠️ Обнаружены тревожные симптомы. Пожалуйста, проконсультируйтесь с врачом.'
            : null,
      },
      message: 'Отзыв сохранён',
    },
    { status: 201 }
  );
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const medicationId = searchParams.get('medicationId');

  const feedbacks = await prisma.medicationFeedback.findMany({
    where: {
      patientId: session.user.id,
      ...(medicationId ? { medicationId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      medication: { select: { name: true, dosage: true } },
    },
  });

  return NextResponse.json({ data: feedbacks });
}
