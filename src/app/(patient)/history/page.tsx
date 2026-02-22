/**
 * @file page.tsx
 * @description История приёма лекарств с пагинацией, фильтрами по статусу и группировкой по дням.
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { ClipboardIcon } from '@/components/shared/nav-icons';

export const metadata: Metadata = {
  title: 'История приёма — MemoMed AI',
};

const PAGE_SIZE = 20;

const STATUS_OPTS = [
  { id: 'all', label: 'Все' },
  { id: 'taken', label: 'Принято' },
  { id: 'missed', label: 'Пропущено' },
  { id: 'pending', label: 'Ожидает' },
] as const;
type StatusOpt = (typeof STATUS_OPTS)[number]['id'];

const STATUS_UI: Record<string, { icon: string; label: string; bg: string; text: string }> = {
  taken: { icon: '✓', label: 'Принято', bg: 'bg-green-100', text: 'text-green-700' },
  missed: { icon: '✗', label: 'Пропущено', bg: 'bg-red-100', text: 'text-red-600' },
  pending: { icon: '○', label: 'Ожидает', bg: 'bg-amber-100', text: 'text-amber-700' },
};

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { page: pageStr, status: rawStatus } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1'));
  const statusFilter: StatusOpt = STATUS_OPTS.find((s) => s.id === rawStatus)?.id ?? 'all';

  const where = {
    medication: { patientId: session.user.id },
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
  };

  const [total, logs] = await Promise.all([
    prisma.medicationLog.count({ where }),
    prisma.medicationLog.findMany({
      where,
      orderBy: { scheduledAt: 'desc' },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      include: { medication: { select: { name: true, dosage: true, scheduledTime: true } } },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  // Группируем логи по дате (для читаемости)
  type LogEntry = (typeof logs)[number];
  const grouped: { dateLabel: string; items: LogEntry[] }[] = [];
  for (const log of logs) {
    const dateKey = log.scheduledAt.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    const last = grouped[grouped.length - 1];
    if (last && last.dateLabel === dateKey) {
      last.items.push(log);
    } else {
      grouped.push({ dateLabel: dateKey, items: [log] });
    }
  }

  function filterHref(s: StatusOpt, p?: number) {
    const sp = new URLSearchParams();
    if (s !== 'all') sp.set('status', s);
    if (p && p > 1) sp.set('page', String(p));
    const q = sp.toString();
    return `/history${q ? `?${q}` : ''}`;
  }

  return (
    <div className="med-page med-animate">
      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-[#0D1B2A]">История приёма</h1>
        {total > 0 && <p className="text-slate-500 text-base mt-0.5">{total} записей</p>}
      </div>

      {/* Фильтры */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
        {STATUS_OPTS.map((opt) => (
          <Link
            key={opt.id}
            href={filterHref(opt.id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap
              transition-all min-h-[48px] flex items-center
              ${statusFilter === opt.id ? 'med-btn-primary' : 'med-btn-secondary'}`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {/* Контент */}
      {total === 0 ? (
        <div className="med-card flex flex-col items-center py-16 space-y-4 text-center">
          <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center med-float">
            <ClipboardIcon className="w-10 h-10 text-slate-300" />
          </div>
          <div>
            <p className="text-xl font-bold text-[#0D1B2A]">
              {statusFilter === 'all' ? 'История пуста' : 'Записей не найдено'}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {statusFilter === 'all'
                ? 'Записи появятся после первого приёма лекарств'
                : `Нет записей со статусом "${STATUS_OPTS.find((s) => s.id === statusFilter)?.label}"`}
            </p>
          </div>
          {statusFilter !== 'all' && (
            <Link href="/history" className="med-btn-primary rounded-xl">
              Показать все
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ dateLabel, items }) => (
            <div key={dateLabel}>
              {/* Разделитель по дате */}
              <div className="flex items-center gap-3 mb-3">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider capitalize">
                  {dateLabel}
                </p>
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-sm text-slate-300">{items.length}</span>
              </div>

              <ul className="space-y-2">
                {items.map((log) => {
                  const ui = STATUS_UI[log.status] ?? STATUS_UI.pending;
                  const timeStr = log.scheduledAt.toLocaleTimeString('ru', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const actualStr = log.actualAt
                    ? log.actualAt.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })
                    : null;

                  return (
                    <li key={log.id}>
                      <div className="med-card flex items-center gap-3 px-4 py-3 hover:shadow-md transition-all">
                        {/* Статус */}
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center
                        text-sm font-bold flex-shrink-0 ${ui.bg} ${ui.text}`}
                        >
                          {ui.icon}
                        </div>

                        {/* Препарат */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#0D1B2A] truncate text-sm">
                            {log.medication.name}
                          </p>
                          <p className="text-sm text-slate-400">{log.medication.dosage}</p>
                        </div>

                        {/* Время */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-mono text-slate-500">план {timeStr}</p>
                          {actualStr && log.status === 'taken' && (
                            <p className="text-sm font-mono text-green-500">факт {actualStr}</p>
                          )}
                          {log.status !== 'taken' && (
                            <p className={`text-sm font-semibold ${ui.text}`}>{ui.label}</p>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Пагинация */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between pt-4">
            <p className="text-sm text-slate-500">
              {from}–{to} из {total}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={filterHref(statusFilter, page - 1)}
                  className="med-btn-secondary rounded-xl"
                >
                  ← Новее
                </Link>
              )}
              {totalPages > 1 && (
                <span className="px-4 py-2.5 text-sm text-slate-500 flex items-center">
                  {page} / {totalPages}
                </span>
              )}
              {page < totalPages && (
                <Link
                  href={filterHref(statusFilter, page + 1)}
                  className="med-btn-secondary rounded-xl"
                >
                  Старше →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
