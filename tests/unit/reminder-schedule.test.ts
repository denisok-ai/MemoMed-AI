/**
 * @file reminder-schedule.test.ts
 * @description Unit-тесты для логики планирования напоминаний (schedule-utils)
 * @created 2026-02-22
 */

import { describe, it, expect } from 'vitest';
import {
  computeNextScheduledAt,
  getReminderJobId,
  getReminderJobIds,
  REMINDER_DELAYS,
} from '@/lib/reminders/schedule-utils';

describe('computeNextScheduledAt', () => {
  it('если время ещё не наступило сегодня — возвращает сегодня', () => {
    const now = new Date(2026, 1, 22, 10, 0, 0); // 22 Feb 2026 10:00 local
    const result = computeNextScheduledAt('14:00', now);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(0);
    expect(result.getDate()).toBe(22);
  });

  it('если время уже прошло сегодня — возвращает завтра', () => {
    const now = new Date(2026, 1, 22, 14, 0, 0); // 22 Feb 2026 14:00 local
    const result = computeNextScheduledAt('08:00', now);
    expect(result.getHours()).toBe(8);
    expect(result.getMinutes()).toBe(0);
    expect(result.getDate()).toBe(23);
  });

  it('ровно в момент времени — возвращает завтра (<= now)', () => {
    const now = new Date(2026, 1, 22, 8, 0, 0); // 22 Feb 2026 08:00 local
    const result = computeNextScheduledAt('08:00', now);
    expect(result.getDate()).toBe(23);
  });

  it('невалидный формат — использует 0:00', () => {
    const now = new Date(2026, 1, 22, 12, 0, 0);
    const result = computeNextScheduledAt('invalid', now);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
  });
});

describe('getReminderJobId', () => {
  it('формирует уникальный jobId', () => {
    const id = getReminderJobId('med-123', '2026-02-22T08:00:00.000Z', 10);
    expect(id).toBe('med-123_2026-02-22T08:00:00.000Z_10');
  });

  it('разные delayMinutes дают разные jobId', () => {
    const base = 'med-1_2026-02-22T08:00:00.000Z_';
    expect(getReminderJobId('med-1', '2026-02-22T08:00:00.000Z', 0)).toBe(base + '0');
    expect(getReminderJobId('med-1', '2026-02-22T08:00:00.000Z', 30)).toBe(base + '30');
  });
});

describe('getReminderJobIds', () => {
  it('возвращает 4 jobId для всех delays', () => {
    const ids = getReminderJobIds('med-1', '2026-02-22T08:00:00.000Z');
    expect(ids).toHaveLength(4);
    expect(ids).toEqual([
      'med-1_2026-02-22T08:00:00.000Z_0',
      'med-1_2026-02-22T08:00:00.000Z_10',
      'med-1_2026-02-22T08:00:00.000Z_20',
      'med-1_2026-02-22T08:00:00.000Z_30',
    ]);
  });
});

describe('REMINDER_DELAYS', () => {
  it('содержит T+0, T+10, T+20, T+30', () => {
    expect(REMINDER_DELAYS).toEqual([0, 10, 20, 30]);
  });
});
