/**
 * @file rate-limit.ts
 * @description Rate limiting через Redis.
 * Ограничивает количество запросов от одного IP/пользователя за период.
 * @dependencies ioredis
 * @created 2026-02-22
 */

import { redis } from '@/lib/db/redis';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}

/**
 * Проверяет и обновляет счётчик rate limit.
 * @param key Уникальный ключ (например, `rate:link:userId`)
 * @param limit Максимальное число запросов за период
 * @param windowSeconds Длина окна в секундах
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const fullKey = `rl:${key}`;

  const count = await redis.incr(fullKey);

  // Устанавливаем TTL только при первом инкременте
  if (count === 1) {
    await redis.expire(fullKey, windowSeconds);
  }

  const ttl = await redis.ttl(fullKey);
  const resetInSeconds = ttl > 0 ? ttl : windowSeconds;

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    resetInSeconds,
  };
}
