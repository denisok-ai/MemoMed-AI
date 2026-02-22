/**
 * @file actions.ts
 * @description Server Action для отметки завершения онбординга
 * @dependencies prisma, next-auth
 * @created 2026-02-22
 */

'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

/**
 * Отмечает онбординг как завершённый в профиле пользователя.
 * Флаг onboardingDone = true.
 */
export async function markOnboardingDoneAction(): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  await prisma.profile.updateMany({
    where: { userId: session.user.id },
    data: { onboardingDone: true },
  });

  revalidatePath('/dashboard');
  revalidatePath('/feed');
}
