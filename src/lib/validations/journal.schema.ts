/**
 * @file journal.schema.ts
 * @description Zod-схемы для дневника самочувствия.
 * Все метрики от 1 до 5: 1 = плохо, 5 = отлично.
 * @created 2026-02-22
 */

import { z } from 'zod';

/** Оценка самочувствия: 1–5 или null (не заполнено) */
const scoreField = z
  .number({ error: 'Должно быть числом' })
  .int()
  .min(1, 'Минимум 1')
  .max(5, 'Максимум 5')
  .nullable()
  .optional();

export const journalEntrySchema = z.object({
  logDate: z
    .string({ error: 'Дата обязательна' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Формат даты: YYYY-MM-DD'),
  moodScore: scoreField,
  painLevel: scoreField,
  sleepQuality: scoreField,
  energyLevel: scoreField,
  freeText: z.string().max(2000, 'Максимум 2000 символов').optional().nullable(),
});

export type JournalEntryInput = z.infer<typeof journalEntrySchema>;
