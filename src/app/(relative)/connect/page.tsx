/**
 * @file page.tsx
 * @description Страница ввода инвайт-кода для родственника — подключение к пациенту.
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { ConnectForm } from '@/components/relative/connect-form';
import { UsersIcon } from '@/components/shared/nav-icons';

export const metadata: Metadata = {
  title: 'Подключиться к пациенту — MemoMed AI',
};

export default async function ConnectPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const connections = await prisma.connection.findMany({
    where: { relativeId: session.user.id },
    include: {
      patient: {
        select: {
          id: true,
          email: true,
          profile: { select: { fullName: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const active = connections.filter((c) => c.status === 'active');
  const pending = connections.filter((c) => c.status === 'pending');

  return (
    <div className="med-page med-animate">
      <h1 className="text-2xl font-black text-[#0D1B2A] mb-2">Подключиться к пациенту</h1>
      <p className="text-slate-500 text-sm mb-6">Введите код, который вам передал пациент</p>

      {/* Форма */}
      <div className="med-card p-6 mb-6 space-y-5">
        <ConnectForm />

        <div className="bg-blue-50 rounded-2xl p-4 space-y-2">
          <p className="text-sm font-semibold text-[#1565C0]">💡 Как получить код?</p>
          <p className="text-sm text-slate-500">
            Попросите пациента открыть раздел «Мой код» в приложении и скопировать код.
          </p>
        </div>
      </div>

      {/* Подключённые пациенты */}
      {connections.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#0D1B2A]">Мои пациенты</h2>
            <span className="text-sm text-slate-400">{active.length} активных</span>
          </div>
          <ul className="space-y-2">
            {active.map((conn) => {
              const name = conn.patient.profile?.fullName ?? conn.patient.email;
              return (
                <li key={conn.id}>
                  <Link
                    href={`/patients/${conn.patient.id}`}
                    className="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl
                      border border-slate-100 hover:border-indigo-300 transition-all"
                  >
                    <div
                      className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center
                      justify-center text-sm font-bold text-indigo-600 flex-shrink-0"
                    >
                      {(name?.[0] ?? '?').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0D1B2A] text-sm truncate">{name}</p>
                      <p className="text-sm text-slate-400">
                        С {new Date(conn.createdAt).toLocaleDateString('ru')}
                      </p>
                    </div>
                    <span
                      className="text-sm px-2 py-1 bg-green-100 text-green-700
                      rounded-lg font-semibold"
                    >
                      Активен
                    </span>
                  </Link>
                </li>
              );
            })}
            {pending.map((conn) => {
              const name = conn.patient.profile?.fullName ?? conn.patient.email;
              return (
                <li
                  key={conn.id}
                  className="flex items-center gap-3 px-4 py-3 bg-amber-50 rounded-2xl
                    border border-amber-100"
                >
                  <div
                    className="w-10 h-10 rounded-xl bg-amber-100 flex items-center
                    justify-center text-sm font-bold text-amber-600 flex-shrink-0"
                  >
                    ⏳
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#0D1B2A] text-sm truncate">{name}</p>
                    <p className="text-sm text-slate-400">Ожидает подтверждения</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {connections.length === 0 && (
        <div className="flex flex-col items-center py-10 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
            <UsersIcon className="w-7 h-7 text-slate-300" />
          </div>
          <p className="text-slate-400 text-sm">
            Введите код, чтобы подключиться к первому пациенту
          </p>
        </div>
      )}
    </div>
  );
}
