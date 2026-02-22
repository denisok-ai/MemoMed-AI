/**
 * @file route.ts
 * @description API дневника самочувствия.
 *   GET  /api/journal?from=YYYY-MM-DD&to=YYYY-MM-DD — список записей
 *   POST /api/journal — создание / обновление записи (upsert по logDate)
 * @created 2026-02-22
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { journalEntrySchema } from '@/lib/validations/journal.schema';
import type { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const entries = await prisma.healthJournal.findMany({
    where: {
      patientId: session.user.id,
      ...(from && to
        ? {
            logDate: {
              gte: new Date(from),
              lte: new Date(to),
            },
          }
        : {}),
    },
    orderBy: { logDate: 'desc' },
    take: 90, // максимум 3 месяца
  });

  return NextResponse.json({ data: entries });
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Некорректный JSON' }, { status: 400 });
  }

  const parsed = journalEntrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Ошибка валидации' },
      { status: 422 }
    );
  }

  const { logDate, moodScore, painLevel, sleepQuality, energyLevel, freeText } = parsed.data;

  const entry = await prisma.healthJournal.upsert({
    where: {
      patientId_logDate: {
        patientId: session.user.id,
        logDate: new Date(logDate),
      },
    },
    update: {
      moodScore: moodScore ?? null,
      painLevel: painLevel ?? null,
      sleepQuality: sleepQuality ?? null,
      energyLevel: energyLevel ?? null,
      freeText: freeText ?? null,
      syncStatus: 'synced',
    },
    create: {
      patientId: session.user.id,
      logDate: new Date(logDate),
      moodScore: moodScore ?? null,
      painLevel: painLevel ?? null,
      sleepQuality: sleepQuality ?? null,
      energyLevel: energyLevel ?? null,
      freeText: freeText ?? null,
      syncStatus: 'synced',
    },
  });

  return NextResponse.json({ data: entry, message: 'Запись сохранена' }, { status: 200 });
}
