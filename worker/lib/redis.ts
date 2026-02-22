/**
 * @file redis.ts
 * @description Redis client instances for worker service
 * @created 2026-02-22
 */

import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const redisConnection = {
  host: new URL(process.env.REDIS_URL ?? 'redis://localhost:6379').hostname,
  port: parseInt(new URL(process.env.REDIS_URL ?? 'redis://localhost:6379').port || '6379'),
};

process.on('beforeExit', async () => {
  await redis.quit();
});
