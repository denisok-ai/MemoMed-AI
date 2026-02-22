/**
 * @file queue.ts
 * @description Общая очередь напоминаний — используется Next.js (добавление/отмена) и Worker (обработка).
 * @created 2026-02-22
 */

import { Queue } from 'bullmq';
import { REMINDER_DELAYS, computeNextScheduledAt, getReminderJobId } from './schedule-utils';

export const REMINDER_QUEUE = 'medication-reminders';

export interface ReminderJobData {
  medicationId: string;
  patientId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  scheduledAt: string;
  delayMinutes: 0 | 10 | 20 | 30;
}

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
const redisConnection = {
  host: new URL(redisUrl).hostname,
  port: parseInt(new URL(redisUrl).port || '6379'),
};

export const reminderQueue = new Queue<ReminderJobData>(REMINDER_QUEUE, {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 20,
  },
});

/**
 * Планирует 4 задачи напоминания для одного лекарства на ближайшее срабатывание.
 * Вызывается при добавлении лекарства и по крону (ежечасно).
 */
export async function scheduleReminders(
  medicationId: string,
  patientId: string,
  medicationName: string,
  dosage: string,
  scheduledTime: string
): Promise<void> {
  const now = new Date();
  const scheduledAt = computeNextScheduledAt(scheduledTime, now);
  const scheduledAtStr = scheduledAt.toISOString();

  for (const delayMinutes of REMINDER_DELAYS) {
    const jobAt = new Date(scheduledAt.getTime() + delayMinutes * 60 * 1000);
    const msUntilJob = jobAt.getTime() - now.getTime();

    if (msUntilJob <= 0) continue;

    const jobId = getReminderJobId(medicationId, scheduledAtStr, delayMinutes);

    try {
      await reminderQueue.add(
        `reminder_${medicationId}_${delayMinutes}`,
        {
          medicationId,
          patientId,
          medicationName,
          dosage,
          scheduledTime,
          scheduledAt: scheduledAtStr,
          delayMinutes,
        },
        {
          delay: msUntilJob,
          jobId,
        }
      );
    } catch (err) {
      if (String(err).includes('already exists')) continue;
      throw err;
    }
  }
}

/**
 * Отменяет все напоминания для лекарства на конкретную дату.
 * scheduledAt — ISO строка (например из формы или new Date().toISOString()).
 */
export async function cancelReminders(medicationId: string, scheduledAt: string): Promise<void> {
  const scheduledAtNorm = new Date(scheduledAt).toISOString();

  for (const delayMinutes of REMINDER_DELAYS) {
    const jobId = getReminderJobId(medicationId, scheduledAtNorm, delayMinutes);
    try {
      const job = await reminderQueue.getJob(jobId);
      if (job) await job.remove();
    } catch {
      // Job может уже быть выполнен или не существовать
    }
  }
}
