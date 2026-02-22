/**
 * @file layout.tsx
 * @description Layout для страниц администратора: проверка роли admin
 * Мобильная версия: бургер-меню, скрытие sidebar
 * @created 2026-02-22
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect('/login');
  if (session.user.role !== 'admin') redirect('/dashboard');

  const isDev = process.env.NODE_ENV === 'development' || process.env.ENABLE_DEV_LOGIN === 'true';

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex">
      <AdminSidebar isDev={isDev} />

      {/* Основной контент — pt/pl для бургера на мобильных */}
      <main className="flex-1 p-4 sm:p-6 pt-20 sm:pt-16 pl-16 sm:pl-14 lg:pt-8 lg:pl-8 lg:ml-60 lg:max-w-[calc(100vw-240px)]">
        {children}
      </main>
    </div>
  );
}
