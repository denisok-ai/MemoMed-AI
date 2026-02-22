/**
 * @file page.tsx
 * @description Страница статистики: дашборд метрик, график тренда, календарь, отчёты.
 * @dependencies StatsDashboard, CalendarView, AnalysisResults, DownloadReportButton
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { StatsDashboard } from '@/components/shared/stats-dashboard';
import { CalendarView } from '@/components/shared/calendar-view';
import { AnalysisResults } from '@/components/shared/analysis-results';
import { DownloadReportButton } from '@/components/shared/download-report-button';

export const metadata: Metadata = {
  title: 'Статистика — MemoMed AI',
};

export default async function StatsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div className="med-page med-animate">
      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#0D1B2A]">Статистика приёма</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Отслеживайте вашу дисциплину приёма лекарств
        </p>
      </div>

      {/* Дашборд метрик + график */}
      <StatsDashboard patientId={session.user.id} />

      {/* AI-анализ */}
      <div className="mt-6">
        <AnalysisResults patientId={session.user.id} />
      </div>

      {/* Календарь дисциплины */}
      <div className="mt-6">
        <CalendarView patientId={session.user.id} />
      </div>

      {/* Отчёты */}
      <div className="med-card p-5 mt-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#0D1B2A]">📄 Отчёты для врача</h2>
          <p className="text-sm text-slate-400 mt-1">
            Скачайте PDF с историей приёмов и AI-заключением
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { period: '30d', label: '30 дней', icon: '📅' },
            { period: '90d', label: '3 месяца', icon: '📆' },
            { period: '180d', label: '6 месяцев', icon: '📋' },
          ].map((r) => (
            <div
              key={r.period}
              className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2"
            >
              <p className="text-xl">{r.icon}</p>
              <p className="font-semibold text-[#0D1B2A] text-sm">{r.label}</p>
              <DownloadReportButton
                patientId={session.user.id}
                period={r.period as '30d' | '90d' | '180d'}
                label={`За ${r.label}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
