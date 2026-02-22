/**
 * @file page.tsx
 * @description Страница статистики и календаря дисциплины для пациента
 * @dependencies CalendarView, prisma, next-auth
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { CalendarView } from '@/components/shared/calendar-view';

export const metadata: Metadata = {
  title: 'Статистика — MemoMed AI',
};

export default async function StatsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-[#212121]">Статистика приёма</h1>
      <CalendarView patientId={session.user.id} />
    </div>
  );
}
