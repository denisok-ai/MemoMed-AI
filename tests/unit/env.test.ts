/**
 * @file env.test.ts
 * @description Unit-тесты для env: getServerEnv (валидация переменных окружения)
 * @created 2026-02-24
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const originalEnv = process.env;

describe('getServerEnv', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      DATABASE_URL: 'postgresql://localhost:5432/test',
      NEXTAUTH_SECRET: 'test-secret-at-least-16-chars',
      REDIS_URL: 'redis://localhost:6379',
      NODE_ENV: 'test',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('возвращает валидный env при корректных переменных', async () => {
    const { getServerEnv } = await import('@/lib/env');
    const env = getServerEnv();
    expect(env.DATABASE_URL).toBe('postgresql://localhost:5432/test');
    expect(env.NEXTAUTH_SECRET).toBe('test-secret-at-least-16-chars');
    expect(env.REDIS_URL).toBe('redis://localhost:6379');
    expect(env.NODE_ENV).toBe('test');
  });

  it('использует дефолты для опциональных полей', async () => {
    const { getServerEnv } = await import('@/lib/env');
    const env = getServerEnv();
    expect(env.DEEPSEEK_BASE_URL).toBe('https://api.deepseek.com/v1');
    expect(env.DEEPSEEK_MODEL).toBe('deepseek-chat');
    expect(env.STORAGE_TYPE).toBe('local');
    expect(env.UPLOAD_MAX_SIZE_MB).toBe(5);
  });
});
