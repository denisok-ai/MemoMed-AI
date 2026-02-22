/**
 * @file route.ts
 * @description API: POST /api/logs/sync — пакетная синхронизация офлайн-логов
 * Реализует стратегию Last Write Wins по полю createdAt
 * @dependencies prisma, next-auth
 * @created 2026-02-22
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { cancelReminders } from '@/lib/reminders/queue';
import type { ApiResponse } from '@/types';

const syncLogsSchema = z.object({
  logs: z
    .array(
      z.object({
        localId: z.string(),
        medicationId: z.string().uuid(),
        scheduledAt: z.string().datetime(),
        actualAt: z.string().datetime().optional(),
        status: z.enum(['taken', 'missed', 'pending']),
        createdAt: z.string().datetime(),
      })
    )
    .max(100, 'Максимум 100 записей за раз'),
});

interface SyncResult {
  synced: string[];
  failed: string[];
}

/** POST /api/logs/sync — пакетная загрузка офлайн-логов */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<SyncResult>>> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Некорректное тело запроса' }, { status: 400 });
  }

  const parsed = syncLogsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Некорректные данные' },
      { status: 400 }
    );
  }

  // Получаем все ID лекарств пользователя для валидации
  const userMedications = await prisma.medication.findMany({
    where: { patientId: session.user.id },
    select: { id: true },
  });
  const validMedIds = new Set(userMedications.map((m) => m.id));

  const synced: string[] = [];
  const failed: string[] = [];

  for (const log of parsed.data.logs) {
    if (!validMedIds.has(log.medicationId)) {
      failed.push(log.localId);
      continue;
    }

    try {
      await prisma.medicationLog.create({
        data: {
          medicationId: log.medicationId,
          scheduledAt: new Date(log.scheduledAt),
          actualAt: log.actualAt ? new Date(log.actualAt) : null,
          status: log.status,
          syncStatus: 'synced',
          createdAt: new Date(log.createdAt),
        },
      });
      if (log.status === 'taken') {
        await cancelReminders(log.medicationId, log.scheduledAt).catch((err) => {
          console.warn('[logs/sync] cancelReminders failed:', err);
        });
      }
      synced.push(log.localId);
    } catch {
      failed.push(log.localId);
    }
  }

  return NextResponse.json({
    data: { synced, failed },
    message: `Синхронизировано ${synced.length} записей`,
  });
}
