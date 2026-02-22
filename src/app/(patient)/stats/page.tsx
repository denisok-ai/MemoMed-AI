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
import { ClipboardIcon } from '@/components/shared/nav-icons';

export const metadata: Metadata = {
  title: 'Статистика — MemoMed AI',
};

export default async function StatsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div className="med-page med-animate">
      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0D1B2A]">Статистика приёма</h1>
          <p className="text-slate-500 text-base mt-0.5">
            Отслеживайте вашу дисциплину приёма лекарств
          </p>
        </div>
        {/* Быстрая кнопка PDF — всегда видна */}
        <DownloadReportButton patientId={session.user.id} period="30d" label="Скачать PDF-отчёт" />
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

      {/* Отчёты — как quick-links в dashboard */}
      <div className="med-card p-5 mt-6 space-y-4">
        <div>
          <h2 className="med-section-title mb-1">Отчёты для врача</h2>
          <p className="text-sm text-slate-500">Скачайте PDF с историей приёмов и AI-заключением</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 med-stagger">
          {[
            {
              period: '30d',
              label: '30 дней',
              gradient: 'from-blue-500 to-blue-600',
              bg: 'bg-blue-50',
            },
            {
              period: '90d',
              label: '3 месяца',
              gradient: 'from-teal-500 to-teal-600',
              bg: 'bg-teal-50',
            },
            {
              period: '180d',
              label: '6 месяцев',
              gradient: 'from-indigo-500 to-indigo-600',
              bg: 'bg-indigo-50',
            },
          ].map(({ period, label, gradient, bg }) => (
            <div
              key={period}
              className={`group p-4 rounded-2xl ${bg} border border-transparent
                hover:border-slate-200 hover:shadow-lg transition-all duration-200`}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient}
                  flex items-center justify-center shadow-md mb-3`}
              >
                <ClipboardIcon className="w-6 h-6 text-white" aria-hidden />
              </div>
              <p className="font-bold text-[#0D1B2A] text-base mb-2">{label}</p>
              <DownloadReportButton
                patientId={session.user.id}
                period={period as '30d' | '90d' | '180d'}
                label={`За ${label}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
