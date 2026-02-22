/**
 * @file page.tsx
 * @description Главная страница родственника в стиле MedTech:
 * живая лента событий приёма лекарств пациентами
 * @dependencies LiveFeed, prisma, next-auth
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { LiveFeed } from '@/components/relative/live-feed';
import { ActivityIcon, PlusIcon, UsersIcon } from '@/components/shared/nav-icons';

export const metadata: Metadata = {
  title: 'Лента событий — MemoMed AI',
};

export default async function FeedPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const connectionsCount = await prisma.connection.count({
    where: { relativeId: session.user.id, status: 'active' },
  });

  return (
    <div className="med-page">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1B2A]">Лента событий</h1>
          <p className="text-[#475569] text-sm mt-0.5">Приёмы лекарств в реальном времени</p>
        </div>
        <Link
          href="/connect"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1565C0] text-white
            rounded-xl font-semibold text-sm hover:bg-[#0D47A1] transition-colors
            shadow-sm shadow-blue-200 min-h-[48px]"
          aria-label="Подключиться к пациенту"
        >
          <PlusIcon className="w-4 h-4" />
          Пациент
        </Link>
      </div>

      {connectionsCount === 0 ? (
        /* Пустое состояние */
        <div
          className="flex flex-col items-center justify-center py-16 space-y-6
          text-center bg-white rounded-3xl border border-dashed border-slate-200"
        >
          <div className="space-y-3">
            <div
              className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center
              justify-center mx-auto"
            >
              <UsersIcon className="w-8 h-8 text-slate-300" />
            </div>
            <div>
              <p className="text-xl font-semibold text-[#0D1B2A]">Нет подключённых пациентов</p>
              <p className="text-[#475569] mt-1.5 max-w-xs mx-auto text-base">
                Введите инвайт-код от пациента, чтобы следить за приёмом лекарств
              </p>
            </div>
          </div>

          <Link
            href="/connect"
            className="flex items-center gap-2 px-6 py-3.5 bg-[#1565C0] text-white
              rounded-xl font-semibold hover:bg-[#0D47A1] transition-colors
              shadow-sm shadow-blue-200"
          >
            <PlusIcon className="w-4 h-4" />
            Подключиться к пациенту
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Заголовок с иконкой живого обновления */}
          <div
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-50
            rounded-xl border border-blue-100 w-fit"
          >
            <ActivityIcon className="w-4 h-4 text-[#1565C0]" />
            <span className="text-sm font-semibold text-[#1565C0]">
              Обновляется в реальном времени
            </span>
            <span className="w-2 h-2 rounded-full bg-[#1565C0] animate-pulse" />
          </div>

          <LiveFeed />
        </div>
      )}
    </div>
  );
}
