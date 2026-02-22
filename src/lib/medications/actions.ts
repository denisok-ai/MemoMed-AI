/**
 * @file actions.ts
 * @description Server Actions для управления лекарствами: создание, обновление, удаление
 * @dependencies prisma, next-auth, zod
 * @created 2026-02-22
 */

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { createMedicationSchema, updateMedicationSchema } from '@/lib/validations/medication.schema';

export interface MedicationActionResult {
  error?: string;
  success?: boolean;
}

/**
 * Создать новое лекарство для текущего пациента
 */
export async function createMedicationAction(
  _prevState: MedicationActionResult,
  formData: FormData
): Promise<MedicationActionResult> {
  const session = await auth();

  if (!session?.user || session.user.role !== 'patient') {
    return { error: 'Доступ запрещён' };
  }

  const parsed = createMedicationSchema.safeParse({
    name: formData.get('name'),
    dosage: formData.get('dosage'),
    instruction: formData.get('instruction') || undefined,
    scheduledTime: formData.get('scheduledTime'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Некорректные данные' };
  }

  await prisma.medication.create({
    data: {
      ...parsed.data,
      patientId: session.user.id,
    },
  });

  revalidatePath('/medications');
  revalidatePath('/dashboard');
  redirect('/medications');
}

/**
 * Обновить данные лекарства
 */
export async function updateMedicationAction(
  id: string,
  _prevState: MedicationActionResult,
  formData: FormData
): Promise<MedicationActionResult> {
  const session = await auth();

  if (!session?.user || session.user.role !== 'patient') {
    return { error: 'Доступ запрещён' };
  }

  const existing = await prisma.medication.findFirst({
    where: { id, patientId: session.user.id, isActive: true },
  });

  if (!existing) {
    return { error: 'Лекарство не найдено' };
  }

  const parsed = updateMedicationSchema.safeParse({
    name: formData.get('name') || undefined,
    dosage: formData.get('dosage') || undefined,
    instruction: formData.get('instruction') || undefined,
    scheduledTime: formData.get('scheduledTime') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Некорректные данные' };
  }

  await prisma.medication.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath('/medications');
  revalidatePath('/dashboard');
  redirect('/medications');
}

/**
 * Архивировать лекарство (мягкое удаление)
 */
export async function deleteMedicationAction(id: string): Promise<void> {
  const session = await auth();

  if (!session?.user || session.user.role !== 'patient') return;

  const existing = await prisma.medication.findFirst({
    where: { id, patientId: session.user.id, isActive: true },
  });

  if (!existing) return;

  await prisma.medication.update({
    where: { id },
    data: {
      isActive: false,
      archivedAt: new Date(),
    },
  });

  revalidatePath('/medications');
  revalidatePath('/dashboard');
}
