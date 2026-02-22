/**
 * @file feedback.schema.test.ts
 * @description Тесты Zod-схемы для отзывов о лекарствах
 * @created 2026-02-22
 */

import { describe, it, expect } from 'vitest';
import { medicationFeedbackSchema } from '@/lib/validations/feedback.schema';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('medicationFeedbackSchema', () => {
  it('принимает минимально валидный объект (только medicationId)', () => {
    const result = medicationFeedbackSchema.safeParse({ medicationId: VALID_UUID });
    expect(result.success).toBe(true);
  });

  it('принимает полный объект со всеми полями', () => {
    const result = medicationFeedbackSchema.safeParse({
      medicationId: VALID_UUID,
      effectivenessScore: 4,
      sideEffects: 'лёгкая тошнота',
      freeText: 'Лекарство помогает, но принимать нужно с едой',
    });
    expect(result.success).toBe(true);
  });

  it('принимает effectivenessScore = 1 (минимум)', () => {
    const result = medicationFeedbackSchema.safeParse({
      medicationId: VALID_UUID,
      effectivenessScore: 1,
    });
    expect(result.success).toBe(true);
  });

  it('принимает effectivenessScore = 5 (максимум)', () => {
    const result = medicationFeedbackSchema.safeParse({
      medicationId: VALID_UUID,
      effectivenessScore: 5,
    });
    expect(result.success).toBe(true);
  });

  it('отклоняет effectivenessScore = 0 (меньше минимума)', () => {
    const result = medicationFeedbackSchema.safeParse({
      medicationId: VALID_UUID,
      effectivenessScore: 0,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Минимум 1');
  });

  it('отклоняет effectivenessScore = 6 (больше максимума)', () => {
    const result = medicationFeedbackSchema.safeParse({
      medicationId: VALID_UUID,
      effectivenessScore: 6,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Максимум 5');
  });

  it('отклоняет невалидный UUID в medicationId', () => {
    const result = medicationFeedbackSchema.safeParse({
      medicationId: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Неверный ID лекарства');
  });

  it('отклоняет sideEffects длиннее 500 символов', () => {
    const result = medicationFeedbackSchema.safeParse({
      medicationId: VALID_UUID,
      sideEffects: 'a'.repeat(501),
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Максимум 500 символов');
  });

  it('отклоняет freeText длиннее 2000 символов', () => {
    const result = medicationFeedbackSchema.safeParse({
      medicationId: VALID_UUID,
      freeText: 'a'.repeat(2001),
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Максимум 2000 символов');
  });

  it('принимает null-значения в опциональных полях', () => {
    const result = medicationFeedbackSchema.safeParse({
      medicationId: VALID_UUID,
      effectivenessScore: null,
      sideEffects: null,
      freeText: null,
    });
    expect(result.success).toBe(true);
  });

  it('не принимает нецелый effectivenessScore', () => {
    const result = medicationFeedbackSchema.safeParse({
      medicationId: VALID_UUID,
      effectivenessScore: 3.5,
    });
    expect(result.success).toBe(false);
  });
});
