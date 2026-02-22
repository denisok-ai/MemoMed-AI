/**
 * @file log-actions.ts
 * @description Server Action: запись факта приёма лекарства
 * @dependencies prisma, next-auth
 * @created 2026-02-22
 */

'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export interface TakeMedicationResult {
  success: boolean;
  error?: string;
  logId?: string;
}

/**
 * Записывает факт приёма лекарства.
 * Логи иммутабельны — никогда не обновляются и не удаляются.
 */
export async function takeMedicationAction(
  medicationId: string,
  scheduledAt: string
): Promise<TakeMedicationResult> {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: 'Необходима авторизация' };
  }

  // Проверяем принадлежность лекарства
  const medication = await prisma.medication.findFirst({
    where: {
      id: medicationId,
      patientId: session.user.id,
      isActive: true,
    },
  });

  if (!medication) {
    return { success: false, error: 'Лекарство не найдено' };
  }

  const log = await prisma.medicationLog.create({
    data: {
      medicationId,
      scheduledAt: new Date(scheduledAt),
      actualAt: new Date(),
      status: 'taken',
      syncStatus: 'synced',
    },
  });

  revalidatePath('/dashboard');
  revalidatePath('/');

  return { success: true, logId: log.id };
}
