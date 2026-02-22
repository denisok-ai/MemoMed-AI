/**
 * @file route.ts
 * @description POST /api/journal/sync — пакетная синхронизация записей дневника с offline-устройства.
 * Стратегия: Last Write Wins по полю logDate.
 * @created 2026-02-22
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import type { ApiResponse } from '@/types';

const syncPayloadSchema = z.object({
  entries: z
    .array(
      z.object({
        localId: z.string(),
        logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        moodScore: z.number().int().min(1).max(5).nullable().optional(),
        painLevel: z.number().int().min(1).max(5).nullable().optional(),
        sleepQuality: z.number().int().min(1).max(5).nullable().optional(),
        energyLevel: z.number().int().min(1).max(5).nullable().optional(),
        freeText: z.string().max(2000).nullable().optional(),
      })
    )
    .max(100, 'Максимум 100 записей за раз'),
});

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ synced: number }>>> {
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

  const parsed = syncPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Ошибка валидации' },
      { status: 422 }
    );
  }

  const { entries } = parsed.data;
  let synced = 0;

  for (const entry of entries) {
    await prisma.healthJournal.upsert({
      where: {
        patientId_logDate: {
          patientId: session.user.id,
          logDate: new Date(entry.logDate),
        },
      },
      update: {
        moodScore: entry.moodScore ?? null,
        painLevel: entry.painLevel ?? null,
        sleepQuality: entry.sleepQuality ?? null,
        energyLevel: entry.energyLevel ?? null,
        freeText: entry.freeText ?? null,
        syncStatus: 'synced',
      },
      create: {
        patientId: session.user.id,
        logDate: new Date(entry.logDate),
        moodScore: entry.moodScore ?? null,
        painLevel: entry.painLevel ?? null,
        sleepQuality: entry.sleepQuality ?? null,
        energyLevel: entry.energyLevel ?? null,
        freeText: entry.freeText ?? null,
        syncStatus: 'synced',
      },
    });
    synced++;
  }

  return NextResponse.json({ data: { synced }, message: `Синхронизировано ${synced} записей` });
}
