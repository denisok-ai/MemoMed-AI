/**
 * @file page.tsx
 * @description Дневник самочувствия: список с пагинацией, цветовые индикаторы, числовые шкалы.
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { BookIcon, PlusIcon } from '@/components/shared/nav-icons';

export const metadata: Metadata = {
  title: 'Дневник самочувствия — MemoMed AI',
};

const PAGE_SIZE = 10;

function entryWellbeing(entry: {
  moodScore: number | null;
  painLevel: number | null;
  sleepQuality: number | null;
  energyLevel: number | null;
}): { avg: number; label: string; bg: string; border: string; badge: string } {
  // Шкала 1-5: инвертируем боль (5=нет боли → хорошо)
  const values = [
    entry.moodScore,
    entry.painLevel !== null ? 6 - (entry.painLevel ?? 0) : null,
    entry.sleepQuality,
    entry.energyLevel,
  ].filter((v): v is number => v !== null);

  const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 3;

  if (avg >= 4)
    return {
      avg,
      label: 'Хорошо',
      bg: 'bg-green-50',
      border: 'border-green-100',
      badge: 'bg-green-100 text-green-700',
    };
  if (avg >= 2.5)
    return {
      avg,
      label: 'Нормально',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      badge: 'bg-amber-100 text-amber-700',
    };
  return {
    avg,
    label: 'Плохо',
    bg: 'bg-red-50',
    border: 'border-red-100',
    badge: 'bg-red-100 text-red-700',
  };
}

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1'));

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [total, entries, todayEntry] = await Promise.all([
    prisma.healthJournal.count({ where: { patientId: session.user.id } }),
    prisma.healthJournal.findMany({
      where: { patientId: session.user.id },
      orderBy: { logDate: 'desc' },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.healthJournal.findFirst({
      where: { patientId: session.user.id, logDate: new Date(todayStr + 'T00:00:00.000Z') },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="med-page med-animate">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#0D1B2A]">Дневник самочувствия</h1>
          {total > 0 && (
            <p className="text-slate-500 text-sm mt-0.5">
              {total} {total === 1 ? 'запись' : 'записей'}
            </p>
          )}
        </div>
      </div>

      {/* Кнопка сегодняшней записи */}
      <Link
        href={`/journal/${todayStr}`}
        className={`block p-5 rounded-2xl border-2 transition-all mb-6
          ${
            todayEntry
              ? 'border-[#1565C0] bg-[#E3F2FD]'
              : 'border-dashed border-slate-300 bg-white hover:border-[#1565C0]'
          }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center
            ${todayEntry ? 'bg-[#1565C0]' : 'bg-slate-100'}`}
          >
            {todayEntry ? (
              <BookIcon className="w-6 h-6 text-white" />
            ) : (
              <PlusIcon className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <div>
            <p
              className={`text-base font-bold ${todayEntry ? 'text-[#1565C0]' : 'text-[#0D1B2A]'}`}
            >
              {todayEntry ? '✓ Сегодняшняя запись готова' : 'Записать самочувствие за сегодня'}
            </p>
            <p className="text-sm text-slate-400">
              {new Date(todayStr + 'T00:00:00').toLocaleDateString('ru-RU', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
          </div>
          {!todayEntry && <span className="ml-auto text-slate-300 text-xl">→</span>}
        </div>
      </Link>

      {/* Список записей */}
      {total === 0 ? (
        <div className="med-card flex flex-col items-center py-16 space-y-4 text-center">
          <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center med-float">
            <BookIcon className="w-10 h-10 text-indigo-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-[#0D1B2A]">Записей ещё нет</p>
            <p className="text-slate-400 text-sm mt-1 max-w-xs">
              Ведите дневник каждый день — это поможет врачу понять ваше состояние
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <ul className="space-y-3 med-stagger">
            {entries.map((entry) => {
              const dateStr = entry.logDate.toISOString().split('T')[0];
              const w = entryWellbeing(entry);

              const SCORES = [
                { label: 'Настроение', icon: '😊', value: entry.moodScore, warn: false },
                { label: 'Боль', icon: '💢', value: entry.painLevel, warn: true },
                { label: 'Сон', icon: '💤', value: entry.sleepQuality, warn: false },
                { label: 'Энергия', icon: '⚡', value: entry.energyLevel, warn: false },
              ].filter((s) => s.value !== null);

              return (
                <li key={entry.id}>
                  <Link
                    href={`/journal/${dateStr}`}
                    className={`block p-4 rounded-2xl border ${w.bg} ${w.border}
                      hover:shadow-sm transition-all`}
                  >
                    {/* Верхняя строка */}
                    <div className="flex items-center justify-between mb-3">
                      <time className="font-bold text-[#0D1B2A]" dateTime={dateStr}>
                        {new Date(dateStr + 'T00:00:00').toLocaleDateString('ru-RU', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </time>
                      <span className={`text-sm px-2.5 py-1 rounded-lg font-semibold ${w.badge}`}>
                        {w.label}
                      </span>
                    </div>

                    {/* Шкалы */}
                    {SCORES.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {SCORES.map((s) => (
                          <div key={s.label} className="bg-white/70 rounded-xl px-3 py-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-slate-500 flex items-center gap-1">
                                <span>{s.icon}</span> {s.label}
                              </span>
                              <span className="text-sm font-bold text-[#0D1B2A]">{s.value}/5</span>
                            </div>
                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full
                                  ${
                                    s.warn
                                      ? (s.value ?? 0) >= 4
                                        ? 'bg-red-500'
                                        : (s.value ?? 0) >= 3
                                          ? 'bg-amber-400'
                                          : 'bg-green-400'
                                      : (s.value ?? 0) >= 4
                                        ? 'bg-green-500'
                                        : (s.value ?? 0) >= 3
                                          ? 'bg-amber-400'
                                          : 'bg-red-400'
                                  }`}
                                style={{ width: `${((s.value ?? 0) / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Заметка */}
                    {entry.freeText && (
                      <p
                        className="mt-2.5 text-sm text-slate-500 bg-white/60 rounded-xl px-3 py-2
                        line-clamp-2 italic"
                      >
                        «{entry.freeText}»
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-slate-400">
                {from}–{to} из {total}
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/journal?page=${page - 1}`}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm
                      hover:border-[#1565C0] transition-colors min-h-[auto]"
                  >
                    ‹ Новее
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/journal?page=${page + 1}`}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm
                      hover:border-[#1565C0] transition-colors min-h-[auto]"
                  >
                    Старше ›
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
