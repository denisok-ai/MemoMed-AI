/**
 * @file reminders.queue.test.ts
 * @description Unit-тесты для scheduleReminders, cancelReminders
 * @created 2026-02-24
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockAddFn, mockGetJobFn } = vi.hoisted(() => ({
  mockAddFn: vi.fn().mockResolvedValue({ id: 'job-1' }),
  mockGetJobFn: vi.fn().mockResolvedValue({ remove: vi.fn().mockResolvedValue(undefined) }),
}));

vi.mock('bullmq', () => ({
  Queue: vi.fn().mockImplementation(function () {
    return { add: mockAddFn, getJob: mockGetJobFn };
  }),
}));

import { scheduleReminders, cancelReminders } from '@/lib/reminders/queue';

describe('scheduleReminders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 1, 24, 6, 0, 0)); // 06:00 — до 08:00
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('добавляет задачи в очередь для будущих напоминаний', async () => {
    await scheduleReminders('med-1', 'p1', 'Метформин', '500 мг', '08:00');

    expect(mockAddFn).toHaveBeenCalled();
    const calls = mockAddFn.mock.calls;
    expect(calls.length).toBeGreaterThanOrEqual(1);
    expect(calls[0]![1]).toMatchObject({
      medicationId: 'med-1',
      patientId: 'p1',
      medicationName: 'Метформин',
      dosage: '500 мг',
      scheduledTime: '08:00',
    });
  });
});

describe('cancelReminders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetJobFn.mockResolvedValue({ remove: vi.fn().mockResolvedValue(undefined) });
  });

  it('вызывает getJob для каждого delay', async () => {
    await cancelReminders('med-1', '2026-02-24T08:00:00.000Z');

    expect(mockGetJobFn).toHaveBeenCalled();
    expect(mockGetJobFn.mock.calls.length).toBe(4); // 0, 10, 20, 30
  });

  it('не падает при отсутствии job', async () => {
    mockGetJobFn.mockResolvedValue(null);

    await expect(cancelReminders('med-1', '2026-02-24T08:00:00.000Z')).resolves.not.toThrow();
  });
});
