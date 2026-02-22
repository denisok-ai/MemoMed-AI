/**
 * @file route.ts
 * @description API: GET /api/medications — список лекарств пациента,
 *              POST /api/medications — создание нового лекарства
 * @dependencies prisma, next-auth, zod
 * @created 2026-02-22
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { createMedicationSchema } from '@/lib/validations/medication.schema';
import { scheduleReminders } from '@/lib/reminders/queue';
import type { ApiResponse } from '@/types';

/** GET /api/medications — получить все активные лекарства текущего пациента */
export async function GET(): Promise<NextResponse> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
  }

  if (session.user.role !== 'patient') {
    return NextResponse.json({ error: 'Доступ разрешён только для пациентов' }, { status: 403 });
  }

  const medications = await prisma.medication.findMany({
    where: {
      patientId: session.user.id,
      isActive: true,
    },
    orderBy: { scheduledTime: 'asc' },
    select: {
      id: true,
      name: true,
      dosage: true,
      instruction: true,
      photoUrl: true,
      scheduledTime: true,
      isActive: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ data: medications });
}

/** POST /api/medications — создать новое лекарство */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
  }

  if (session.user.role !== 'patient') {
    return NextResponse.json({ error: 'Доступ разрешён только для пациентов' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Некорректное тело запроса' }, { status: 400 });
  }

  const parsed = createMedicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Некорректные данные' },
      { status: 400 }
    );
  }

  const medication = await prisma.medication.create({
    data: {
      ...parsed.data,
      patientId: session.user.id,
    },
  });

  await scheduleReminders(
    medication.id,
    medication.patientId,
    medication.name,
    medication.dosage,
    medication.scheduledTime
  ).catch((err) => {
    console.warn('[medications] scheduleReminders failed:', err);
  });

  return NextResponse.json(
    { data: { id: medication.id }, message: 'Лекарство добавлено' },
    { status: 201 }
  );
}
