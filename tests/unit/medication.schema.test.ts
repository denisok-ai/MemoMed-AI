/**
 * @file medication.schema.test.ts
 * @description Юнит-тесты для Zod-схем валидации лекарств
 * @created 2026-02-22
 */

import { describe, it, expect } from 'vitest';
import { createMedicationSchema, updateMedicationSchema } from '@/lib/validations/medication.schema';

describe('createMedicationSchema', () => {
  const validData = {
    name: 'Аспирин',
    dosage: '1 таблетка 500 мг',
    scheduledTime: '08:00',
  };

  it('принимает корректные данные', () => {
    const result = createMedicationSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('принимает данные с опциональной инструкцией', () => {
    const result = createMedicationSchema.safeParse({
      ...validData,
      instruction: 'Принимать после еды',
    });
    expect(result.success).toBe(true);
  });

  it('отклоняет слишком короткое название', () => {
    const result = createMedicationSchema.safeParse({ ...validData, name: 'А' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain('не менее 2 символов');
  });

  it('отклоняет пустую дозировку', () => {
    const result = createMedicationSchema.safeParse({ ...validData, dosage: '' });
    expect(result.success).toBe(false);
  });

  it('отклоняет некорректный формат времени', () => {
    const result = createMedicationSchema.safeParse({ ...validData, scheduledTime: '25:00' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain('ЧЧ:ММ');
  });

  it('отклоняет время без минут', () => {
    const result = createMedicationSchema.safeParse({ ...validData, scheduledTime: '8:0' });
    expect(result.success).toBe(false);
  });

  it('принимает граничное время 23:59', () => {
    const result = createMedicationSchema.safeParse({ ...validData, scheduledTime: '23:59' });
    expect(result.success).toBe(true);
  });

  it('принимает граничное время 00:00', () => {
    const result = createMedicationSchema.safeParse({ ...validData, scheduledTime: '00:00' });
    expect(result.success).toBe(true);
  });
});

describe('updateMedicationSchema', () => {
  it('принимает пустой объект (все поля опциональны)', () => {
    const result = updateMedicationSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('принимает частичное обновление', () => {
    const result = updateMedicationSchema.safeParse({ name: 'Ибупрофен' });
    expect(result.success).toBe(true);
  });

  it('отклоняет некорректный формат времени при частичном обновлении', () => {
    const result = updateMedicationSchema.safeParse({ scheduledTime: 'invalid' });
    expect(result.success).toBe(false);
  });
});
