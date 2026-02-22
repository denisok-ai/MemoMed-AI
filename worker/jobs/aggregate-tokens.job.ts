/**
 * @file aggregate-tokens.job.ts
 * @description BullMQ worker: aggregates daily token usage from Redis to PostgreSQL ai_usage_stats
 * @dependencies bullmq, prisma, ioredis
 * @created 2026-02-22
 */

import { Worker, Queue } from 'bullmq';
import { prisma } from '../lib/prisma';
import { redis, redisConnection } from '../lib/redis';

const QUEUE_NAME = 'aggregate-tokens';

export const aggregateTokensQueue = new Queue(QUEUE_NAME, { connection: redisConnection });

export const aggregateTokenUsageWorker = new Worker(
  QUEUE_NAME,
  async () => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const pattern = `ai:tokens:*:${monthKey}`;

    const keys = await redis.keys(pattern);
    let processed = 0;

    for (const key of keys) {
      const parts = key.split(':');
      const userId = parts[2];
      const totalTokensStr = await redis.get(key);

      if (!userId || !totalTokensStr) continue;

      const totalTokens = parseInt(totalTokensStr, 10);
      if (isNaN(totalTokens)) continue;

      await prisma.aiUsageStat.upsert({
        where: { userId_monthKey: { userId, monthKey } },
        update: { totalTokens, updatedAt: new Date() },
        create: { userId, monthKey, totalTokens, messageCount: 0 },
      });

      processed++;
    }

    console.log(`[aggregate-tokens] Aggregated token usage for ${processed} users (${monthKey})`);
  },
  { connection: redisConnection }
);

async function scheduleDailyAggregation(): Promise<void> {
  const existingJobs = await aggregateTokensQueue.getRepeatableJobs();
  if (existingJobs.length === 0) {
    await aggregateTokensQueue.add(
      'daily-aggregation',
      {},
      { repeat: { pattern: '0 3 * * *' } }
    );
    console.log('[aggregate-tokens] Daily aggregation job scheduled at 03:00');
  }
}

scheduleDailyAggregation().catch(console.error);
