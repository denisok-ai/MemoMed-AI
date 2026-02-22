/**
 * @file reminder.job.ts
 * @description BullMQ воркер для системы эскалации напоминаний о лекарствах.
 * Схема эскалации: T+0 → T+10 → T+20 → T+30 (push родственнику).
 * @dependencies bullmq, push.service, prisma, src/lib/reminders/queue
 * @created 2026-02-22
 */

import { Worker, type Job } from 'bullmq';
import { prisma } from '../lib/prisma';
import { redisConnection } from '../lib/redis';
import { sendPushToUser, buildMedicationReminderPayload } from '../../src/lib/push/push.service';
import { REMINDER_QUEUE, type ReminderJobData } from '../../src/lib/reminders/queue';

export { scheduleReminders, cancelReminders } from '../../src/lib/reminders/queue';

/** Обработчик задач напоминания */
export const reminderWorker = new Worker<ReminderJobData>(
  REMINDER_QUEUE,
  async (job: Job<ReminderJobData>) => {
    const {
      medicationId,
      patientId,
      medicationName,
      dosage,
      scheduledTime,
      scheduledAt,
      delayMinutes,
    } = job.data;

    // Проверяем: было ли лекарство уже принято?
    const scheduledDate = new Date(scheduledAt);
    const log = await prisma.medicationLog.findFirst({
      where: {
        medicationId,
        scheduledAt: {
          gte: new Date(scheduledDate.getTime() - 60 * 1000),
          lte: new Date(scheduledDate.getTime() + 60 * 1000),
        },
        status: 'taken',
      },
    });

    if (log) {
      // Лекарство принято — пропускаем уведомление
      return { skipped: true, reason: 'already_taken' };
    }

    // T+0, T+10, T+20 — уведомление пациенту
    if (delayMinutes < 30) {
      await sendPushToUser(
        patientId,
        buildMedicationReminderPayload(medicationName, dosage, scheduledTime, delayMinutes)
      );
    }

    // T+30 — уведомление родственникам
    if (delayMinutes === 30) {
      const connections = await prisma.connection.findMany({
        where: { patientId, status: 'active' },
        select: { relativeId: true },
      });

      const patient = await prisma.profile.findUnique({
        where: { userId: patientId },
        select: { fullName: true },
      });

      for (const conn of connections) {
        await sendPushToUser(conn.relativeId, {
          title: '⚠️ Лекарство не принято',
          body: `${patient?.fullName ?? 'Пациент'} не принял(а) ${medicationName} уже 30 минут`,
          tag: `missed-${medicationId}`,
          data: { url: '/feed' },
        });
      }

      // Создаём лог «пропуск» (если ещё нет записи)
      const existing = await prisma.medicationLog.findFirst({
        where: {
          medicationId,
          scheduledAt: {
            gte: new Date(scheduledDate.getTime() - 60 * 1000),
            lte: new Date(scheduledDate.getTime() + 60 * 1000),
          },
        },
      });
      if (!existing) {
        await prisma.medicationLog.create({
          data: {
            medicationId,
            scheduledAt: scheduledDate,
            status: 'missed',
            syncStatus: 'synced',
          },
        });
      }
    }

    return { sent: true, delayMinutes };
  },
  { connection: redisConnection, concurrency: 10 }
);
