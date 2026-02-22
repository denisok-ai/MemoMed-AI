/**
 * @file route.ts
 * @description API: POST /api/logs — создание записи о приёме лекарства (иммутабельной),
 *              POST /api/logs/sync — пакетная загрузка офлайн-логов
 * @dependencies prisma, next-auth
 * @created 2026-02-22
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { cancelReminders } from '@/lib/reminders/queue';
import type { ApiResponse } from '@/types';

/** Схема создания лога приёма */
const createLogSchema = z.object({
  medicationId: z.string().uuid('Некорректный идентификатор лекарства'),
  scheduledAt: z.string().datetime('Некорректный формат времени'),
  actualAt: z.string().datetime('Некорректный формат времени').optional(),
  status: z.enum(['taken', 'missed', 'pending']).default('taken'),
});

/** POST /api/logs — записать факт приёма лекарства */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Некорректное тело запроса' }, { status: 400 });
  }

  const parsed = createLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Некорректные данные' },
      { status: 400 }
    );
  }

  // Проверяем, что лекарство принадлежит пользователю
  const medication = await prisma.medication.findFirst({
    where: {
      id: parsed.data.medicationId,
      patientId: session.user.id,
      isActive: true,
    },
  });

  if (!medication) {
    return NextResponse.json({ error: 'Лекарство не найдено' }, { status: 404 });
  }

  const log = await prisma.medicationLog.create({
    data: {
      medicationId: parsed.data.medicationId,
      scheduledAt: new Date(parsed.data.scheduledAt),
      actualAt: parsed.data.actualAt ? new Date(parsed.data.actualAt) : new Date(),
      status: parsed.data.status,
      syncStatus: 'synced',
    },
  });

  if (parsed.data.status === 'taken') {
    await cancelReminders(parsed.data.medicationId, parsed.data.scheduledAt).catch((err) => {
      console.warn('[logs] cancelReminders failed:', err);
    });
  }

  return NextResponse.json({ data: { id: log.id }, message: 'Приём записан' }, { status: 201 });
}
