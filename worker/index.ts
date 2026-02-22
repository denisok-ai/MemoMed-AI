/**
 * @file index.ts
 * @description Worker service entry point — starts all BullMQ workers and cron jobs
 * @dependencies bullmq, ioredis
 * @created 2026-02-22
 */

import { cleanupChatMessagesWorker } from './jobs/cleanup-chat.job';
import { aggregateTokenUsageWorker } from './jobs/aggregate-tokens.job';
import { fetchWeatherWorker, scheduleWeatherJobs } from './jobs/fetch-weather.job';
import { reminderWorker } from './jobs/reminder.job';
import { runScheduleRemindersCron } from './jobs/schedule-reminders.job';

console.log('[Worker] MemoMed AI Worker Service starting...');

const workers = [
  cleanupChatMessagesWorker,
  aggregateTokenUsageWorker,
  fetchWeatherWorker,
  reminderWorker,
];

// Метеоданные: сразу и каждые 3 часа
scheduleWeatherJobs().catch(console.error);
setInterval(() => scheduleWeatherJobs().catch(console.error), 3 * 60 * 60 * 1000);

// Напоминания: каждую минуту планируем задачи для лекарств
runScheduleRemindersCron().catch(console.error);
setInterval(() => runScheduleRemindersCron().catch(console.error), 60 * 1000);

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
