/**
 * @file cache.service.test.ts
 * @description Unit-тесты для cache.service: getCachedResponse, setCachedResponse, getCachedByMessages
 * @created 2026-02-24
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db/redis', () => ({
  redis: {
    get: vi.fn(),
    setex: vi.fn(),
  },
}));

import { redis } from '@/lib/db/redis';
import {
  getCachedResponse,
  setCachedResponse,
  getCachedByMessages,
  setCachedByMessages,
} from '@/lib/ai/cache.service';

describe('cache.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCachedResponse / setCachedResponse', () => {
    it('getCachedResponse возвращает null при промахе', async () => {
      vi.mocked(redis.get).mockResolvedValue(null);
      const result = await getCachedResponse('my-key');
      expect(result).toBeNull();
      expect(redis.get).toHaveBeenCalledWith(expect.stringMatching(/^ai:cache:[a-f0-9]{16}$/));
    });

    it('getCachedResponse возвращает значение при попадании', async () => {
      vi.mocked(redis.get).mockResolvedValue('cached answer');
      const result = await getCachedResponse('my-key');
      expect(result).toBe('cached answer');
    });

    it('setCachedResponse вызывает redis.setex с TTL 3600', async () => {
      vi.mocked(redis.setex).mockResolvedValue(undefined);
      await setCachedResponse('key', 'response');
      expect(redis.setex).toHaveBeenCalledWith(
        expect.stringMatching(/^ai:cache:[a-f0-9]{16}$/),
        3600,
        'response'
      );
    });

    it('одинаковый ключ даёт одинаковый хэш', async () => {
      vi.mocked(redis.get).mockResolvedValue(null);
      await getCachedResponse('same-key');
      await getCachedResponse('same-key');
      const calls = vi.mocked(redis.get).mock.calls;
      expect(calls[0]![0]).toBe(calls[1]![0]);
    });
  });

  describe('getCachedByMessages / setCachedByMessages', () => {
    it('getCachedByMessages возвращает null при промахе', async () => {
      vi.mocked(redis.get).mockResolvedValue(null);
      const result = await getCachedByMessages([
        { role: 'user', content: 'hello' },
        { role: 'assistant', content: 'hi' },
      ]);
      expect(result).toBeNull();
    });

    it('getCachedByMessages возвращает значение при попадании', async () => {
      vi.mocked(redis.get).mockResolvedValue('AI response');
      const result = await getCachedByMessages([{ role: 'user', content: 'test' }]);
      expect(result).toBe('AI response');
    });

    it('setCachedByMessages вызывает redis.setex', async () => {
      vi.mocked(redis.setex).mockResolvedValue(undefined);
      await setCachedByMessages(
        [
          { role: 'user', content: 'q' },
          { role: 'assistant', content: 'a' },
        ],
        'cached'
      );
      expect(redis.setex).toHaveBeenCalledWith(
        expect.stringMatching(/^ai:cache:[a-f0-9]{16}$/),
        3600,
        'cached'
      );
    });
  });
});
