/**
 * @file stats-cards.tsx
 * @description Карточки ключевых метрик дисциплины: процент, streak, задержка, кол-во лекарств.
 * @dependencies StatsResult
 * @created 2026-02-22
 */

'use client';

interface StatsCardsProps {
  disciplinePercent: number;
  currentStreak: number;
  longestStreak: number;
  avgDelayMinutes: number;
  activeMedicationsCount: number;
  takenCount: number;
  missedCount: number;
  periodDays: number;
}

function getColorByPercent(percent: number): string {
  if (percent >= 90) return 'text-emerald-600';
  if (percent >= 70) return 'text-amber-500';
  return 'text-red-500';
}

function getBgByPercent(percent: number): string {
  if (percent >= 90) return 'bg-emerald-50 border-emerald-200';
  if (percent >= 70) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}

export function StatsCards({
  disciplinePercent,
  currentStreak,
  longestStreak,
  avgDelayMinutes,
  activeMedicationsCount,
  takenCount,
  missedCount,
  periodDays,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Дисциплина */}
      <div
        className={`rounded-2xl border p-4 ${getBgByPercent(disciplinePercent)}`}
        role="status"
        aria-label={`Дисциплина: ${disciplinePercent}%`}
      >
        <p className="text-sm text-slate-500 mb-1">Дисциплина</p>
        <p className={`text-3xl font-bold ${getColorByPercent(disciplinePercent)}`}>
          {disciplinePercent}%
        </p>
        <p className="text-sm text-slate-500 mt-1">за {periodDays} дн.</p>
      </div>

      {/* Серия */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-slate-500 mb-1">Серия без пропусков</p>
        <p className="text-3xl font-bold text-blue-700">{currentStreak}</p>
        <p className="text-sm text-slate-500 mt-1">
          дн.{longestStreak > currentStreak ? ` (рекорд: ${longestStreak})` : ''}
        </p>
      </div>

      {/* Средняя задержка */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-slate-500 mb-1">Ср. задержка</p>
        <p className="text-3xl font-bold text-blue-600">
          {avgDelayMinutes < 60 ? `${avgDelayMinutes}` : `${Math.floor(avgDelayMinutes / 60)}ч`}
        </p>
        <p className="text-sm text-slate-500 mt-1">
          {avgDelayMinutes < 60 ? 'мин.' : `${avgDelayMinutes % 60} мин.`}
        </p>
      </div>

      {/* Принято / Пропущено */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-500 mb-1">Приёмы</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-600">{takenCount}</span>
          <span className="text-sm text-slate-500">/</span>
          <span className="text-2xl font-bold text-red-500">{missedCount}</span>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          принято / пропущено • {activeMedicationsCount} лек.
        </p>
      </div>
    </div>
  );
}
