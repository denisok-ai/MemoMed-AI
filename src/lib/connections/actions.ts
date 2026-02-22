/**
 * @file actions.ts
 * @description Server Actions для управления связями пациент-родственник
 * @dependencies prisma, next-auth, rate-limit
 * @created 2026-02-22
 */

'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { checkRateLimit } from '@/lib/rate-limit';

export interface ConnectActionResult {
  error?: string;
  success?: boolean;
  message?: string;
}

const inviteCodeSchema = z.string().min(8).max(32);

/**
 * Привязывает родственника к пациенту по инвайт-коду.
 * Rate limit: 5 попыток в час.
 */
export async function connectToPatientAction(
  _prevState: ConnectActionResult,
  formData: FormData
): Promise<ConnectActionResult> {
  const session = await auth();

  if (!session?.user) {
    return { error: 'Необходима авторизация' };
  }

  if (session.user.role !== 'relative') {
    return { error: 'Только родственники могут использовать инвайт-коды' };
  }

  const rawCode = String(formData.get('inviteCode') ?? '').toUpperCase().trim();
  const parsed = inviteCodeSchema.safeParse(rawCode);
  if (!parsed.success) {
    return { error: 'Некорректный формат кода' };
  }

  // Rate limiting через Redis (с fallback если Redis недоступен)
  const rl = await checkRateLimit(`link:${session.user.id}`, 5, 3600).catch(() => ({
    allowed: true,
    remaining: 5,
    resetInSeconds: 3600,
  }));

  if (!rl.allowed) {
    return {
      error: `Слишком много попыток. Подождите ${Math.ceil(rl.resetInSeconds / 60)} минут`,
    };
  }

  const patient = await prisma.user.findFirst({
    where: { inviteCode: rawCode, role: 'patient' },
    select: { id: true, profile: { select: { fullName: true } } },
  });

  if (!patient) {
    return { error: 'Пациент с таким кодом не найден. Проверьте код.' };
  }

  if (patient.id === session.user.id) {
    return { error: 'Нельзя подключиться к самому себе' };
  }

  const existing = await prisma.connection.findFirst({
    where: { patientId: patient.id, relativeId: session.user.id },
  });

  if (existing?.status === 'active') {
    return { error: 'Вы уже подключены к этому пациенту' };
  }

  if (existing) {
    await prisma.connection.update({
      where: { id: existing.id },
      data: { status: 'active' },
    });
  } else {
    await prisma.connection.create({
      data: {
        patientId: patient.id,
        relativeId: session.user.id,
        status: 'active',
      },
    });
  }

  revalidatePath('/feed');

  const patientName = patient.profile?.fullName ?? 'пациенту';
  return {
    success: true,
    message: `Вы успешно подключились к ${patientName}`,
  };
}

/**
 * Разрывает связь с пациентом
 */
export async function disconnectFromPatientAction(connectionId: string): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  await prisma.connection.updateMany({
    where: {
      id: connectionId,
      OR: [{ patientId: session.user.id }, { relativeId: session.user.id }],
    },
    data: { status: 'inactive' },
  });

  revalidatePath('/feed');
}
