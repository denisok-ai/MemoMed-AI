/**
 * @file api-health.test.ts
 * @description Integration-тест API GET /api/health
 * @created 2026-02-24
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/health/route';

const mockQueryRaw = vi.fn();
const mockPing = vi.fn();

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    $queryRaw: (...args: unknown[]) => mockQueryRaw(...args),
  },
}));

vi.mock('@/lib/db/redis', () => ({
  redis: {
    ping: () => mockPing(),
  },
}));

describe('GET /api/health', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryRaw.mockResolvedValue([{ '?column?': 1 }]);
    mockPing.mockResolvedValue('PONG');
  });

  it('возвращает 200 и status ok при доступных БД и Redis', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(data.services.database).toBe('ok');
    expect(data.services.redis).toBe('ok');
    expect(data.version).toBeDefined();
    expect(data.timestamp).toBeDefined();
  });

  it('возвращает 503 при недоступной БД', async () => {
    mockQueryRaw.mockRejectedValueOnce(new Error('Connection refused'));
    const res = await GET();
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.status).toBe('degraded');
    expect(data.services.database).toBe('error');
    expect(data.services.redis).toBe('ok');
  });

  it('возвращает 503 при недоступном Redis', async () => {
    mockPing.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    const res = await GET();
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.status).toBe('degraded');
    expect(data.services.database).toBe('ok');
    expect(data.services.redis).toBe('error');
  });

  it('возвращает 503 при недоступных обоих сервисах', async () => {
    mockQueryRaw.mockRejectedValue(new Error('DB down'));
    mockPing.mockRejectedValue(new Error('Redis down'));
    const res = await GET();
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.status).toBe('error');
    expect(data.services.database).toBe('error');
    expect(data.services.redis).toBe('error');
  });
});
