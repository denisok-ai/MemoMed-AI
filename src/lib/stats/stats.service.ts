/**
 * @file stats.service.ts
 * @description Сервис расчёта метрик дисциплины приёма лекарств.
 * Чистые функции — легко тестировать без БД.
 * @dependencies prisma (типы)
 * @created 2026-02-22
 */

import type { MedicationLogStatus } from '@prisma/client';

export interface LogRecord {
  scheduledAt: Date;
  actualAt: Date | null;
  status: MedicationLogStatus;
}

export interface DailyDiscipline {
  date: string;
  total: number;
  taken: number;
  missed: number;
  pending: number;
  percentage: number;
}

export interface StatsResult {
  totalLogs: number;
  takenCount: number;
  missedCount: number;
  pendingCount: number;
  disciplinePercent: number;
  avgDelayMinutes: number;
  currentStreak: number;
  longestStreak: number;
  dailyTrend: DailyDiscipline[];
}

/**
 * Рассчитывает среднюю задержку приёма в минутах.
 * Учитывает только логи со статусом taken и непустым actualAt.
 */
export function calcAvgDelayMinutes(logs: LogRecord[]): number {
  const takenWithTime = logs.filter((l) => l.status === 'taken' && l.actualAt !== null);
  if (takenWithTime.length === 0) return 0;

  const totalMinutes = takenWithTime.reduce((sum, l) => {
    const diff = Math.abs(l.actualAt!.getTime() - l.scheduledAt.getTime());
    return sum + diff / 60_000;
  }, 0);

  return Math.round(totalMinutes / takenWithTime.length);
}

/**
 * Рассчитывает текущий streak (серия дней без пропусков).
 * День считается «хорошим», если все приёмы в этот день — taken.
 * Идём от сегодня в прошлое, пока не встретим день с пропуском.
 */
export function calcStreak(daily: DailyDiscipline[]): { current: number; longest: number } {
  if (daily.length === 0) return { current: 0, longest: 0 };

  const sorted = [...daily].sort((a, b) => b.date.localeCompare(a.date));

  let longest = 0;
  let current = 0;
  let foundBroken = false;

  for (const day of sorted) {
    if (day.total === 0) continue;
    const isGood = day.percentage === 100;

    if (isGood) {
      current++;
      if (!foundBroken) {
        // streak с текущего дня ещё не прерван
      }
    } else {
      if (!foundBroken) {
        foundBroken = true;
        longest = Math.max(longest, current);
      }
      current = 0;
    }
    longest = Math.max(longest, current);
  }

  const currentStreak = foundBroken
    ? (() => {
        let s = 0;
        for (const day of sorted) {
          if (day.total === 0) continue;
          if (day.percentage === 100) s++;
          else break;
        }
        return s;
      })()
    : current;

  return { current: currentStreak, longest };
}

/**
 * Группирует логи по дням и считает процент дисциплины за каждый день.
 */
export function buildDailyTrend(logs: LogRecord[], days: number): DailyDiscipline[] {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const dayMap = new Map<
    string,
    { total: number; taken: number; missed: number; pending: number }
  >();

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dayMap.set(key, { total: 0, taken: 0, missed: 0, pending: 0 });
  }

  for (const log of logs) {
    const key = log.scheduledAt.toISOString().slice(0, 10);
    const bucket = dayMap.get(key);
    if (!bucket) continue;
    bucket.total++;
    if (log.status === 'taken') bucket.taken++;
    else if (log.status === 'missed') bucket.missed++;
    else bucket.pending++;
  }

  const result: DailyDiscipline[] = [];
  for (const [date, data] of dayMap) {
    result.push({
      date,
      ...data,
      percentage: data.total > 0 ? Math.round((data.taken / data.total) * 100) : 0,
    });
  }

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Полный расчёт статистики по массиву логов.
 */
export function calculateStats(logs: LogRecord[], days: number = 30): StatsResult {
  const takenCount = logs.filter((l) => l.status === 'taken').length;
  const missedCount = logs.filter((l) => l.status === 'missed').length;
  const pendingCount = logs.filter((l) => l.status === 'pending').length;
  const totalLogs = logs.length;

  const logsWithDecision = takenCount + missedCount;
  const disciplinePercent =
    logsWithDecision > 0 ? Math.round((takenCount / logsWithDecision) * 100) : 0;

  const avgDelayMinutes = calcAvgDelayMinutes(logs);
  const dailyTrend = buildDailyTrend(logs, days);
  const { current: currentStreak, longest: longestStreak } = calcStreak(dailyTrend);

  return {
    totalLogs,
    takenCount,
    missedCount,
    pendingCount,
    disciplinePercent,
    avgDelayMinutes,
    currentStreak,
    longestStreak,
    dailyTrend,
  };
}
