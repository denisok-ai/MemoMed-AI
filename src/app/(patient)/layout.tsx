/**
 * @file layout.tsx
 * @description Layout для страниц пациента: проверка роли + Header + BottomNav + Онбординг
 * @dependencies next-auth, Header, BottomNav, OfflineIndicator, OnboardingGate
 * @created 2026-02-22
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { Header } from '@/components/shared/header';
import { BottomNav } from '@/components/shared/bottom-nav';
import { OfflineIndicator } from '@/components/shared/offline-indicator';
import { OnboardingGate } from '@/components/onboarding/onboarding-gate';

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role === 'relative') redirect('/feed');
  if (session.user.role === 'doctor') redirect('/doctor/dashboard');
  if (session.user.role === 'admin') redirect('/admin');

  const [userName, profile] = await Promise.all([
    Promise.resolve(session.user.name ?? undefined),
    prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { onboardingDone: true, fullName: true },
    }),
  ]);

  const onboardingDone = profile?.onboardingDone ?? false;
  const displayName = profile?.fullName ?? userName;

  return (
    <OnboardingGate onboardingDone={onboardingDone}>
      <div className="min-h-screen bg-white flex flex-col">
        <OfflineIndicator />
        <Header userRole="patient" userName={displayName} />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <BottomNav userRole="patient" />
      </div>
    </OnboardingGate>
  );
}
