/**
 * @file page.tsx
 * @description Аналитика и отчёты платформы для администратора:
 *   дисциплина пациентов, топ лекарств, статистика врачей, активность по ролям.
 * @dependencies prisma
 * @created 2026-02-22
 */

import { MedicationLogStatus } from '@prisma/client';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { prisma } from '@/lib/db/prisma';
import {
  AdminUsersIcon,
  AdminPillIcon,
  AdminCheckIcon,
  AdminLinkIcon,
  AdminFeedbackIcon,
  AdminChartIcon,
} from '@/components/admin/admin-icons';
import { AdminReportFilters } from '@/components/admin/admin-report-filters';

export const metadata: Metadata = {
  title: 'Отчёты — Админ — MemoMed AI',
};

function DisciplineBar({ pct }: { pct: number }) {
  const color = pct >= 90 ? 'bg-green-500' : pct >= 70 ? 'bg-amber-500' : 'bg-red-500';
  const textColor = pct >= 90 ? 'text-green-700' : pct >= 70 ? 'text-amber-700' : 'text-red-700';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-sm font-bold w-10 text-right ${textColor}`}>{pct}%</span>
    </div>
  );
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ discipline?: string }>;
}) {
  const { discipline: disciplineFilter } = await searchParams;
  const since30 = new Date();
  since30.setDate(since30.getDate() - 30);
  const since7 = new Date();
  since7.setDate(since7.getDate() - 7);

  // ── Общие метрики ─────────────────────────────────────────────────────────────
  const [
    totalPatients,
    totalDoctors,
    totalRelatives,
    newUsersWeek,
    activeMedications,
    totalLogs30,
    takenLogs30,
    missedLogs30,
    totalConnections,
    feedbackCount,
    journalEntries30,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'patient' } }),
    prisma.user.count({ where: { role: 'doctor' } }),
    prisma.user.count({ where: { role: 'relative' } }),
    prisma.user.count({ where: { createdAt: { gte: since7 } } }),
    prisma.medication.count({ where: { isActive: true } }),
    prisma.medicationLog.count({
      where: {
        scheduledAt: { gte: since30 },
        status: { in: [MedicationLogStatus.taken, MedicationLogStatus.missed] },
      },
    }),
    prisma.medicationLog.count({ where: { scheduledAt: { gte: since30 }, status: 'taken' } }),
    prisma.medicationLog.count({ where: { scheduledAt: { gte: since30 }, status: 'missed' } }),
    prisma.connection.count({ where: { status: 'active' } }),
    prisma.medicationFeedback.count(),
    prisma.healthJournal.count({ where: { logDate: { gte: since30 } } }),
  ]);

  const overallDiscipline = totalLogs30 > 0 ? Math.round((takenLogs30 / totalLogs30) * 100) : 0;

  // ── Топ-10 пациентов по дисциплине ───────────────────────────────────────────
  const patientLogsRaw = await prisma.medicationLog.groupBy({
    by: ['medicationId'],
    where: {
      scheduledAt: { gte: since30 },
      status: { in: [MedicationLogStatus.taken, MedicationLogStatus.missed] },
    },
    _count: { id: true },
  });

  const medPatientMap = await prisma.medication.findMany({
    where: { id: { in: patientLogsRaw.map((l) => l.medicationId) } },
    select: { id: true, patientId: true },
  });
  const medToPatient = new Map(medPatientMap.map((m) => [m.id, m.patientId]));

  const patientTakenRaw = await prisma.medicationLog.groupBy({
    by: ['medicationId'],
    where: { scheduledAt: { gte: since30 }, status: 'taken' },
    _count: { id: true },
  });
  const medTaken = new Map(patientTakenRaw.map((l) => [l.medicationId, l._count.id]));

  const patientStats = new Map<string, { taken: number; total: number }>();
  for (const row of patientLogsRaw) {
    const pid = medToPatient.get(row.medicationId);
    if (!pid) continue;
    const cur = patientStats.get(pid) ?? { taken: 0, total: 0 };
    cur.total += row._count.id;
    cur.taken += medTaken.get(row.medicationId) ?? 0;
    patientStats.set(pid, cur);
  }

  const patientDiscipline = Array.from(patientStats.entries())
    .map(([id, d]) => ({
      id,
      pct: d.total > 0 ? Math.round((d.taken / d.total) * 100) : 0,
      total: d.total,
    }))
    .sort((a, b) => b.pct - a.pct);

  const filterByDiscipline = (list: typeof patientDiscipline) => {
    if (!disciplineFilter || disciplineFilter === 'all') return list;
    if (disciplineFilter === 'high') return list.filter((p) => p.pct >= 90);
    if (disciplineFilter === 'medium') return list.filter((p) => p.pct >= 70 && p.pct < 90);
    if (disciplineFilter === 'low') return list.filter((p) => p.pct < 70);
    return list;
  };

  const filteredDiscipline = filterByDiscipline(patientDiscipline);
  const topBest = filteredDiscipline.slice(0, 5);
  const topWorst = [...filteredDiscipline].reverse().slice(0, 5);

  // ── Топ-10 лекарств ───────────────────────────────────────────────────────────
  const topMeds = await prisma.medication.groupBy({
    by: ['name'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  });

  // ── Активность регистраций по дням (14 дней) ──────────────────────────────────
  const regLogs = await prisma.user.findMany({
    where: { createdAt: { gte: since30 } },
    select: { createdAt: true, role: true },
    orderBy: { createdAt: 'asc' },
  });

  // Группируем по дням
  const regByDay: Record<string, number> = {};
  for (const u of regLogs) {
    const day = u.createdAt.toLocaleDateString('ru', { day: '2-digit', month: '2-digit' });
    regByDay[day] = (regByDay[day] ?? 0) + 1;
  }

  // ── Статистика врачей ─────────────────────────────────────────────────────────
  const doctorConnections = await prisma.connection.groupBy({
    by: ['relativeId'],
    where: { status: 'active', relative: { role: 'doctor' } },
    _count: { patientId: true },
  });
  const doctorIds = doctorConnections.map((d) => d.relativeId);
  const doctorProfiles = await prisma.user.findMany({
    where: { id: { in: doctorIds } },
    select: { id: true, email: true, profile: { select: { fullName: true } } },
  });
  const doctorMap = new Map(doctorProfiles.map((d) => [d.id, d]));
  const doctorStats = doctorConnections
    .map((d) => ({ ...d, doctor: doctorMap.get(d.relativeId) }))
    .sort((a, b) => b._count.patientId - a._count.patientId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0D1B2A]">Отчёты платформы</h1>
        <span className="text-sm text-slate-500">За последние 30 дней</span>
      </div>

      {/* ── PDF-отчёт: поиск пациента + фильтры (пациенты скрыты) ─────────────────── */}
      <Suspense fallback={<div className="med-card p-5 animate-pulse h-48 rounded-2xl" />}>
        <AdminReportFilters />
      </Suspense>

      {/* ── Сводные метрики ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            Icon: AdminUsersIcon,
            gradient: 'from-blue-500 to-blue-600',
            label: 'Пациентов',
            value: totalPatients,
            sub: `+${newUsersWeek} за неделю`,
          },
          {
            Icon: AdminPillIcon,
            gradient: 'from-emerald-500 to-teal-600',
            label: 'Активных лекарств',
            value: activeMedications,
            sub: `у ${totalPatients} пациентов`,
          },
          {
            Icon: AdminCheckIcon,
            gradient: 'from-slate-500 to-slate-600',
            label: 'Дисциплина (30 дн)',
            value: `${overallDiscipline}%`,
            sub: `${takenLogs30.toLocaleString('ru')} из ${totalLogs30.toLocaleString('ru')}`,
          },
          {
            Icon: AdminLinkIcon,
            gradient: 'from-cyan-500 to-cyan-600',
            label: 'Связей',
            value: totalConnections,
            sub: `${totalDoctors} врачей · ${totalRelatives} родств.`,
          },
        ].map((c) => (
          <div key={c.label} className="med-stat p-5">
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white mb-3`}
            >
              <c.Icon className="w-6 h-6" aria-hidden />
            </div>
            <p className="text-2xl font-bold text-[#0D1B2A]">{c.value}</p>
            <p className="text-sm text-slate-600 font-medium mt-0.5">{c.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Второй ряд ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            Icon: AdminCheckIcon,
            gradient: 'from-green-500 to-green-600',
            label: 'Приёмов зафиксировано',
            value: takenLogs30.toLocaleString('ru'),
            color: 'text-green-600',
          },
          {
            Icon: AdminChartIcon,
            gradient: 'from-red-500 to-red-600',
            label: 'Пропусков',
            value: missedLogs30.toLocaleString('ru'),
            color: 'text-red-600',
          },
          {
            Icon: AdminFeedbackIcon,
            gradient: 'from-blue-500 to-blue-600',
            label: 'Записей дневника',
            value: journalEntries30.toLocaleString('ru'),
            color: 'text-blue-600',
          },
        ].map((c) => (
          <div key={c.label} className="med-stat p-4 text-center">
            <div
              className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white mb-2`}
            >
              <c.Icon className="w-5 h-5" aria-hidden />
            </div>
            <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Лучшие пациенты ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#0D1B2A] flex items-center gap-2">
            <span className="text-green-500">▲</span> Топ-5 по дисциплине
          </h2>
          {topBest.length === 0 ? (
            <p className="text-sm text-slate-500">Нет данных</p>
          ) : (
            <ul className="space-y-3">
              {topBest.map((p, i) => (
                <li key={p.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 w-4">{i + 1}</span>
                      <span className="text-[#0D1B2A]">Пациент №{i + 1}</span>
                    </div>
                    <span className="text-xs text-slate-500">{p.total} приёмов</span>
                  </div>
                  <DisciplineBar pct={p.pct} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Худшие пациенты ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#0D1B2A] flex items-center gap-2">
            <span className="text-red-500">▼</span> Требуют внимания (наихудшая дисциплина)
          </h2>
          {topWorst.length === 0 ? (
            <p className="text-sm text-slate-500">Нет данных</p>
          ) : (
            <ul className="space-y-3">
              {topWorst.map((p, i) => (
                <li key={p.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 w-4">{i + 1}</span>
                      <span className="text-[#0D1B2A]">Пациент №{i + 1}</span>
                    </div>
                    <span className="text-xs text-slate-500">{p.total} приёмов</span>
                  </div>
                  <DisciplineBar pct={p.pct} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Топ препаратов ────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#0D1B2A] flex items-center gap-2">
            <AdminPillIcon className="w-4 h-4 text-[#1565C0]" aria-hidden />
            Топ-10 назначаемых препаратов
          </h2>
          {topMeds.length === 0 ? (
            <p className="text-sm text-slate-500">Нет данных</p>
          ) : (
            <ul className="space-y-2">
              {topMeds.map((m, i) => {
                const maxCount = topMeds[0]?._count.id ?? 1;
                const pct = Math.round((m._count.id / maxCount) * 100);
                return (
                  <li key={m.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 w-4">{i + 1}</span>
                        <span className="font-medium text-[#212121]">{m.name}</span>
                      </div>
                      <span className="text-xs font-bold text-[#1565C0]">{m._count.id}</span>
                    </div>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden ml-6">
                      <div
                        className="h-full bg-blue-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ── Статистика врачей ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#0D1B2A]">Врачи — пациенты под наблюдением</h2>
          {doctorStats.length === 0 ? (
            <p className="text-sm text-slate-500">Нет связей врач-пациент</p>
          ) : (
            <ul className="space-y-3">
              {doctorStats.map((d, i) => {
                const maxPat = doctorStats[0]?._count.patientId ?? 1;
                const pct = Math.round((d._count.patientId / maxPat) * 100);
                return (
                  <li key={d.relativeId} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 w-4">{i + 1}</span>
                        <span className="font-medium text-[#212121] truncate max-w-[180px]">
                          {d.doctor?.profile?.fullName ?? d.doctor?.email ?? '—'}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#1565C0]">
                        {d._count.patientId} пац.
                      </span>
                    </div>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden ml-6">
                      <div
                        className="h-full bg-indigo-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ── Регистрации по дням ───────────────────────────────────────────────────── */}
      {Object.keys(regByDay).length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#0D1B2A]">Новые регистрации (30 дней)</h2>
          <div className="flex items-end gap-1 h-20 overflow-x-auto">
            {Object.entries(regByDay).map(([day, count]) => {
              const maxVal = Math.max(...Object.values(regByDay));
              const heightPct = maxVal > 0 ? (count / maxVal) * 100 : 0;
              return (
                <div
                  key={day}
                  className="flex flex-col items-center gap-1 min-w-[28px]"
                  title={`${day}: ${count}`}
                >
                  <span className="text-xs text-slate-400">{count}</span>
                  <div
                    className="w-full bg-blue-400 rounded-t-sm"
                    style={{ height: `${Math.max(heightPct, 4)}%` }}
                  />
                  <span className="text-[9px] text-slate-400 rotate-45 origin-left translate-x-1">
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Отзывы о лекарствах ──────────────────────────────────────────────────── */}
      {feedbackCount > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#0D1B2A] flex items-center gap-2">
              <AdminFeedbackIcon className="w-4 h-4 text-[#1565C0]" aria-hidden />
              Отзывы о препаратах
            </h2>
            <span className="text-2xl font-bold text-[#1565C0]">{feedbackCount}</span>
          </div>
          <p className="text-sm text-slate-500">
            Собранные отзывы анонимизируются и используются для аналитики эффективности препаратов.
          </p>
          <a href="/admin/users?role=patient" className="text-sm text-[#1565C0] hover:underline">
            Посмотреть пациентов с отзывами →
          </a>
        </div>
      )}
    </div>
  );
}
