/**
 * @file medication.schema.ts
 * @description Zod-схемы валидации для лекарств
 * @dependencies zod
 * @created 2026-02-22
 */

import { z } from 'zod';

/** Формат времени HH:MM для расписания приёма */
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Схема создания лекарства */
export const createMedicationSchema = z.object({
  name: z
    .string()
    .min(2, 'Название должно быть не менее 2 символов')
    .max(100, 'Название слишком длинное'),
  dosage: z
    .string()
    .min(1, 'Укажите дозировку')
    .max(50, 'Дозировка слишком длинная'),
  instruction: z.string().max(1000, 'Инструкция слишком длинная').optional(),
  scheduledTime: z
    .string()
    .regex(timeRegex, 'Время должно быть в формате ЧЧ:ММ'),
});

/** Схема редактирования лекарства (все поля опциональные) */
export const updateMedicationSchema = createMedicationSchema.partial();

export type CreateMedicationInput = z.infer<typeof createMedicationSchema>;
export type UpdateMedicationInput = z.infer<typeof updateMedicationSchema>;
