/**
 * @file page.tsx
 * @description Страница онбординга — показывается при первом входе.
 * Если онбординг уже пройден — редирект на dashboard.
 * @dependencies OnboardingWizard, prisma, next-auth
 * @created 2026-02-22
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { OnboardingClient } from './onboarding-client';

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { onboardingDone: true },
  });

  if (profile?.onboardingDone) {
    const target = session.user.role === 'relative' ? '/feed' : '/dashboard';
    redirect(target);
  }

  return <OnboardingClient />;
}
