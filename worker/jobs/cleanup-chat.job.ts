/**
 * @file cleanup-chat.job.ts
 * @description BullMQ worker: deletes chat_messages older than 30 days (runs daily)
 * @dependencies bullmq, prisma
 * @created 2026-02-22
 */

import { Worker, Queue } from 'bullmq';
import { prisma } from '../lib/prisma';
import { redisConnection } from '../lib/redis';

const QUEUE_NAME = 'cleanup-chat';
const RETENTION_DAYS = 30;

export const cleanupChatQueue = new Queue(QUEUE_NAME, { connection: redisConnection });

export const cleanupChatMessagesWorker = new Worker(
  QUEUE_NAME,
  async () => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

    const deleted = await prisma.chatMessage.deleteMany({
      where: { createdAt: { lt: cutoffDate } },
    });

    console.log(`[cleanup-chat] Deleted ${deleted.count} messages older than ${RETENTION_DAYS} days`);
  },
  { connection: redisConnection }
);

async function scheduleDailyCleanup(): Promise<void> {
  const existingJobs = await cleanupChatQueue.getRepeatableJobs();
  if (existingJobs.length === 0) {
    await cleanupChatQueue.add(
      'daily-cleanup',
      {},
      { repeat: { pattern: '0 2 * * *' } }
    );
    console.log('[cleanup-chat] Daily cleanup job scheduled at 02:00');
  }
}

scheduleDailyCleanup().catch(console.error);
