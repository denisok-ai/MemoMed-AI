/**
 * @file stats-dashboard.tsx
 * @description Дашборд статистики: загружает данные через API и отображает
 * карточки метрик + график тренда дисциплины.
 * @dependencies StatsCards, DisciplineChart
 * @created 2026-02-22
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { StatsCards } from './stats-cards';
import { DisciplineChart } from './discipline-chart';

interface StatsData {
  disciplinePercent: number;
  currentStreak: number;
  longestStreak: number;
  avgDelayMinutes: number;
  takenCount: number;
  missedCount: number;
  activeMedicationsCount: number;
  periodDays: number;
  dailyTrend: Array<{
    date: string;
    total: number;
    taken: number;
    missed: number;
    percentage: number;
  }>;
}

interface StatsDashboardProps {
  patientId: string;
}

export function StatsDashboard({ patientId }: StatsDashboardProps) {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/stats/${patientId}?days=${days}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Ошибка ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, [patientId, days]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-gray-50 h-28" />
          ))}
        </div>
        <div className="rounded-2xl border border-gray-100 bg-gray-50 h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600 text-lg font-medium mb-2">Не удалось загрузить статистику</p>
        <p className="text-red-400 text-sm mb-4">{error}</p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 rounded-full bg-red-600 text-white text-sm font-medium
            hover:bg-red-700 transition-colors"
        >
          Повторить
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Переключатель периода */}
      <div className="flex gap-2">
        {[7, 14, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${
                days === d
                  ? 'bg-[#1565C0] text-white'
                  : 'bg-gray-100 text-[#757575] hover:bg-gray-200'
              }`}
          >
            {d === 7 ? '7 дн' : d === 14 ? '2 нед' : d === 30 ? 'Месяц' : '3 мес'}
          </button>
        ))}
      </div>

      <StatsCards
        disciplinePercent={data.disciplinePercent}
        currentStreak={data.currentStreak}
        longestStreak={data.longestStreak}
        avgDelayMinutes={data.avgDelayMinutes}
        activeMedicationsCount={data.activeMedicationsCount}
        takenCount={data.takenCount}
        missedCount={data.missedCount}
        periodDays={data.periodDays}
      />

      <DisciplineChart data={data.dailyTrend} />
    </div>
  );
}
