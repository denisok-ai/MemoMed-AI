/**
 * @file stats.service.test.ts
 * @description Тесты расчёта метрик дисциплины приёма лекарств
 * @created 2026-02-22
 */

import { describe, it, expect } from 'vitest';
import {
  calcAvgDelayMinutes,
  calcStreak,
  buildDailyTrend,
  calculateStats,
  type LogRecord,
  type DailyDiscipline,
} from '@/lib/stats/stats.service';

function makeLog(
  status: 'taken' | 'missed' | 'pending',
  scheduledAt: Date,
  delayMinutes = 0
): LogRecord {
  return {
    status,
    scheduledAt,
    actualAt: status === 'taken' ? new Date(scheduledAt.getTime() + delayMinutes * 60_000) : null,
  };
}

function today(hoursBefore = 0): Date {
  const d = new Date();
  d.setHours(d.getHours() - hoursBefore, 0, 0, 0);
  return d;
}

function daysAgo(n: number, hour = 8): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d;
}

describe('calcAvgDelayMinutes', () => {
  it('возвращает 0 если нет записей', () => {
    expect(calcAvgDelayMinutes([])).toBe(0);
  });

  it('возвращает 0 если нет taken записей', () => {
    const logs: LogRecord[] = [makeLog('missed', today()), makeLog('pending', today(1))];
    expect(calcAvgDelayMinutes(logs)).toBe(0);
  });

  it('рассчитывает среднюю задержку правильно', () => {
    const logs: LogRecord[] = [makeLog('taken', today(), 10), makeLog('taken', today(2), 20)];
    expect(calcAvgDelayMinutes(logs)).toBe(15);
  });

  it('игнорирует missed/pending', () => {
    const logs: LogRecord[] = [
      makeLog('taken', today(), 30),
      makeLog('missed', today(1)),
      makeLog('pending', today(2)),
    ];
    expect(calcAvgDelayMinutes(logs)).toBe(30);
  });
});

describe('calcStreak', () => {
  it('возвращает 0 для пустых данных', () => {
    expect(calcStreak([])).toEqual({ current: 0, longest: 0 });
  });

  it('считает серию из 100% дней', () => {
    const daily: DailyDiscipline[] = [
      { date: '2026-02-20', total: 2, taken: 2, missed: 0, pending: 0, percentage: 100 },
      { date: '2026-02-21', total: 2, taken: 2, missed: 0, pending: 0, percentage: 100 },
      { date: '2026-02-22', total: 2, taken: 2, missed: 0, pending: 0, percentage: 100 },
    ];
    const result = calcStreak(daily);
    expect(result.current).toBe(3);
    expect(result.longest).toBe(3);
  });

  it('прерывает серию при пропуске', () => {
    const daily: DailyDiscipline[] = [
      { date: '2026-02-18', total: 2, taken: 2, missed: 0, pending: 0, percentage: 100 },
      { date: '2026-02-19', total: 2, taken: 2, missed: 0, pending: 0, percentage: 100 },
      { date: '2026-02-20', total: 2, taken: 1, missed: 1, pending: 0, percentage: 50 },
      { date: '2026-02-21', total: 2, taken: 2, missed: 0, pending: 0, percentage: 100 },
      { date: '2026-02-22', total: 2, taken: 2, missed: 0, pending: 0, percentage: 100 },
    ];
    const result = calcStreak(daily);
    expect(result.current).toBe(2);
    expect(result.longest).toBe(2);
  });

  it('находит longest streak в середине', () => {
    const daily: DailyDiscipline[] = [
      { date: '2026-02-16', total: 1, taken: 1, missed: 0, pending: 0, percentage: 100 },
      { date: '2026-02-17', total: 1, taken: 1, missed: 0, pending: 0, percentage: 100 },
      { date: '2026-02-18', total: 1, taken: 1, missed: 0, pending: 0, percentage: 100 },
      { date: '2026-02-19', total: 1, taken: 1, missed: 0, pending: 0, percentage: 100 },
      { date: '2026-02-20', total: 1, taken: 0, missed: 1, pending: 0, percentage: 0 },
      { date: '2026-02-21', total: 1, taken: 1, missed: 0, pending: 0, percentage: 100 },
      { date: '2026-02-22', total: 1, taken: 1, missed: 0, pending: 0, percentage: 100 },
    ];
    const result = calcStreak(daily);
    expect(result.current).toBe(2);
    expect(result.longest).toBe(4);
  });

  it('пропускает дни без приёмов', () => {
    const daily: DailyDiscipline[] = [
      { date: '2026-02-20', total: 0, taken: 0, missed: 0, pending: 0, percentage: 0 },
      { date: '2026-02-21', total: 2, taken: 2, missed: 0, pending: 0, percentage: 100 },
      { date: '2026-02-22', total: 2, taken: 2, missed: 0, pending: 0, percentage: 100 },
    ];
    const result = calcStreak(daily);
    expect(result.current).toBe(2);
  });
});

describe('buildDailyTrend', () => {
  it('создаёт записи для указанного количества дней', () => {
    const result = buildDailyTrend([], 7);
    expect(result).toHaveLength(7);
    expect(result.every((d) => d.total === 0 && d.percentage === 0)).toBe(true);
  });

  it('группирует логи по дням', () => {
    const logs: LogRecord[] = [
      makeLog('taken', daysAgo(0), 5),
      makeLog('taken', daysAgo(0), 10),
      makeLog('missed', daysAgo(0)),
      makeLog('taken', daysAgo(1), 0),
    ];
    const result = buildDailyTrend(logs, 3);

    const todayEntry = result.find((d) => d.date === daysAgo(0).toISOString().slice(0, 10));
    expect(todayEntry?.taken).toBe(2);
    expect(todayEntry?.missed).toBe(1);
    expect(todayEntry?.total).toBe(3);
    expect(todayEntry?.percentage).toBe(67);

    const yesterdayEntry = result.find((d) => d.date === daysAgo(1).toISOString().slice(0, 10));
    expect(yesterdayEntry?.taken).toBe(1);
    expect(yesterdayEntry?.percentage).toBe(100);
  });

  it('результат отсортирован по дате', () => {
    const result = buildDailyTrend([], 10);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].date >= result[i - 1].date).toBe(true);
    }
  });
});

describe('calculateStats', () => {
  it('возвращает нули для пустого массива', () => {
    const result = calculateStats([], 7);
    expect(result.totalLogs).toBe(0);
    expect(result.disciplinePercent).toBe(0);
    expect(result.avgDelayMinutes).toBe(0);
    expect(result.currentStreak).toBe(0);
    expect(result.dailyTrend).toHaveLength(7);
  });

  it('рассчитывает полные метрики', () => {
    const logs: LogRecord[] = [
      makeLog('taken', daysAgo(0), 5),
      makeLog('taken', daysAgo(0), 15),
      makeLog('missed', daysAgo(1)),
      makeLog('taken', daysAgo(2), 10),
      makeLog('taken', daysAgo(3), 0),
      makeLog('pending', daysAgo(0)),
    ];
    const result = calculateStats(logs, 7);

    expect(result.totalLogs).toBe(6);
    expect(result.takenCount).toBe(4);
    expect(result.missedCount).toBe(1);
    expect(result.pendingCount).toBe(1);
    expect(result.disciplinePercent).toBe(80);
    expect(result.avgDelayMinutes).toBeGreaterThanOrEqual(0);
    expect(result.dailyTrend).toHaveLength(7);
  });
});
