/**
 * @file layout.tsx
 * @description Layout для общих страниц (chat, onboarding): sidebar как у администратора
 * @dependencies next-auth, SidebarByRole
 * @created 2026-02-22
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { SidebarByRole } from '@/components/shared/sidebar-by-role';
import { OfflineIndicator } from '@/components/shared/offline-indicator';

export default async function SharedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect('/login');
  if (session.user.role === 'admin') redirect('/admin');

  const userRole = (
    session.user.role === 'doctor'
      ? 'doctor'
      : session.user.role === 'relative'
        ? 'relative'
        : 'patient'
  ) as 'patient' | 'relative' | 'doctor';

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex">
      <OfflineIndicator />
      <SidebarByRole userRole={userRole} />

      {/* Основной контент */}
      <main className="flex-1 p-4 sm:p-6 pt-20 sm:pt-16 pl-16 sm:pl-14 lg:pt-8 lg:pl-8 lg:ml-60 lg:max-w-[calc(100vw-240px)]">
        {children}
      </main>
    </div>
  );
}
