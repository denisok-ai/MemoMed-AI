/**
 * @file reminder.prompt.test.ts
 * @description Unit-тесты для reminder.prompt: getPersonalizedReminderText
 * @created 2026-02-24
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db/redis', () => ({
  redis: {
    get: vi.fn(),
    setex: vi.fn(),
  },
}));

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(function () {
    return {
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{ message: { content: 'Доброе утро! Пора принять лекарство.' } }],
          }),
        },
      },
    };
  }),
}));

import { redis } from '@/lib/db/redis';
import { getPersonalizedReminderText } from '@/lib/ai/reminder.prompt';

describe('getPersonalizedReminderText', () => {
  const ctx = {
    medicationName: 'Метформин',
    dosage: '500 мг',
    scheduledTime: '08:00',
    delayMinutes: 0,
    patientName: 'Иван',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(redis.get).mockResolvedValue(null);
    vi.mocked(redis.setex).mockResolvedValue(null);
    process.env.DEEPSEEK_API_KEY = 'test-key';
  });

  it('возвращает null если DEEPSEEK_API_KEY не задан', async () => {
    delete process.env.DEEPSEEK_API_KEY;
    const result = await getPersonalizedReminderText(ctx);
    expect(result).toBeNull();
  });

  it('возвращает кэшированное значение из Redis', async () => {
    vi.mocked(redis.get).mockResolvedValue('Кэшированное напоминание');
    const result = await getPersonalizedReminderText(ctx);
    expect(result).toBe('Кэшированное напоминание');
  });

  it('вызывает API и сохраняет в кэш при промахе', async () => {
    const result = await getPersonalizedReminderText(ctx);
    expect(result).toBe('Доброе утро! Пора принять лекарство.');
    expect(redis.setex).toHaveBeenCalled();
  });
});
