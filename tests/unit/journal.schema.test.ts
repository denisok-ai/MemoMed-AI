/**
 * @file journal.schema.test.ts
 * @description Тесты Zod-схемы дневника самочувствия
 * @created 2026-02-22
 */

import { describe, it, expect } from 'vitest';
import { journalEntrySchema } from '@/lib/validations/journal.schema';

describe('journalEntrySchema', () => {
  it('принимает валидную запись со всеми полями', () => {
    const result = journalEntrySchema.safeParse({
      logDate: '2026-02-22',
      moodScore: 4,
      painLevel: 2,
      sleepQuality: 5,
      energyLevel: 3,
      freeText: 'Хорошо себя чувствую',
    });
    expect(result.success).toBe(true);
  });

  it('принимает запись только с датой (все метрики опциональны)', () => {
    const result = journalEntrySchema.safeParse({ logDate: '2026-02-22' });
    expect(result.success).toBe(true);
  });

  it('отклоняет отсутствие даты', () => {
    const result = journalEntrySchema.safeParse({ moodScore: 3 });
    expect(result.success).toBe(false);
  });

  it('отклоняет неверный формат даты', () => {
    const result = journalEntrySchema.safeParse({ logDate: '22-02-2026' });
    expect(result.success).toBe(false);
  });

  it('отклоняет оценку меньше 1', () => {
    const result = journalEntrySchema.safeParse({ logDate: '2026-02-22', moodScore: 0 });
    expect(result.success).toBe(false);
  });

  it('отклоняет оценку больше 5', () => {
    const result = journalEntrySchema.safeParse({ logDate: '2026-02-22', energyLevel: 6 });
    expect(result.success).toBe(false);
  });

  it('принимает null для метрик (явный сброс)', () => {
    const result = journalEntrySchema.safeParse({
      logDate: '2026-02-22',
      moodScore: null,
      painLevel: null,
    });
    expect(result.success).toBe(true);
  });

  it('отклоняет freeText длиннее 2000 символов', () => {
    const result = journalEntrySchema.safeParse({
      logDate: '2026-02-22',
      freeText: 'a'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it('принимает дробные оценки путём отклонения (int only)', () => {
    const result = journalEntrySchema.safeParse({
      logDate: '2026-02-22',
      moodScore: 3.5,
    });
    expect(result.success).toBe(false);
  });
});
