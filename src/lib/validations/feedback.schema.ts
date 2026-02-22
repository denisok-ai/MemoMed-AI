/**
 * @file feedback.schema.ts
 * @description Zod-схемы для отзывов по лекарствам.
 * Эффективность и побочки: 1–5, свободный текст для деталей.
 * @created 2026-02-22
 */

import { z } from 'zod';

export const medicationFeedbackSchema = z.object({
  medicationId: z.string().uuid('Неверный ID лекарства'),
  effectivenessScore: z
    .number()
    .int()
    .min(1, 'Минимум 1')
    .max(5, 'Максимум 5')
    .nullable()
    .optional(),
  sideEffects: z.string().max(500, 'Максимум 500 символов').nullable().optional(),
  freeText: z.string().max(2000, 'Максимум 2000 символов').nullable().optional(),
});

export type MedicationFeedbackInput = z.infer<typeof medicationFeedbackSchema>;
