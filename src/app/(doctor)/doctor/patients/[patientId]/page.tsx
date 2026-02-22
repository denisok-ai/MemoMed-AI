/**
 * @file page.tsx
 * @description Профиль пациента для врача: геро-карточка, вкладки (обзор/лекарства/журнал/отчёты),
 * дисциплина по каждому препарату, история приёмов, журнал самочувствия.
 * @dependencies prisma, StatsDashboard, AnalysisResults, DownloadReportButton
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { StatsDashboard } from '@/components/shared/stats-dashboard';
import { AnalysisResults } from '@/components/shared/analysis-results';
import { DownloadReportButton } from '@/components/shared/download-report-button';
import { CalendarView } from '@/components/shared/calendar-view';

export const metadata: Metadata = {
  title: 'Пациент — MemoMed AI',
};

const TABS = [
  { id: 'overview', label: 'Обзор' },
  { id: 'medications', label: 'Лекарства' },
  { id: 'journal', label: 'Дневник' },
  { id: 'calendar', label: 'Календарь' },
  { id: 'reports', label: 'Отчёты' },
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
  if (h < 10) return '🌅 Утро';
  if (h < 14) return '☀️ День';
  if (h < 19) return '🌆 Вечер';
  return '🌙 Ночь';
}

export default async function DoctorPatientPage({
  params,
  searchParams,
}: {
  params: Promise<{ patientId: string }>;
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'doctor' && session.user.role !== 'admin') redirect('/dashboard');

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
          profile: {
            select: { fullName: true, dateOfBirth: true, timezone: true, regionCode: true },
          },
          medications: {
            where: { isActive: true },
            orderBy: { scheduledTime: 'asc' },
            select: {
              id: true,
              name: true,
              dosage: true,
              scheduledTime: true,
              instruction: true,
              photoUrl: true,
            },
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

  // ── Дисциплина по каждому препарату ───────────────────────────────────────────
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

  // ── Общая дисциплина ──────────────────────────────────────────────────────────
  const totalAll = medStats.reduce((s, m) => s + m.total, 0);
  const takenAll = medStats.reduce((s, m) => s + m.taken, 0);
  const overallPct = totalAll > 0 ? Math.round((takenAll / totalAll) * 100) : 0;
  const dc = disciplineColor(overallPct);

  // ── Последние приёмы (для вкладки обзор) ─────────────────────────────────────
  const recentLogs =
    tab === 'overview'
      ? await prisma.medicationLog.findMany({
          where: { medication: { patientId }, scheduledAt: { gte: since30 } },
          orderBy: { scheduledAt: 'desc' },
          take: 10,
          include: { medication: { select: { name: true, dosage: true } } },
        })
      : [];

  // ── Дневник самочувствия ──────────────────────────────────────────────────────
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
    return `/doctor/patients/${patientId}?tab=${t}${p && p > 1 ? `&page=${p}` : ''}`;
  }

  return (
    <div className="med-page space-y-0 !pb-0">
      {/* ── Назад ─────────────────────────────────────────────────────────────── */}
      <Link
        href="/doctor/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#1565C0]
          transition-colors mb-4 min-h-[auto]"
      >
        ← Все пациенты
      </Link>

      {/* ── Геро-карточка ─────────────────────────────────────────────────────── */}
      <div className="med-card p-0 overflow-hidden mb-6">
        {/* Верхняя полоса */}
        <div className="h-2 bg-gradient-to-r from-[#1565C0] to-[#1976D2]" />

        <div className="p-5 md:p-6">
          <div className="flex items-start gap-4 flex-wrap md:flex-nowrap">
            {/* Аватар */}
            <div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200
              flex items-center justify-center flex-shrink-0 border-2 border-blue-100"
            >
              <span className="text-2xl font-black text-[#1565C0]">{patientInitial}</span>
            </div>

            {/* Данные пациента */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-[#0D1B2A] leading-tight">{name}</h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm text-slate-500">
                {age !== null && <span>🎂 {age} лет</span>}
                <span>📧 {patient.email}</span>
                {patient.profile?.timezone && <span>🕐 {patient.profile.timezone}</span>}
                {patient.profile?.regionCode && <span>📍 {patient.profile.regionCode}</span>}
                <span>🔗 Связан с {new Date(connection.createdAt).toLocaleDateString('ru')}</span>
              </div>
            </div>

            {/* Дисциплина */}
            <div
              className={`flex flex-col items-center px-5 py-3 rounded-2xl border-2
              ${dc.bg} ${dc.border} flex-shrink-0`}
            >
              <span className={`text-3xl font-black ${dc.text}`}>{overallPct}%</span>
              <span className={`text-sm font-semibold ${dc.text}`}>Дисциплина</span>
              <span className="text-sm text-slate-400 mt-0.5">30 дней</span>
            </div>
          </div>

          {/* Быстрая статистика */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { icon: '💊', label: 'Лекарств', value: patient.medications.length },
              { icon: '✅', label: 'Принято', value: takenAll },
              { icon: '❌', label: 'Пропущено', value: totalAll - takenAll },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/70 rounded-xl p-3 text-center border border-slate-100"
              >
                <p className="text-lg mb-0.5">{s.icon}</p>
                <p className="text-lg font-bold text-[#0D1B2A]">{s.value}</p>
                <p className="text-sm text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Вкладки ───────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-slate-100/80 p-1 rounded-2xl mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={tabHref(t.id)}
            className={`flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-semibold
              transition-all whitespace-nowrap min-h-[auto]
              ${
                tab === t.id
                  ? 'bg-white text-[#1565C0] shadow-sm'
                  : 'text-slate-500 hover:text-[#0D1B2A]'
              }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* ══════════════════ ВКЛАДКА: ОБЗОР ══════════════════ */}
      {tab === 'overview' && (
        <div className="space-y-6 pb-8">
          <StatsDashboard patientId={patientId} />

          {/* Последние приёмы */}
          {recentLogs.length > 0 && (
            <div className="med-card p-5 space-y-3">
              <h2 className="text-base font-bold text-[#0D1B2A]">Последние приёмы</h2>
              <ul className="divide-y divide-slate-50 space-y-0">
                {recentLogs.map((log) => {
                  const isTaken = log.status === 'taken';
                  const isMissed = log.status === 'missed';
                  return (
                    <li key={log.id} className="flex items-center gap-3 py-2.5">
                      <span
                        className={`w-8 h-8 rounded-xl flex items-center justify-center
                        text-sm flex-shrink-0
                        ${isTaken ? 'bg-green-50 text-green-600' : isMissed ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}
                      >
                        {isTaken ? '✓' : isMissed ? '✗' : '⏳'}
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
              <Link
                href={tabHref('medications')}
                className="block text-center text-sm text-[#1565C0] hover:underline
                  pt-2 border-t border-slate-50 min-h-[auto]"
              >
                Все лекарства →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════ ВКЛАДКА: ЛЕКАРСТВА ══════════════════ */}
      {tab === 'medications' && (
        <div className="space-y-3 pb-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {patient.medications.length} активных · статистика за 30 дней
            </p>
          </div>

          {medStats.length === 0 ? (
            <div className="med-card flex flex-col items-center py-12 text-center space-y-3">
              <p className="text-4xl">💊</p>
              <p className="text-lg font-semibold text-[#0D1B2A]">Нет активных лекарств</p>
              <p className="text-sm text-slate-400">Пациент не добавил ни одного препарата</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {medStats.map((med) => {
                const c = disciplineColor(med.pct);
                return (
                  <li key={med.id} className="med-card p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      {/* Иконка */}
                      <div
                        className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100
                        flex items-center justify-center text-xl flex-shrink-0"
                      >
                        💊
                      </div>
                      {/* Название и время */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#0D1B2A] truncate">{med.name}</p>
                        <p className="text-sm text-slate-500">
                          {med.dosage} · {timeLabel(med.scheduledTime)} {med.scheduledTime}
                        </p>
                      </div>
                      {/* % дисциплины */}
                      <div
                        className={`px-3 py-1.5 rounded-xl border text-sm font-bold
                        ${c.bg} ${c.border} ${c.text} flex-shrink-0`}
                      >
                        {med.pct}%
                      </div>
                    </div>

                    {/* Прогресс-бар */}
                    <div>
                      <div className="flex justify-between text-sm text-slate-400 mb-1.5">
                        <span>✅ {med.taken} принято</span>
                        <span>❌ {med.missed} пропущено</span>
                        <span>📅 {med.total} всего</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${c.bar} rounded-full transition-all`}
                          style={{ width: `${med.pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Инструкция */}
                    {med.instruction && (
                      <p className="text-sm text-slate-400 bg-slate-50 rounded-xl px-3 py-2 leading-relaxed">
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

      {/* ══════════════════ ВКЛАДКА: ЖУРНАЛ ══════════════════ */}
      {tab === 'journal' && (
        <div className="space-y-4 pb-8">
          {journalEntries.length === 0 ? (
            <div className="med-card flex flex-col items-center py-12 text-center space-y-3">
              <p className="text-4xl">📓</p>
              <p className="text-lg font-semibold text-[#0D1B2A]">Записей пока нет</p>
              <p className="text-sm text-slate-400">Пациент ещё не вёл дневник самочувствия</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-400">{journalTotal} записей</p>
              <ul className="space-y-3">
                {journalEntries.map((entry) => {
                  const scores = [
                    { label: 'Настроение', icon: '😊', value: entry.moodScore, invert: false },
                    { label: 'Боль', icon: '💢', value: entry.painLevel, invert: true },
                    { label: 'Сон', icon: '💤', value: entry.sleepQuality, invert: false },
                    { label: 'Энергия', icon: '⚡', value: entry.energyLevel, invert: false },
                  ].filter((s) => s.value !== null);

                  // Шкала 1-5: инвертируем боль
                  const avgRaw = scores.map((s) =>
                    s.invert ? 6 - (s.value ?? 0) : (s.value ?? 0)
                  );
                  const avg =
                    avgRaw.length > 0 ? avgRaw.reduce((a, b) => a + b, 0) / avgRaw.length : 3;

                  const bg =
                    avg >= 4
                      ? 'bg-green-50 border-green-100'
                      : avg >= 2.5
                        ? 'bg-amber-50 border-amber-100'
                        : 'bg-red-50 border-red-100';

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
                          className={`text-sm px-2 py-1 rounded-lg font-semibold
                          ${
                            avg >= 4
                              ? 'bg-green-100 text-green-700'
                              : avg >= 2.5
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {avg >= 4 ? 'Хорошо' : avg >= 2.5 ? 'Нормально' : 'Плохо'}
                        </span>
                      </div>

                      {scores.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {scores.map((s) => (
                            <div
                              key={s.label}
                              className="bg-white/70 rounded-xl px-3 py-2 flex items-center gap-2"
                            >
                              <span className="text-base">{s.icon}</span>
                              <div>
                                <p className="text-sm text-slate-400">{s.label}</p>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <div className="flex gap-0.5">
                                    {Array.from({ length: 5 }, (_, i) => (
                                      <div
                                        key={i}
                                        className={`w-2.5 h-2.5 rounded-full
                                        ${i < (s.value ?? 0) ? 'bg-[#1565C0]' : 'bg-slate-200'}`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm font-bold text-[#0D1B2A] ml-1">
                                    {s.value}/5
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {entry.freeText && (
                        <p
                          className="text-sm text-slate-600 bg-white/60 rounded-xl px-3 py-2
                          leading-relaxed italic"
                        >
                          «{entry.freeText}»
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* Пагинация */}
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
                          text-sm text-[#424242] hover:border-[#1565C0] transition-colors min-h-[auto]"
                      >
                        ‹ Новее
                      </Link>
                    )}
                    {page < journalPages && (
                      <Link
                        href={tabHref('journal', page + 1)}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl
                          text-sm text-[#424242] hover:border-[#1565C0] transition-colors min-h-[auto]"
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

      {/* ══════════════════ ВКЛАДКА: КАЛЕНДАРЬ ══════════════════ */}
      {tab === 'calendar' && (
        <div className="space-y-4 pb-8">
          <p className="text-sm text-slate-500">
            Цветовая индикация дисциплины по дням: зелёный — 100%, жёлтый — 1–2 пропуска, красный —
            3+
          </p>
          <CalendarView patientId={patientId} />
        </div>
      )}

      {/* ══════════════════ ВКЛАДКА: ОТЧЁТЫ ══════════════════ */}
      {tab === 'reports' && (
        <div className="space-y-6 pb-8">
          {/* AI анализ */}
          <AnalysisResults patientId={patientId} />

          {/* PDF отчёты */}
          <div className="med-card p-5 space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#0D1B2A]">📄 PDF-отчёты</h2>
              <p className="text-sm text-slate-400 mt-1">
                Скачайте отчёт с историей приёмов, статистикой и AI-заключением
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { period: '30d', label: '30 дней', sub: 'Последний месяц', icon: '📅' },
                { period: '90d', label: '3 месяца', sub: 'Квартальный отчёт', icon: '📆' },
                { period: '180d', label: '6 месяцев', sub: 'Полугодовой отчёт', icon: '📋' },
              ].map((r) => (
                <div
                  key={r.period}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2"
                >
                  <p className="text-2xl">{r.icon}</p>
                  <p className="font-bold text-[#0D1B2A]">{r.label}</p>
                  <p className="text-sm text-slate-400">{r.sub}</p>
                  <DownloadReportButton
                    patientId={patientId}
                    period={r.period as '30d' | '90d' | '180d'}
                    label={`Скачать за ${r.label}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Общий дисциплинарный отчёт */}
          <div className="med-card p-5 space-y-4">
            <h2 className="text-base font-bold text-[#0D1B2A]">📊 Сводка за 30 дней</h2>
            <div className="space-y-3">
              {medStats.map((med) => {
                const c = disciplineColor(med.pct);
                return (
                  <div key={med.id} className="flex items-center gap-3">
                    <p className="text-sm font-medium text-[#0D1B2A] w-32 truncate flex-shrink-0">
                      {med.name}
                    </p>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${c.bar} rounded-full`}
                        style={{ width: `${med.pct}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold w-10 text-right ${c.text}`}>
                      {med.pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
