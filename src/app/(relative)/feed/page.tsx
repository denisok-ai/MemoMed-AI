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
    <div className="med-page med-animate">
      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0D1B2A]">Лента событий</h1>
          <p className="text-[#475569] text-base mt-0.5">Приёмы лекарств в реальном времени</p>
        </div>
        <Link
          href="/connect"
          className="med-btn-primary rounded-2xl gap-2 w-full sm:w-auto justify-center"
          aria-label="Подключиться к пациенту"
        >
          <PlusIcon className="w-5 h-5" />
          Пациент
        </Link>
      </div>

      {connectionsCount === 0 ? (
        /* Пустое состояние — med-card, градиентная иконка */
        <div className="med-card flex flex-col items-center justify-center py-16 md:py-20 space-y-6 text-center">
          <div
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600
              flex items-center justify-center shadow-lg shadow-blue-200/50 med-float"
          >
            <UsersIcon className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <p className="text-xl md:text-2xl font-bold text-[#0D1B2A]">
              Нет подключённых пациентов
            </p>
            <p className="text-[#475569] max-w-sm mx-auto text-base">
              Введите инвайт-код от пациента, чтобы следить за приёмом лекарств
            </p>
          </div>
          <Link
            href="/connect"
            className="med-btn-primary rounded-2xl gap-2"
            aria-label="Подключиться к пациенту"
          >
            <PlusIcon className="w-5 h-5" />
            Подключиться к пациенту
          </Link>
        </div>
      ) : (
        <div className="space-y-4 med-animate" style={{ animationDelay: '80ms' }}>
          {/* Бейдж живого обновления — med-badge-info */}
          <div className="med-badge-info inline-flex items-center gap-2 px-4 py-2.5 w-fit">
            <ActivityIcon className="w-4 h-4" />
            <span>Обновляется в реальном времени</span>
            <span className="w-2 h-2 rounded-full bg-[#1565C0] animate-pulse" aria-hidden />
          </div>

          <LiveFeed />
        </div>
      )}
    </div>
  );
}
