/**
 * @file utils.test.ts
 * @description Unit-тесты для утилит (formatTime, formatDate, getDelayMinutes, getMedicationStatusColor)
 * @created 2026-02-24
 */

import { describe, it, expect } from 'vitest';
import {
  formatTime,
  formatDate,
  getDelayMinutes,
  getMedicationStatusColor,
  cn,
  generateInviteCode,
} from '@/lib/utils';

describe('formatTime', () => {
  it('форматирует время в ru-RU', () => {
    const date = new Date(2026, 1, 24, 8, 30, 0);
    const result = formatTime(date);
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });
});

describe('formatDate', () => {
  it('форматирует дату в ru-RU', () => {
    const date = new Date(2026, 1, 24);
    const result = formatDate(date);
    expect(result).toContain('2026');
  });
});

describe('getDelayMinutes', () => {
  it('возвращает 0 при одинаковом времени', () => {
    const d = new Date(2026, 1, 24, 8, 0, 0);
    expect(getDelayMinutes(d, d)).toBe(0);
  });

  it('возвращает положительные минуты при опоздании', () => {
    const scheduled = new Date(2026, 1, 24, 8, 0, 0);
    const actual = new Date(2026, 1, 24, 8, 15, 0);
    expect(getDelayMinutes(scheduled, actual)).toBe(15);
  });

  it('возвращает отрицательные минуты при раннем приёме', () => {
    const scheduled = new Date(2026, 1, 24, 8, 30, 0);
    const actual = new Date(2026, 1, 24, 8, 0, 0);
    expect(getDelayMinutes(scheduled, actual)).toBe(-30);
  });

  it('округление до целых минут', () => {
    const scheduled = new Date(2026, 1, 24, 8, 0, 0);
    const actual = new Date(2026, 1, 24, 8, 0, 30, 500);
    expect(getDelayMinutes(scheduled, actual)).toBe(1);
  });
});

describe('getMedicationStatusColor', () => {
  it('missed — красный', () => {
    expect(getMedicationStatusColor('missed')).toBe('#f44336');
    expect(getMedicationStatusColor('missed', 0)).toBe('#f44336');
  });

  it('taken вовремя — зелёный', () => {
    expect(getMedicationStatusColor('taken', 0)).toBe('#4caf50');
    expect(getMedicationStatusColor('taken', -5)).toBe('#4caf50');
    expect(getMedicationStatusColor('taken')).toBe('#4caf50');
  });

  it('taken опоздание до 30 мин — жёлтый', () => {
    expect(getMedicationStatusColor('taken', 15)).toBe('#ffc107');
    expect(getMedicationStatusColor('taken', 30)).toBe('#ffc107');
  });

  it('taken опоздание > 30 мин — красный', () => {
    expect(getMedicationStatusColor('taken', 31)).toBe('#f44336');
    expect(getMedicationStatusColor('taken', 60)).toBe('#f44336');
  });

  it('pending — slate', () => {
    expect(getMedicationStatusColor('pending')).toBe('#64748b');
  });
});

describe('cn', () => {
  it('объединяет классы', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('фильтрует falsy', () => {
    expect(cn('a', false, 'b', null, undefined)).toBe('a b');
  });
});

describe('generateInviteCode', () => {
  it('возвращает строку длиной 12 символов', () => {
    const code = generateInviteCode();
    expect(code).toHaveLength(12);
  });

  it('содержит только допустимые символы (A-Z без I,O + 2-9)', () => {
    const code = generateInviteCode();
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]{12}$/);
  });

  it('генерирует разные коды при повторных вызовах', () => {
    const codes = new Set(Array.from({ length: 10 }, () => generateInviteCode()));
    expect(codes.size).toBeGreaterThan(1);
  });
});
