/**
 * @file page.tsx
 * @description Страница ввода инвайт-кода для родственника — подключение к пациенту.
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ConnectionStatus } from '@prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { ConnectForm } from '@/components/relative/connect-form';
import { Pagination } from '@/components/shared/pagination';
import { UsersIcon, InfoIcon } from '@/components/shared/nav-icons';

export const metadata: Metadata = {
  title: 'Подключиться к пациенту — MemoMed AI',
};

const PAGE_SIZE = 10;

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { page: pageStr, status: statusFilter } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1'));
  const skip = (page - 1) * PAGE_SIZE;

  const where = statusFilter
    ? { relativeId: session.user.id, status: statusFilter as ConnectionStatus }
    : {
        relativeId: session.user.id,
        status: { in: [ConnectionStatus.active, ConnectionStatus.pending] },
      };

  const [connections, total, activeCount] = await Promise.all([
    prisma.connection.findMany({
      where,
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
      take: PAGE_SIZE,
      skip,
    }),
    prisma.connection.count({ where }),
    prisma.connection.count({ where: { relativeId: session.user.id, status: 'active' } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const active = connections.filter((c) => c.status === 'active');
  const pending = connections.filter((c) => c.status === 'pending');

  return (
    <div className="med-page med-animate">
      <h1 className="text-2xl md:text-3xl font-black text-[#0D1B2A] mb-2">
        Подключиться к пациенту
      </h1>
      <p className="text-slate-500 text-base mb-6">Введите код, который вам передал пациент</p>

      {/* Форма */}
      <div className="med-card p-6 mb-6 space-y-5">
        <ConnectForm />

        <div className="med-card-accent p-4 space-y-2">
          <p className="text-sm font-bold text-[#1565C0] flex items-center gap-2">
            <InfoIcon className="w-4 h-4 shrink-0" aria-hidden />
            Как получить код?
          </p>
          <p className="text-sm text-slate-500">
            Попросите пациента открыть раздел «Мой код» в приложении и скопировать код.
          </p>
        </div>
      </div>

      {/* Подключённые пациенты — med-card-accent */}
      {(total > 0 || activeCount > 0) && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-base font-bold text-[#0D1B2A]">Мои пациенты</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-500">{activeCount} активных</span>
              <div className="flex gap-1">
                {[
                  { value: '', label: 'Все' },
                  { value: 'active', label: 'Активные' },
                  { value: 'pending', label: 'Ожидают' },
                ].map((f) => (
                  <Link
                    key={f.value}
                    href={`/connect${f.value ? `?status=${f.value}` : ''}`}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors
                      ${
                        (!statusFilter && !f.value) || statusFilter === f.value
                          ? 'bg-[#1565C0] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {f.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <ul className="space-y-3 med-stagger">
            {total === 0 && statusFilter ? (
              <li className="med-card p-6 text-center text-slate-500">
                Нет подключений с выбранным статусом
              </li>
            ) : (
              <>
                {active.map((conn) => {
                  const name = conn.patient.profile?.fullName ?? conn.patient.email;
                  return (
                    <li key={conn.id}>
                      <Link
                        href={`/patients/${conn.patient.id}`}
                        className="med-card-accent flex items-center gap-3 px-4 py-4
                          hover:translate-x-1 transition-all group"
                      >
                        <div
                          className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600
                            flex items-center justify-center text-lg font-bold text-white flex-shrink-0
                            shadow-md group-hover:shadow-lg transition-shadow"
                        >
                          {(name?.[0] ?? '?').toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[#0D1B2A] text-base truncate group-hover:text-[#1565C0] transition-colors">
                            {name}
                          </p>
                          <p className="text-sm text-slate-500">
                            С {new Date(conn.createdAt).toLocaleDateString('ru')}
                          </p>
                        </div>
                        <span className="med-badge-success">Активен</span>
                      </Link>
                    </li>
                  );
                })}
                {pending.map((conn) => {
                  const name = conn.patient.profile?.fullName ?? conn.patient.email;
                  return (
                    <li key={conn.id}>
                      <div
                        className="med-card flex items-center gap-3 px-4 py-4
                          border-l-4 border-amber-400"
                      >
                        <div
                          className="w-12 h-12 rounded-xl bg-amber-100 flex items-center
                          justify-center flex-shrink-0"
                        >
                          <InfoIcon className="w-6 h-6 text-amber-600" aria-hidden />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[#0D1B2A] text-base truncate">{name}</p>
                          <p className="text-sm text-slate-500">Ожидает подтверждения</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </>
            )}
          </ul>
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={PAGE_SIZE}
              buildHref={(p) =>
                `/connect?page=${p}${statusFilter ? `&status=${statusFilter}` : ''}`
              }
            />
          )}
        </div>
      )}

      {total === 0 && (
        <div className="med-card flex flex-col items-center py-12 text-center space-y-4">
          <div
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-500
              flex items-center justify-center shadow-md"
          >
            <UsersIcon className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-500 text-base">
            Введите код, чтобы подключиться к первому пациенту
          </p>
        </div>
      )}
    </div>
  );
}
