/**
 * @file page.tsx
 * @description Профиль пациента для родственника: геро-карточка, вкладки (обзор/лекарства/дневник),
 * дисциплина по препаратам, последние приёмы, дневник самочувствия.
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { StatsDashboard } from '@/components/shared/stats-dashboard';
import { CalendarView } from '@/components/shared/calendar-view';
import { AdminPillIcon, AdminCheckIcon } from '@/components/admin/admin-icons';
import {
  AlertTriangleIcon,
  BookIcon,
  CheckIcon,
  HeartPulseIcon,
  ActivityIcon,
  XIcon,
} from '@/components/shared/nav-icons';

export const metadata: Metadata = {
  title: 'Пациент — MemoMed AI',
};

const TABS = [
  { id: 'overview', label: 'Обзор' },
  { id: 'medications', label: 'Лекарства' },
  { id: 'journal', label: 'Дневник' },
  { id: 'calendar', label: 'Календарь' },
] as const;
type TabId = (typeof TABS)[number]['id'];

function calcAge(dob: Date | null): number | null {
  if (!dob) return null;
  return Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000));
}

function disciplineColor(pct: number) {
  if (pct >= 85)
    return {
      bar: 'bg-green-500',
      text: 'text-green-700',
      bg: 'bg-green-50',
      border: 'border-green-200',
    };
  if (pct >= 60)
    return {
      bar: 'bg-amber-500',
      text: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    };
  return { bar: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' };
}

function timeLabel(time: string): string {
  const [h] = time.split(':').map(Number);
  if (h < 10) return 'Утро';
  if (h < 14) return 'День';
  if (h < 19) return 'Вечер';
  return 'Ночь';
}

export default async function RelativePatientPage({
  params,
  searchParams,
}: {
  params: Promise<{ patientId: string }>;
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { patientId } = await params;
  const { tab: rawTab, page: pageStr } = await searchParams;
  const tab: TabId = TABS.find((t) => t.id === rawTab)?.id ?? 'overview';
  const page = Math.max(1, parseInt(pageStr ?? '1'));
  const pageSize = 14;

  const connection = await prisma.connection.findFirst({
    where: { patientId, relativeId: session.user.id, status: 'active' },
    include: {
      patient: {
        select: {
          id: true,
          email: true,
          profile: { select: { fullName: true, dateOfBirth: true, timezone: true } },
          medications: {
            where: { isActive: true },
            orderBy: { scheduledTime: 'asc' },
            select: { id: true, name: true, dosage: true, scheduledTime: true, instruction: true },
          },
        },
      },
    },
  });

  if (!connection) notFound();

  const patient = connection.patient;
  const name = patient.profile?.fullName ?? patient.email;
  const age = calcAge(patient.profile?.dateOfBirth ?? null);
  const patientInitial = (name?.[0] ?? '?').toUpperCase();

  const since30 = new Date();
  since30.setDate(since30.getDate() - 30);

  const medIds = patient.medications.map((m) => m.id);
  const [logsRaw, takenRaw] = await Promise.all([
    prisma.medicationLog.groupBy({
      by: ['medicationId'],
      where: {
        medicationId: { in: medIds },
        scheduledAt: { gte: since30 },
        status: { in: ['taken', 'missed'] },
      },
      _count: { id: true },
    }),
    prisma.medicationLog.groupBy({
      by: ['medicationId'],
      where: { medicationId: { in: medIds }, scheduledAt: { gte: since30 }, status: 'taken' },
      _count: { id: true },
    }),
  ]);

  const totalMap = new Map(logsRaw.map((r) => [r.medicationId, r._count.id]));
  const takenMap = new Map(takenRaw.map((r) => [r.medicationId, r._count.id]));

  const medStats = patient.medications.map((med) => {
    const total = totalMap.get(med.id) ?? 0;
    const taken = takenMap.get(med.id) ?? 0;
    const pct = total > 0 ? Math.round((taken / total) * 100) : 0;
    return { ...med, total, taken, missed: total - taken, pct };
  });

  const totalAll = medStats.reduce((s, m) => s + m.total, 0);
  const takenAll = medStats.reduce((s, m) => s + m.taken, 0);
  const overallPct = totalAll > 0 ? Math.round((takenAll / totalAll) * 100) : 0;
  const dc = disciplineColor(overallPct);

  const recentLogs =
    tab === 'overview'
      ? await prisma.medicationLog.findMany({
          where: { medication: { patientId }, scheduledAt: { gte: since30 } },
          orderBy: { scheduledAt: 'desc' },
          take: 10,
          include: { medication: { select: { name: true, dosage: true } } },
        })
      : [];

  const journalTotal =
    tab === 'journal' ? await prisma.healthJournal.count({ where: { patientId } }) : 0;
  const journalEntries =
    tab === 'journal'
      ? await prisma.healthJournal.findMany({
          where: { patientId },
          orderBy: { logDate: 'desc' },
          take: pageSize,
          skip: (page - 1) * pageSize,
        })
      : [];
  const journalPages = Math.ceil(journalTotal / pageSize);

  function tabHref(t: TabId, p?: number) {
    return `/patients/${patientId}?tab=${t}${p && p > 1 ? `&page=${p}` : ''}`;
  }

  return (
    <div className="med-page med-animate space-y-0 !pb-0">
      <Link
        href="/feed"
        className="inline-flex items-center gap-2 text-base text-slate-500 hover:text-[#1565C0]
          transition-colors mb-4 py-2 min-h-[48px] items-center"
      >
        ← К ленте событий
      </Link>

      {/* Геро-карточка */}
      <div className="med-card p-0 overflow-hidden mb-6">
        <div className="h-2 bg-gradient-to-r from-indigo-500 to-indigo-600" />
        <div className="p-5 md:p-6">
          <div className="flex items-start gap-4 flex-wrap md:flex-nowrap">
            <div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-200
              flex items-center justify-center flex-shrink-0 border-2 border-indigo-100"
            >
              <span className="text-2xl font-black text-indigo-600">{patientInitial}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-black text-[#0D1B2A] leading-tight">
                {name}
              </h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm text-slate-500">
                {age !== null && <span>{age} лет</span>}
                {patient.profile?.timezone && <span>{patient.profile.timezone}</span>}
                <span>С {new Date(connection.createdAt).toLocaleDateString('ru')}</span>
              </div>
            </div>
            <div
              className={`flex flex-col items-center px-5 py-3 rounded-2xl border-2
              ${dc.bg} ${dc.border} flex-shrink-0`}
            >
              <span className={`text-3xl font-black ${dc.text}`}>{overallPct}%</span>
              <span className={`text-sm font-semibold ${dc.text}`}>Дисциплина</span>
              <span className="text-sm text-slate-400 mt-0.5">30 дней</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              {
                Icon: AdminPillIcon,
                gradient: 'from-blue-500 to-blue-600',
                label: 'Лекарств',
                value: patient.medications.length,
              },
              {
                Icon: AdminCheckIcon,
                gradient: 'from-green-500 to-green-600',
                label: 'Принято',
                value: takenAll,
              },
              {
                Icon: AlertTriangleIcon,
                gradient: 'from-red-500 to-red-600',
                label: 'Пропущено',
                value: totalAll - takenAll,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/70 rounded-xl p-3 text-center border border-slate-100"
              >
                <div
                  className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-1`}
                >
                  <s.Icon className="w-5 h-5 text-white" aria-hidden />
                </div>
                <p className="text-lg font-bold text-[#0D1B2A]">{s.value}</p>
                <p className="text-sm text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Вкладки */}
      <div className="flex gap-1 bg-slate-100/80 p-1 rounded-2xl mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={tabHref(t.id)}
            className={`flex-1 text-center px-4 py-3 rounded-xl text-sm font-semibold
              transition-all whitespace-nowrap min-h-[48px] flex items-center justify-center
              ${
                tab === t.id
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-[#0D1B2A]'
              }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* ОБЗОР */}
      {tab === 'overview' && (
        <div className="space-y-6 pb-8">
          <StatsDashboard patientId={patientId} />

          {recentLogs.length > 0 && (
            <div className="med-card p-5 space-y-3">
              <h2 className="text-base font-bold text-[#0D1B2A]">Последние приёмы</h2>
              <ul className="divide-y divide-slate-50">
                {recentLogs.map((log) => {
                  const isTaken = log.status === 'taken';
                  const isMissed = log.status === 'missed';
                  return (
                    <li key={log.id} className="flex items-center gap-3 py-2.5">
                      <span
                        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
                        ${isTaken ? 'bg-green-50 text-green-600' : isMissed ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}
                      >
                        {isTaken ? (
                          <CheckIcon className="w-4 h-4" aria-hidden />
                        ) : isMissed ? (
                          <XIcon className="w-4 h-4" aria-hidden />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-amber-500" aria-hidden />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0D1B2A] truncate">
                          {log.medication.name}
                        </p>
                        <p className="text-sm text-slate-400">{log.medication.dosage}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-mono text-slate-500">
                          {log.scheduledAt.toLocaleDateString('ru', {
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </p>
                        <p
                          className={`text-sm font-semibold
                          ${isTaken ? 'text-green-600' : isMissed ? 'text-red-500' : 'text-amber-500'}`}
                        >
                          {isTaken
                            ? log.actualAt
                              ? log.actualAt.toLocaleTimeString('ru', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Принято'
                            : isMissed
                              ? 'Пропущено'
                              : 'Ожидает'}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ЛЕКАРСТВА */}
      {tab === 'medications' && (
        <div className="space-y-3 pb-8">
          <p className="text-sm text-slate-500">
            {patient.medications.length} активных · статистика за 30 дней
          </p>
          {medStats.length === 0 ? (
            <div className="med-card flex flex-col items-center py-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <AdminPillIcon className="w-8 h-8 text-white" aria-hidden />
              </div>
              <p className="text-lg font-semibold text-[#0D1B2A]">Нет активных лекарств</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {medStats.map((med) => {
                const c = disciplineColor(med.pct);
                return (
                  <li key={med.id} className="med-card p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100
                        flex items-center justify-center flex-shrink-0"
                      >
                        <AdminPillIcon className="w-5 h-5 text-indigo-600" aria-hidden />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#0D1B2A] truncate">{med.name}</p>
                        <p className="text-sm text-slate-500">
                          {med.dosage} · {timeLabel(med.scheduledTime)} {med.scheduledTime}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1.5 rounded-xl border text-sm font-bold
                        ${c.bg} ${c.border} ${c.text} flex-shrink-0`}
                      >
                        {med.pct}%
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm text-slate-400 mb-1.5">
                        <span>{med.taken} принято</span>
                        <span>{med.missed} пропущено</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${c.bar} rounded-full`}
                          style={{ width: `${med.pct}%` }}
                        />
                      </div>
                    </div>
                    {med.instruction && (
                      <p className="text-sm text-slate-400 bg-slate-50 rounded-xl px-3 py-2">
                        {med.instruction}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* ДНЕВНИК */}
      {tab === 'journal' && (
        <div className="space-y-4 pb-8">
          {journalEntries.length === 0 ? (
            <div className="med-card flex flex-col items-center py-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                <BookIcon className="w-8 h-8 text-slate-400" aria-hidden />
              </div>
              <p className="text-lg font-semibold text-[#0D1B2A]">Записей пока нет</p>
              <p className="text-sm text-slate-400">Пациент ещё не вёл дневник</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-400">{journalTotal} записей</p>
              <ul className="space-y-3">
                {journalEntries.map((entry) => {
                  const scoreConfig = [
                    { label: 'Настроение', Icon: HeartPulseIcon, value: entry.moodScore },
                    { label: 'Боль', Icon: AlertTriangleIcon, value: entry.painLevel },
                    { label: 'Сон', Icon: ActivityIcon, value: entry.sleepQuality },
                    { label: 'Энергия', Icon: ActivityIcon, value: entry.energyLevel },
                  ].filter((s) => s.value !== null) as Array<{
                    label: string;
                    Icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
                    value: number;
                  }>;

                  const avgRaw = [
                    entry.moodScore,
                    entry.painLevel !== null ? 6 - (entry.painLevel ?? 0) : null,
                    entry.sleepQuality,
                    entry.energyLevel,
                  ].filter((v): v is number => v !== null);
                  const avg =
                    avgRaw.length > 0 ? avgRaw.reduce((a, b) => a + b, 0) / avgRaw.length : 3;

                  const bg =
                    avg >= 4
                      ? 'bg-green-50 border-green-100'
                      : avg >= 2.5
                        ? 'bg-amber-50 border-amber-100'
                        : 'bg-red-50 border-red-100';
                  const badgeClass =
                    avg >= 4
                      ? 'bg-green-100 text-green-700'
                      : avg >= 2.5
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700';
                  const badgeLabel = avg >= 4 ? 'Хорошо' : avg >= 2.5 ? 'Нормально' : 'Плохо';

                  return (
                    <li key={entry.id} className={`rounded-2xl border p-4 space-y-3 ${bg}`}>
                      <div className="flex items-center justify-between">
                        <time className="font-bold text-[#0D1B2A]">
                          {entry.logDate.toLocaleDateString('ru', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'long',
                          })}
                        </time>
                        <span
                          className={`text-sm px-2 py-1 rounded-lg font-semibold ${badgeClass}`}
                        >
                          {badgeLabel}
                        </span>
                      </div>
                      {scoreConfig.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {scoreConfig.map((s) => {
                            const Icon = s.Icon;
                            const color =
                              s.label === 'Боль'
                                ? s.value <= 2
                                  ? 'text-green-600'
                                  : s.value >= 4
                                    ? 'text-red-600'
                                    : 'text-amber-600'
                                : s.value >= 4
                                  ? 'text-green-600'
                                  : s.value <= 2
                                    ? 'text-red-600'
                                    : 'text-amber-600';
                            return (
                              <div
                                key={s.label}
                                className="bg-white/70 rounded-xl px-3 py-2 flex items-center gap-2"
                              >
                                <Icon className={`w-5 h-5 shrink-0 ${color}`} aria-hidden />
                                <div>
                                  <p className="text-sm text-slate-400">{s.label}</p>
                                  <div className="flex gap-0.5 mt-0.5">
                                    {Array.from({ length: 5 }, (_, i) => (
                                      <div
                                        key={i}
                                        className={`w-2.5 h-2.5 rounded-full
                                      ${i < (s.value ?? 0) ? 'bg-indigo-500' : 'bg-slate-200'}`}
                                      />
                                    ))}
                                    <span className="text-sm font-bold text-[#0D1B2A] ml-1">
                                      {s.value}/5
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {entry.freeText && (
                        <p className="text-sm text-slate-600 bg-white/60 rounded-xl px-3 py-2 italic">
                          «{entry.freeText}»
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>

              {journalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-slate-400">
                    Страница {page} из {journalPages}
                  </p>
                  <div className="flex gap-2">
                    {page > 1 && (
                      <Link
                        href={tabHref('journal', page - 1)}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl
                          text-sm hover:border-indigo-400 transition-colors min-h-[auto]"
                      >
                        ‹ Новее
                      </Link>
                    )}
                    {page < journalPages && (
                      <Link
                        href={tabHref('journal', page + 1)}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl
                          text-sm hover:border-indigo-400 transition-colors min-h-[auto]"
                      >
                        Старше ›
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* КАЛЕНДАРЬ */}
      {tab === 'calendar' && (
        <div className="space-y-4 pb-8">
          <p className="text-sm text-slate-500">
            Дисциплина по дням: зелёный — 100%, жёлтый — 1–2 пропуска, красный — 3+
          </p>
          <CalendarView patientId={patientId} />
        </div>
      )}
    </div>
  );
}
