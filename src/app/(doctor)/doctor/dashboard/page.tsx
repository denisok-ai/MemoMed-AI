/**
 * @file page.tsx
 * @description Дашборд врача: список пациентов с фильтром по дисциплине, пагинацией, поиском.
 * @created 2026-02-22
 */

import { MedicationLogStatus } from '@prisma/client';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { UsersIcon, ChevronRightIcon, PillIcon, SearchIcon } from '@/components/shared/nav-icons';

export const metadata: Metadata = {
  title: 'Мои пациенты — MemoMed AI',
};

const PAGE_SIZE = 12;

const FILTER_OPTS = [
  { id: 'all', label: 'Все' },
  { id: 'good', label: '≥ 90%' },
  { id: 'medium', label: '70–89%' },
  { id: 'bad', label: '< 70%' },
  { id: 'nodata', label: 'Нет данных' },
] as const;
type FilterOpt = (typeof FILTER_OPTS)[number]['id'];

function DisciplineBadge({ pct }: { pct: number | undefined }) {
  if (pct === undefined) return <span className="text-xl font-black text-slate-300">—</span>;
  const { color, bg, border, label } =
    pct >= 90
      ? { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', label: 'Отлично' }
      : pct >= 70
        ? {
            color: 'text-amber-700',
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            label: 'Средне',
          }
        : { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', label: 'Внимание' };

  return (
    <div className={`flex flex-col items-center px-3 py-2 rounded-xl border ${bg} ${border}`}>
      <span className={`text-2xl font-black ${color}`}>{pct}%</span>
      <span className={`text-sm font-semibold ${color} mt-0.5`}>{label}</span>
    </div>
  );
}

export default async function DoctorDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; filter?: string; q?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'doctor' && session.user.role !== 'admin') redirect('/dashboard');

  const { page: pageStr, filter: rawFilter, q: rawQ } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1'));
  const filter: FilterOpt = FILTER_OPTS.find((f) => f.id === rawFilter)?.id ?? 'all';
  const query = rawQ?.trim() ?? '';

  const allConnections = await prisma.connection.findMany({
    where: { relativeId: session.user.id, status: 'active' },
    include: {
      patient: {
        select: {
          id: true,
          email: true,
          profile: { select: { fullName: true, dateOfBirth: true } },
          medications: { where: { isActive: true }, select: { id: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const patientIds = allConnections.map((c) => c.patientId);
  const logsRaw = await prisma.medicationLog.findMany({
    where: {
      medication: { patientId: { in: patientIds } },
      scheduledAt: { gte: since },
      status: { in: [MedicationLogStatus.taken, MedicationLogStatus.missed] },
    },
    select: { status: true, medication: { select: { patientId: true } } },
  });

  const logMap = new Map<string, { taken: number; total: number }>();
  for (const log of logsRaw) {
    const pid = log.medication.patientId;
    const cur = logMap.get(pid) ?? { taken: 0, total: 0 };
    cur.total++;
    if (log.status === 'taken') cur.taken++;
    logMap.set(pid, cur);
  }

  const disciplineMap = new Map<string, number>();
  for (const [pid, data] of logMap) {
    disciplineMap.set(pid, data.total > 0 ? Math.round((data.taken / data.total) * 100) : 0);
  }

  // Фильтрация
  let filtered = allConnections;

  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter((c) => {
      const name = c.patient.profile?.fullName ?? c.patient.email ?? '';
      return name.toLowerCase().includes(q);
    });
  }

  if (filter !== 'all') {
    filtered = filtered.filter((c) => {
      const pct = disciplineMap.get(c.patientId);
      if (filter === 'nodata') return pct === undefined;
      if (filter === 'good') return pct !== undefined && pct >= 90;
      if (filter === 'medium') return pct !== undefined && pct >= 70 && pct < 90;
      if (filter === 'bad') return pct !== undefined && pct < 70;
      return true;
    });
  }

  const totalFiltered = filtered.length;
  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const from = totalFiltered === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, totalFiltered);

  function href(params: { page?: number; filter?: FilterOpt; q?: string }) {
    const sp = new URLSearchParams();
    if (params.filter && params.filter !== 'all') sp.set('filter', params.filter);
    if (params.q) sp.set('q', params.q);
    if (params.page && params.page > 1) sp.set('page', String(params.page));
    const q = sp.toString();
    return `/doctor/dashboard${q ? `?${q}` : ''}`;
  }

  return (
    <div className="med-page med-animate">
      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0D1B2A]">Мои пациенты</h1>
          <p className="text-slate-500 text-base mt-0.5">Дисциплина приёма лекарств за 30 дней</p>
        </div>
        <div className="med-badge-info inline-flex items-center gap-2 px-4 py-2.5 w-fit">
          <UsersIcon className="w-4 h-4" />
          <span>{allConnections.length}</span>
        </div>
      </div>

      {/* Поиск */}
      <form method="GET" className="mb-4">
        {filter !== 'all' && <input type="hidden" name="filter" value={filter} />}
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Поиск по имени пациента..."
            className="med-input pl-12"
          />
        </div>
      </form>

      {/* Фильтры — pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
        {FILTER_OPTS.map((opt) => (
          <Link
            key={opt.id}
            href={href({ filter: opt.id, q: query || undefined })}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap
              transition-all min-h-[48px] flex items-center
              ${filter === opt.id ? 'med-btn-primary' : 'med-btn-secondary'}`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {/* Список пациентов */}
      {allConnections.length === 0 ? (
        <div className="med-card flex flex-col items-center justify-center py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center">
            <UsersIcon className="w-8 h-8 text-slate-300" />
          </div>
          <div>
            <p className="text-lg font-semibold text-[#0D1B2A]">Нет подключённых пациентов</p>
            <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
              Попросите пациента поделиться инвайт-кодом
            </p>
          </div>
          <Link href="/doctor/connect" className="med-btn-primary rounded-2xl">
            Подключить пациента
          </Link>
        </div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="text-lg font-semibold text-[#0D1B2A]">Ничего не найдено</p>
          <p className="text-sm mt-1">Попробуйте изменить поиск или фильтр</p>
          <Link
            href="/doctor/dashboard"
            className="mt-4 inline-block px-4 py-2 bg-slate-100 rounded-xl text-sm
              text-slate-600 hover:bg-slate-200 transition-colors min-h-[auto]"
          >
            Сбросить
          </Link>
        </div>
      ) : (
        <>
          <ul className="space-y-3" role="list">
            {paginated.map((c) => {
              const pct = disciplineMap.get(c.patientId);
              const name = c.patient.profile?.fullName ?? c.patient.email;
              const medCount = c.patient.medications.length;

              return (
                <li key={c.id}>
                  <Link
                    href={`/doctor/patients/${c.patientId}`}
                    className="med-card flex items-center gap-4 p-5
                      hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                  >
                    <div
                      className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100
                      flex items-center justify-center flex-shrink-0"
                    >
                      <span className="text-lg font-bold text-[#1565C0]">
                        {(name?.[0] ?? '?').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-semibold text-[#0D1B2A] truncate
                        group-hover:text-[#1565C0] transition-colors"
                      >
                        {name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <PillIcon className="w-3.5 h-3.5 text-slate-400" />
                        <p className="text-sm text-slate-400">
                          {medCount} {medCount === 1 ? 'препарат' : 'препаратов'}
                        </p>
                      </div>
                    </div>
                    <DisciplineBadge pct={pct} />
                    <ChevronRightIcon
                      className="w-4 h-4 text-slate-300
                      group-hover:text-[#1565C0] transition-colors flex-shrink-0"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Пагинация */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mt-6">
            <p className="text-sm text-slate-500">
              {from}–{to} из {totalFiltered}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={href({ page: page - 1, filter, q: query || undefined })}
                  className="med-btn-secondary rounded-xl"
                >
                  ←
                </Link>
              )}
              {totalPages > 1 && (
                <span className="px-4 py-2.5 text-sm text-slate-500 flex items-center">
                  {page} / {totalPages}
                </span>
              )}
              {page < totalPages && (
                <Link
                  href={href({ page: page + 1, filter, q: query || undefined })}
                  className="med-btn-secondary rounded-xl"
                >
                  →
                </Link>
              )}
            </div>
          </div>

          {/* Легенда */}
          <div className="mt-4 med-card p-4">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Легенда
            </p>
            <div className="flex gap-4 flex-wrap">
              {[
                { color: 'text-green-700', bg: 'bg-green-50', label: '≥ 90%', desc: 'Отлично' },
                { color: 'text-amber-700', bg: 'bg-amber-50', label: '70–89%', desc: 'Средне' },
                { color: 'text-red-700', bg: 'bg-red-50', label: '< 70%', desc: 'Внимание' },
              ].map(({ color, bg, label, desc }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-sm font-bold ${bg} ${color}`}>
                    {label}
                  </span>
                  <span className="text-sm text-slate-500">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
