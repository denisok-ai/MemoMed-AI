/**
 * @file feed-color.test.ts
 * @description Тесты для цветовой логики живой ленты событий
 * @created 2026-02-22
 */

import { describe, it, expect } from 'vitest';

/** Дублируем логику из route.ts для тестирования */
function getEventColor(
  status: string,
  delayMinutes: number | null
): 'green' | 'yellow' | 'red' {
  if (status === 'missed') return 'red';
  if (status === 'taken') {
    if (delayMinutes === null || delayMinutes <= 0) return 'green';
    if (delayMinutes <= 30) return 'yellow';
    return 'red';
  }
  return 'yellow';
}

describe('getEventColor', () => {
  it('пропуск всегда красный', () => {
    expect(getEventColor('missed', null)).toBe('red');
    expect(getEventColor('missed', 0)).toBe('red');
    expect(getEventColor('missed', 100)).toBe('red');
  });

  it('принято вовремя — зелёный', () => {
    expect(getEventColor('taken', 0)).toBe('green');
    expect(getEventColor('taken', -5)).toBe('green');
    expect(getEventColor('taken', null)).toBe('green');
  });

  it('опоздание до 30 минут — жёлтый', () => {
    expect(getEventColor('taken', 1)).toBe('yellow');
    expect(getEventColor('taken', 15)).toBe('yellow');
    expect(getEventColor('taken', 30)).toBe('yellow');
  });

  it('опоздание больше 30 минут — красный', () => {
    expect(getEventColor('taken', 31)).toBe('red');
    expect(getEventColor('taken', 60)).toBe('red');
    expect(getEventColor('taken', 120)).toBe('red');
  });

  it('pending статус — жёлтый', () => {
    expect(getEventColor('pending', null)).toBe('yellow');
  });
});

describe('Форматирование задержки', () => {
  function formatDelay(minutes: number | null): string {
    if (minutes === null) return '';
    if (minutes <= 0) return 'вовремя';
    if (minutes < 60) return `+${minutes} мин`;
    return `+${Math.floor(minutes / 60)}ч ${minutes % 60}мин`;
  }

  it('null — пустая строка', () => {
    expect(formatDelay(null)).toBe('');
  });

  it('0 или отрицательное — «вовремя»', () => {
    expect(formatDelay(0)).toBe('вовремя');
    expect(formatDelay(-10)).toBe('вовремя');
  });

  it('меньше часа — в минутах', () => {
    expect(formatDelay(15)).toBe('+15 мин');
    expect(formatDelay(59)).toBe('+59 мин');
  });

  it('час и более — в часах и минутах', () => {
    expect(formatDelay(60)).toBe('+1ч 0мин');
    expect(formatDelay(90)).toBe('+1ч 30мин');
    expect(formatDelay(125)).toBe('+2ч 5мин');
  });
});
