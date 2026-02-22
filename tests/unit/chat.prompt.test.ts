/**
 * @file chat.prompt.test.ts
 * @description Unit-тесты для констант системного промпта чат-ассистента
 * @created 2026-02-22
 */

import { describe, it, expect } from 'vitest';
import {
  CHAT_SYSTEM_PROMPT,
  CHAT_DISCLAIMER,
  AI_FIRST_USE_DISCLAIMER,
} from '@/lib/ai/prompts/chat.prompt';

describe('CHAT_SYSTEM_PROMPT', () => {
  it('определён и является строкой', () => {
    expect(typeof CHAT_SYSTEM_PROMPT).toBe('string');
    expect(CHAT_SYSTEM_PROMPT.length).toBeGreaterThan(0);
  });

  it('содержит правило ограничения длины ответа', () => {
    expect(CHAT_SYSTEM_PROMPT).toMatch(/КРАТКО|2-3 предложения/i);
  });

  it('содержит запрет на постановку диагнозов', () => {
    expect(CHAT_SYSTEM_PROMPT).toMatch(/НЕ ставь диагнозы/i);
  });

  it('содержит правило обращения на "Вы"', () => {
    expect(CHAT_SYSTEM_PROMPT).toMatch(/обращайся на.*"Вы"/i);
  });

  it('содержит рекомендацию обратиться к врачу при серьёзных жалобах', () => {
    expect(CHAT_SYSTEM_PROMPT).toMatch(/врач/i);
  });

  it('включает дисклеймер в конце каждого ответа', () => {
    expect(CHAT_SYSTEM_PROMPT).toMatch(/При любых сомнениях/i);
  });
});

describe('CHAT_DISCLAIMER', () => {
  it('определён и является строкой', () => {
    expect(typeof CHAT_DISCLAIMER).toBe('string');
    expect(CHAT_DISCLAIMER.length).toBeGreaterThan(0);
  });

  it('содержит призыв обратиться к врачу', () => {
    expect(CHAT_DISCLAIMER).toContain('врачу');
  });

  it('совпадает с дисклеймером в системном промпте', () => {
    expect(CHAT_SYSTEM_PROMPT).toContain(CHAT_DISCLAIMER);
  });
});

describe('AI_FIRST_USE_DISCLAIMER', () => {
  it('определён и является строкой', () => {
    expect(typeof AI_FIRST_USE_DISCLAIMER).toBe('string');
    expect(AI_FIRST_USE_DISCLAIMER.length).toBeGreaterThan(0);
  });

  it('упоминает, что ИИ не ставит диагнозы', () => {
    expect(AI_FIRST_USE_DISCLAIMER).toMatch(/Не ставит диагнозы/i);
  });

  it('упоминает, что ИИ не заменяет врача', () => {
    expect(AI_FIRST_USE_DISCLAIMER).toMatch(/не заменяет/i);
  });

  it('рекомендует обращаться к врачу при ухудшении', () => {
    expect(AI_FIRST_USE_DISCLAIMER).toMatch(/ухудшении/i);
  });

  it('длиннее краткого дисклеймера CHAT_DISCLAIMER', () => {
    expect(AI_FIRST_USE_DISCLAIMER.length).toBeGreaterThan(CHAT_DISCLAIMER.length);
  });
});
