/**
 * @file layout.tsx
 * @description Layout для страниц родственника: sidebar как у администратора (десктоп + мобильный бургер)
 * @dependencies next-auth, RelativeSidebar
 * @created 2026-02-22
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { RelativeSidebar } from '@/components/relative/relative-sidebar';
import { OfflineIndicator } from '@/components/shared/offline-indicator';

export default async function RelativeLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect('/login');
  if (session.user.role === 'patient') redirect('/dashboard');

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex">
      <OfflineIndicator />
      <RelativeSidebar />

      {/* Основной контент — pt/pl для бургера на мобильных, ml для sidebar на десктопе */}
      <main className="flex-1 p-4 sm:p-6 pt-20 sm:pt-16 pl-16 sm:pl-14 lg:pt-8 lg:pl-8 lg:ml-60 lg:max-w-[calc(100vw-240px)]">
        {children}
      </main>
    </div>
  );
}
