/**
 * @file locale.test.ts
 * @description Тесты для функции определения локали i18n
 * @created 2026-02-22
 */

import { describe, it, expect } from 'vitest';
import { isValidLocale, SUPPORTED_LOCALES } from '@/i18n/request';

describe('isValidLocale', () => {
  it('возвращает true для "ru"', () => {
    expect(isValidLocale('ru')).toBe(true);
  });

  it('возвращает true для "en"', () => {
    expect(isValidLocale('en')).toBe(true);
  });

  it('возвращает false для несуществующей локали "de"', () => {
    expect(isValidLocale('de')).toBe(false);
  });

  it('возвращает false для пустой строки', () => {
    expect(isValidLocale('')).toBe(false);
  });

  it('возвращает false для "RU" (регистрозависимо)', () => {
    expect(isValidLocale('RU')).toBe(false);
  });

  it('возвращает false для "undefined"', () => {
    expect(isValidLocale('undefined')).toBe(false);
  });

  it('SUPPORTED_LOCALES содержит ровно 2 локали', () => {
    expect(SUPPORTED_LOCALES).toHaveLength(2);
  });

  it('SUPPORTED_LOCALES содержит ru и en', () => {
    expect(SUPPORTED_LOCALES).toContain('ru');
    expect(SUPPORTED_LOCALES).toContain('en');
  });
});
