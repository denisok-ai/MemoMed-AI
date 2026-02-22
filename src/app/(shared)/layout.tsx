/**
 * @file layout.tsx
 * @description Layout для общих страниц (доступны и пациентам, и родственникам).
 * Включает Header и BottomNav с автоопределением роли.
 * @created 2026-02-22
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { Header } from '@/components/shared/header';
import { BottomNav } from '@/components/shared/bottom-nav';
import { OfflineIndicator } from '@/components/shared/offline-indicator';

export default async function SharedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { fullName: true },
  });

  const userRole = (session.user.role === 'relative' ? 'relative' : 'patient') as
    | 'patient'
    | 'relative';
  const displayName = profile?.fullName ?? session.user.name ?? undefined;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <OfflineIndicator />
      <Header userRole={userRole} userName={displayName} />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <BottomNav userRole={userRole} />
    </div>
  );
}
