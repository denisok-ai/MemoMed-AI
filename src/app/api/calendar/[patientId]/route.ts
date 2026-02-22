/**
 * @file route.ts
 * @description API: GET /api/calendar/:patientId?month=YYYY-MM
 * Возвращает цветовую карту за месяц и статистику дисциплины.
 * Доступен для самого пациента и его родственников.
 * @dependencies prisma, next-auth
 * @created 2026-02-22
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import type { ApiResponse } from '@/types';

/** Цвет дня в календаре */
type DayColor = 'green' | 'yellow' | 'red' | 'empty';

interface DayData {
  date: string;
  color: DayColor;
  takenCount: number;
  totalCount: number;
  missedCount: number;
  disciplinePercent: number;
}

interface CalendarResponse {
  days: Record<string, DayData>;
  stats: {
    disciplinePercent: number;
    totalDays: number;
    perfectDays: number;
    missedDays: number;
    longestStreak: number;
    currentStreak: number;
  };
}

/** Цветовая логика дня: зелёный (100%), жёлтый (1-2 пропуска), красный (3+ пропуска) */
function getDayColor(takenCount: number, totalCount: number, missedCount: number): DayColor {
  if (totalCount === 0) return 'empty';
  if (missedCount === 0 && takenCount > 0) return 'green';
  if (missedCount <= 2) return 'yellow';
  return 'red';
}

interface RouteParams {
  params: Promise<{ patientId: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<CalendarResponse>>> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
  }

  const { patientId } = await params;

  // Проверяем доступ: сам пациент или его родственник
  const hasAccess =
    session.user.id === patientId ||
    (await prisma.connection.findFirst({
      where: {
        patientId,
        relativeId: session.user.id,
        status: 'active',
      },
    })) !== null;

  if (!hasAccess) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
  }

  const monthParam = request.nextUrl.searchParams.get('month');
  const monthMatch = monthParam?.match(/^(\d{4})-(\d{2})$/);

  const now = new Date();
  const year = monthMatch ? parseInt(monthMatch[1]!) : now.getFullYear();
  const month = monthMatch ? parseInt(monthMatch[2]!) - 1 : now.getMonth();

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);

  // Получаем все логи за месяц
  const logs = await prisma.medicationLog.findMany({
    where: {
      medication: { patientId },
      scheduledAt: { gte: startDate, lte: endDate },
    },
    select: {
      scheduledAt: true,
      status: true,
    },
  });

  // Группируем по дате
  const dayMap: Record<string, { taken: number; missed: number; total: number }> = {};

  for (const log of logs) {
    const dateKey = log.scheduledAt.toISOString().slice(0, 10);
    if (!dayMap[dateKey]) {
      dayMap[dateKey] = { taken: 0, missed: 0, total: 0 };
    }
    dayMap[dateKey]!.total++;
    if (log.status === 'taken') dayMap[dateKey]!.taken++;
    if (log.status === 'missed') dayMap[dateKey]!.missed++;
  }

  // Строим ответ
  const days: Record<string, DayData> = {};
  let totalTaken = 0;
  let totalMissed = 0;
  let totalRecords = 0;
  let perfectDays = 0;
  let missedDays = 0;
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const daysInMonth = endDate.getDate();
  const today = new Date().toISOString().slice(0, 10);

  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const data = dayMap[dateKey];

    if (!data || data.total === 0) {
      days[dateKey] = {
        date: dateKey,
        color: 'empty',
        takenCount: 0,
        totalCount: 0,
        missedCount: 0,
        disciplinePercent: 0,
      };
      tempStreak = 0;
      continue;
    }

    const color = getDayColor(data.taken, data.total, data.missed);
    const disciplinePercent = Math.round((data.taken / data.total) * 100);

    days[dateKey] = {
      date: dateKey,
      color,
      takenCount: data.taken,
      totalCount: data.total,
      missedCount: data.missed,
      disciplinePercent,
    };

    totalTaken += data.taken;
    totalMissed += data.missed;
    totalRecords += data.total;

    if (color === 'green') {
      perfectDays++;
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
      if (dateKey <= today) currentStreak = tempStreak;
    } else {
      missedDays++;
      tempStreak = 0;
    }
  }

  return NextResponse.json({
    data: {
      days,
      stats: {
        disciplinePercent: totalRecords > 0 ? Math.round((totalTaken / totalRecords) * 100) : 0,
        totalDays: daysInMonth,
        perfectDays,
        missedDays,
        longestStreak,
        currentStreak,
      },
    },
  });
}
