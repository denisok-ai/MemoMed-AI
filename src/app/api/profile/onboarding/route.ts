/**
 * @file route.ts
 * @description API: POST /api/profile/onboarding — отметка завершения онбординга.
 * @dependencies prisma, next-auth
 * @created 2026-02-22
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: { onboardingDone: true },
    create: {
      userId: session.user.id,
      fullName: session.user.name ?? session.user.email ?? 'Пользователь',
      onboardingDone: true,
    },
  });

  return NextResponse.json({ ok: true });
}
