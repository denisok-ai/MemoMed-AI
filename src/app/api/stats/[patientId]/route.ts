/**
 * @file route.ts
 * @description API: GET /api/stats/:patientId — агрегированные метрики дисциплины.
 * Доступ: сам пациент или привязанный родственник.
 * @dependencies stats.service, prisma, next-auth
 * @created 2026-02-22
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { calculateStats } from '@/lib/stats/stats.service';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { patientId } = await params;
  const userId = session.user.id;

  // Проверка доступа: сам пациент или привязанный родственник
  if (userId !== patientId) {
    const connection = await prisma.connection.findFirst({
      where: { patientId, relativeId: userId, status: 'active' },
    });
    if (!connection) {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }
  }

  const url = new URL(_req.url);
  const daysParam = url.searchParams.get('days');
  const days = daysParam ? Math.min(Math.max(Number(daysParam), 1), 365) : 30;

  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  // Получаем активные лекарства пациента
  const medications = await prisma.medication.findMany({
    where: { patientId, isActive: true },
    select: { id: true, name: true },
  });

  // Получаем логи за период
  const logs = await prisma.medicationLog.findMany({
    where: {
      medication: { patientId },
      scheduledAt: { gte: since },
    },
    select: {
      scheduledAt: true,
      actualAt: true,
      status: true,
    },
    orderBy: { scheduledAt: 'asc' },
  });

  const stats = calculateStats(logs, days);

  return NextResponse.json({
    ...stats,
    activeMedicationsCount: medications.length,
    periodDays: days,
  });
}
