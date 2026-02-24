/**
 * @file rate-limit.test.ts
 * @description Unit-тесты для checkRateLimit (с моком Redis)
 * @created 2026-02-24
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockIncr = vi.fn();
const mockExpire = vi.fn();
const mockTtl = vi.fn();

vi.mock('@/lib/db/redis', () => ({
  redis: {
    incr: (key: string) => mockIncr(key),
    expire: (key: string, ttl: number) => mockExpire(key, ttl),
    ttl: (key: string) => mockTtl(key),
  },
}));

import { checkRateLimit } from '@/lib/rate-limit';

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIncr.mockResolvedValue(1);
    mockExpire.mockResolvedValue('OK');
    mockTtl.mockResolvedValue(3600);
  });

  it('первый запрос — allowed, remaining = limit - 1', async () => {
    mockIncr.mockResolvedValueOnce(1);
    const result = await checkRateLimit('user:123', 5, 3600);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.resetInSeconds).toBe(3600);
    expect(mockExpire).toHaveBeenCalledWith('rl:user:123', 3600);
  });

  it('запрос в пределах лимита — allowed', async () => {
    mockIncr.mockResolvedValueOnce(3);
    const result = await checkRateLimit('user:123', 5, 3600);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
    expect(mockExpire).not.toHaveBeenCalled();
  });

  it('на границе лимита — allowed', async () => {
    mockIncr.mockResolvedValueOnce(5);
    const result = await checkRateLimit('user:123', 5, 3600);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('превышение лимита — not allowed', async () => {
    mockIncr.mockResolvedValueOnce(6);
    const result = await checkRateLimit('user:123', 5, 3600);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('использует префикс rl: в ключе', async () => {
    await checkRateLimit('link:user-1', 5, 3600);
    expect(mockIncr).toHaveBeenCalledWith('rl:link:user-1');
  });
});
