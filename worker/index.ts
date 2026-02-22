/**
 * @file index.ts
 * @description Worker service entry point — starts all BullMQ workers and cron jobs
 * @dependencies bullmq, ioredis
 * @created 2026-02-22
 */

import { cleanupChatMessagesWorker } from './jobs/cleanup-chat.job';
import { aggregateTokenUsageWorker } from './jobs/aggregate-tokens.job';

console.log('[Worker] MemoMed AI Worker Service starting...');

const workers = [cleanupChatMessagesWorker, aggregateTokenUsageWorker];

process.on('SIGTERM', async () => {
  console.log('[Worker] Received SIGTERM, shutting down gracefully...');
  await Promise.all(workers.map((w) => w.close()));
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[Worker] Received SIGINT, shutting down gracefully...');
  await Promise.all(workers.map((w) => w.close()));
  process.exit(0);
});

console.log('[Worker] All workers started successfully');
