/**
 * @file cache.service.ts
 * @description Redis-based AI response caching service
 * @dependencies ioredis, crypto
 * @created 2026-02-22
 */

import { createHash } from 'crypto';
import { redis } from '@/lib/db/redis';

const CACHE_PREFIX = 'ai:cache:';
const CACHE_TTL_SECONDS = 3600; // 1 hour

function buildCacheKey(messages: Array<{ role: string; content: string }>): string {
  const hash = createHash('sha256')
    .update(JSON.stringify(messages))
    .digest('hex')
    .slice(0, 16);
  return `${CACHE_PREFIX}${hash}`;
}

export async function getCachedResponse(
  messages: Array<{ role: string; content: string }>
): Promise<string | null> {
  const key = buildCacheKey(messages);
  return redis.get(key);
}

export async function setCachedResponse(
  messages: Array<{ role: string; content: string }>,
  response: string
): Promise<void> {
  const key = buildCacheKey(messages);
  await redis.setex(key, CACHE_TTL_SECONDS, response);
}
