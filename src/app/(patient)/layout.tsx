/**
 * @file layout.tsx
 * @description Layout для страниц пациента: sidebar как у администратора (десктоп + мобильный бургер)
 * @dependencies next-auth, PatientSidebar, OfflineIndicator, OnboardingGate
 * @created 2026-02-22
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { PatientSidebar } from '@/components/patient/patient-sidebar';
import { OfflineIndicator } from '@/components/shared/offline-indicator';
import { OnboardingGate } from '@/components/onboarding/onboarding-gate';

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect('/login');
  if (session.user.role === 'relative') redirect('/feed');
  if (session.user.role === 'doctor') redirect('/doctor/dashboard');
  if (session.user.role === 'admin') redirect('/admin');

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { onboardingDone: true },
  });
  const onboardingDone = profile?.onboardingDone ?? false;

  return (
    <OnboardingGate onboardingDone={onboardingDone}>
      <div className="min-h-screen bg-[#F0F4F8] flex">
        <OfflineIndicator />
        <PatientSidebar />

        {/* Основной контент — pt для хедера на мобильных, ml для sidebar на десктопе */}
        <main className="flex-1 p-4 sm:p-6 pt-20 lg:pt-8 lg:pl-8 lg:ml-60 lg:max-w-[calc(100vw-240px)]">
          {children}
        </main>
      </div>
    </OnboardingGate>
  );
}
