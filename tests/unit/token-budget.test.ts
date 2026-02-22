/**
 * @file token-budget.test.ts
 * @description Unit tests for AI token budget management
 * @created 2026-02-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db/redis', () => ({
  redis: {
    get: vi.fn(),
    setex: vi.fn(),
    incrby: vi.fn(),
    expire: vi.fn(),
    pipeline: vi.fn(() => ({
      incrby: vi.fn().mockReturnThis(),
      expire: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue(null),
    })),
  },
}));

import { getRemainingTokens, isTokenBudgetExceeded } from '@/lib/ai/token-budget';
import { redis } from '@/lib/db/redis';

describe('Token Budget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns full budget when no tokens used', async () => {
    vi.mocked(redis.get).mockResolvedValue(null);
    const remaining = await getRemainingTokens('user-123');
    expect(remaining).toBe(50_000);
  });

  it('returns remaining tokens correctly', async () => {
    vi.mocked(redis.get).mockResolvedValue('10000');
    const remaining = await getRemainingTokens('user-123');
    expect(remaining).toBe(40_000);
  });

  it('returns 0 when budget exceeded', async () => {
    vi.mocked(redis.get).mockResolvedValue('60000');
    const remaining = await getRemainingTokens('user-123');
    expect(remaining).toBe(0);
  });

  it('detects exceeded budget correctly', async () => {
    vi.mocked(redis.get).mockResolvedValue('50001');
    const exceeded = await isTokenBudgetExceeded('user-123');
    expect(exceeded).toBe(true);
  });

  it('detects non-exceeded budget correctly', async () => {
    vi.mocked(redis.get).mockResolvedValue('10000');
    const exceeded = await isTokenBudgetExceeded('user-123');
    expect(exceeded).toBe(false);
  });
});
