/**
 * @file route.ts
 * @description GET /api/feedback/aggregate — агрегированная анонимная статистика по лекарствам.
 * Используется для бизнес-аналитики. Данные полностью анонимизированы.
 * @created 2026-02-22
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
  }

  // Только администраторы могут видеть агрегированные данные
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const medicationName = searchParams.get('medicationName');
  const minCount = parseInt(searchParams.get('minCount') ?? '5', 10);

  // Агрегируем по названию лекарства (не по пользователю — анонимно)
  const aggregated = await prisma.medicationFeedback.groupBy({
    by: ['medicationId'],
    _count: { id: true },
    _avg: { effectivenessScore: true },
    where: medicationName
      ? { medication: { name: { contains: medicationName, mode: 'insensitive' } } }
      : {},
    having: { id: { _count: { gte: minCount } } }, // минимум N отзывов для анонимности
  });

  // Обогащаем названиями лекарств
  const medicationIds = aggregated.map((a) => a.medicationId);
  const medications = await prisma.medication.findMany({
    where: { id: { in: medicationIds } },
    select: { id: true, name: true, dosage: true },
  });

  const medicationMap = new Map(medications.map((m) => [m.id, m]));

  const result = aggregated.map((a) => ({
    medicationName: medicationMap.get(a.medicationId)?.name ?? 'Неизвестно',
    dosage: medicationMap.get(a.medicationId)?.dosage ?? '',
    feedbackCount: a._count.id,
    avgEffectiveness: a._avg.effectivenessScore
      ? Math.round(a._avg.effectivenessScore * 10) / 10
      : null,
  }));

  return NextResponse.json({ data: result });
}
