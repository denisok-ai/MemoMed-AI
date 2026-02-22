/**
 * @file page.tsx
 * @description Главная страница родственника — живая лента событий через SSE
 * @dependencies LiveFeed, prisma, next-auth
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { LiveFeed } from '@/components/relative/live-feed';

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
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#212121]">Лента событий</h1>
        <Link
          href="/connect"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#7e57c2] text-white
            rounded-xl font-medium text-sm hover:bg-[#6a3fb5] transition-colors min-h-[48px]"
          aria-label="Подключиться к пациенту"
        >
          + Пациент
        </Link>
      </div>

      {connectionsCount === 0 ? (
        <div className="text-center py-16 space-y-4">
          <p className="text-5xl" aria-hidden="true">👥</p>
          <p className="text-xl text-[#757575]">Нет подключённых пациентов</p>
          <p className="text-base text-[#9e9e9e]">
            Введите инвайт-код от пациента, чтобы следить за приёмом лекарств
          </p>
          <Link
            href="/connect"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#7e57c2] text-white
              rounded-2xl text-lg font-semibold hover:bg-[#6a3fb5] transition-colors"
          >
            Подключиться
          </Link>
        </div>
      ) : (
        <LiveFeed />
      )}
    </div>
  );
}
