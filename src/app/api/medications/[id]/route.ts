/**
 * @file route.ts
 * @description API: PATCH /api/medications/:id — редактирование,
 *              DELETE /api/medications/:id — архивирование (soft delete)
 * @dependencies prisma, next-auth, zod
 * @created 2026-02-22
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { updateMedicationSchema } from '@/lib/validations/medication.schema';
import type { ApiResponse } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** Проверяет, что лекарство принадлежит текущему пользователю */
async function getMedicationOrFail(id: string, patientId: string) {
  const medication = await prisma.medication.findFirst({
    where: { id, patientId, isActive: true },
  });
  return medication;
}

/** PATCH /api/medications/:id — обновить данные лекарства */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
  }

  const { id } = await params;
  const medication = await getMedicationOrFail(id, session.user.id);

  if (!medication) {
    return NextResponse.json({ error: 'Лекарство не найдено' }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Некорректное тело запроса' }, { status: 400 });
  }

  const parsed = updateMedicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Некорректные данные' },
      { status: 400 }
    );
  }

  await prisma.medication.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ message: 'Лекарство обновлено' });
}

/** DELETE /api/medications/:id — архивировать лекарство (не удалять из БД) */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
  }

  const { id } = await params;
  const medication = await getMedicationOrFail(id, session.user.id);

  if (!medication) {
    return NextResponse.json({ error: 'Лекарство не найдено' }, { status: 404 });
  }

  await prisma.medication.update({
    where: { id },
    data: {
      isActive: false,
      archivedAt: new Date(),
    },
  });

  return NextResponse.json({ message: 'Лекарство архивировано' });
}
