/**
 * @file calendar.test.ts
 * @description Тесты для логики цветовой индикации календаря дисциплины
 * @created 2026-02-22
 */

import { describe, it, expect } from 'vitest';

type DayColor = 'green' | 'yellow' | 'red' | 'empty';

function getDayColor(takenCount: number, totalCount: number, missedCount: number): DayColor {
  if (totalCount === 0) return 'empty';
  if (missedCount === 0 && takenCount > 0) return 'green';
  if (missedCount <= 2) return 'yellow';
  return 'red';
}

function calcDisciplinePercent(taken: number, total: number): number {
  return total > 0 ? Math.round((taken / total) * 100) : 0;
}

describe('getDayColor', () => {
  it('пустой день без данных', () => {
    expect(getDayColor(0, 0, 0)).toBe('empty');
  });

  it('100% дисциплина — зелёный', () => {
    expect(getDayColor(3, 3, 0)).toBe('green');
    expect(getDayColor(1, 1, 0)).toBe('green');
  });

  it('1-2 пропуска — жёлтый', () => {
    expect(getDayColor(2, 3, 1)).toBe('yellow');
    expect(getDayColor(1, 3, 2)).toBe('yellow');
  });

  it('3 и более пропусков — красный', () => {
    expect(getDayColor(0, 3, 3)).toBe('red');
    expect(getDayColor(1, 5, 4)).toBe('red');
  });

  it('принято хотя бы одно, пропусков нет — зелёный', () => {
    expect(getDayColor(5, 5, 0)).toBe('green');
  });
});

describe('calcDisciplinePercent', () => {
  it('100% при всех принятых', () => {
    expect(calcDisciplinePercent(5, 5)).toBe(100);
  });

  it('0% при отсутствии данных', () => {
    expect(calcDisciplinePercent(0, 0)).toBe(0);
  });

  it('округление до целого', () => {
    expect(calcDisciplinePercent(1, 3)).toBe(33);
    expect(calcDisciplinePercent(2, 3)).toBe(67);
  });

  it('частичное выполнение', () => {
    expect(calcDisciplinePercent(3, 5)).toBe(60);
    expect(calcDisciplinePercent(4, 5)).toBe(80);
  });
});
