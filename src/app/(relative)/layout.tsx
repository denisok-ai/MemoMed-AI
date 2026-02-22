/**
 * @file layout.tsx
 * @description Layout для страниц родственника: проверка роли + Header + BottomNav
 * @dependencies next-auth, Header, BottomNav
 * @created 2026-02-22
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Header } from '@/components/shared/header';
import { BottomNav } from '@/components/shared/bottom-nav';
import { OfflineIndicator } from '@/components/shared/offline-indicator';

export default async function RelativeLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role === 'patient') {
    redirect('/dashboard');
  }

  const userName = session.user.name ?? undefined;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <OfflineIndicator />
      <Header userRole="relative" userName={userName} />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <BottomNav userRole="relative" />
    </div>
  );
}
