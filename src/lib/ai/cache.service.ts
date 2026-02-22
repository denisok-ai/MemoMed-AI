/**
 * @file cache.service.ts
 * @description Кэширование ответов AI в Redis (TTL 1 час).
 * Поддерживает как строковые ключи, так и массивы сообщений.
 * @dependencies ioredis, crypto
 * @created 2026-02-22
 */

import { createHash } from 'crypto';
import { redis } from '@/lib/db/redis';

const CACHE_PREFIX = 'ai:cache:';
const CACHE_TTL_SECONDS = 3600;

/** Хэширует массив сообщений в ключ Redis */
function buildMessagesKey(messages: Array<{ role: string; content: string }>): string {
  const hash = createHash('sha256')
    .update(JSON.stringify(messages))
    .digest('hex')
    .slice(0, 16);
  return `${CACHE_PREFIX}${hash}`;
}

/** Нормализует строковый ключ — обрезает и хэширует */
function buildStringKey(key: string): string {
  const hash = createHash('sha256').update(key).digest('hex').slice(0, 16);
  return `${CACHE_PREFIX}${hash}`;
}

/** Получить кэшированный ответ по строке-ключу */
export async function getCachedResponse(key: string): Promise<string | null> {
  return redis.get(buildStringKey(key));
}

/** Сохранить ответ по строке-ключу */
export async function setCachedResponse(key: string, response: string): Promise<void> {
  await redis.setex(buildStringKey(key), CACHE_TTL_SECONDS, response);
}

/** Получить кэшированный ответ по массиву сообщений */
export async function getCachedByMessages(
  messages: Array<{ role: string; content: string }>
): Promise<string | null> {
  return redis.get(buildMessagesKey(messages));
}

/** Сохранить ответ по массиву сообщений */
export async function setCachedByMessages(
  messages: Array<{ role: string; content: string }>,
  response: string
): Promise<void> {
  await redis.setex(buildMessagesKey(messages), CACHE_TTL_SECONDS, response);
}
