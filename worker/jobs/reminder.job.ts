/**
 * @file reminder.job.ts
 * @description BullMQ воркер для системы эскалации напоминаний о лекарствах.
 * Схема эскалации: T+0 → T+10 → T+20 → T+30 (push родственнику).
 * Задачи планируются при создании расписания, отменяются при подтверждении приёма.
 * @dependencies bullmq, push.service, prisma
 * @created 2026-02-22
 */

import { Worker, Queue, type Job } from 'bullmq';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { sendPushToUser, buildMedicationReminderPayload } from '../../src/lib/push/push.service';

export const REMINDER_QUEUE = 'medication-reminders';

/** Тип данных задачи напоминания */
export interface ReminderJobData {
  medicationId: string;
  patientId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  scheduledAt: string;
  /** Задержка от запланированного времени в минутах */
  delayMinutes: 0 | 10 | 20 | 30;
}

export const reminderQueue = new Queue<ReminderJobData>(REMINDER_QUEUE, {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 20,
  },
});

/**
 * Планирует 4 задачи напоминания для одного лекарства.
 * Вызывается при добавлении нового лекарства.
 */
export async function scheduleReminders(
  medicationId: string,
  patientId: string,
  medicationName: string,
  dosage: string,
  scheduledTime: string
): Promise<void> {
  const delays: Array<0 | 10 | 20 | 30> = [0, 10, 20, 30];

  const today = new Date();
  const [hours, minutes] = scheduledTime.split(':').map(Number);
  const scheduledAt = new Date(today);
  scheduledAt.setHours(hours ?? 0, minutes ?? 0, 0, 0);

  // Если время уже прошло сегодня — планируем на завтра
  if (scheduledAt < today) {
    scheduledAt.setDate(scheduledAt.getDate() + 1);
  }

  for (const delayMinutes of delays) {
    const jobAt = new Date(scheduledAt.getTime() + delayMinutes * 60 * 1000);
    const msUntilJob = jobAt.getTime() - Date.now();

    if (msUntilJob <= 0) continue;

    await reminderQueue.add(
      `reminder_${medicationId}_${delayMinutes}`,
      {
        medicationId,
        patientId,
        medicationName,
        dosage,
        scheduledTime,
        scheduledAt: scheduledAt.toISOString(),
        delayMinutes,
      },
      {
        delay: msUntilJob,
        jobId: `${medicationId}_${scheduledAt.toISOString()}_${delayMinutes}`,
        // Повторяем ежедневно
        repeat: {
          pattern: `${minutes ?? 0} ${hours ?? 0} * * *`,
          utc: false,
        },
      }
    );
  }
}

/**
 * Отменяет все напоминания для лекарства на конкретную дату.
 * Вызывается когда пользователь нажал «Принял(а)».
 */
export async function cancelReminders(
  medicationId: string,
  scheduledAt: string
): Promise<void> {
  const delays: Array<0 | 10 | 20 | 30> = [0, 10, 20, 30];

  for (const delayMinutes of delays) {
    const jobId = `${medicationId}_${scheduledAt}_${delayMinutes}`;
    const job = await reminderQueue.getJob(jobId);
    if (job) {
      await job.remove();
    }
  }
}

/** Обработчик задач напоминания */
export const reminderWorker = new Worker<ReminderJobData>(
  REMINDER_QUEUE,
  async (job: Job<ReminderJobData>) => {
    const { medicationId, patientId, medicationName, dosage, scheduledTime, scheduledAt, delayMinutes } =
      job.data;

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

      // Создаём лог «пропуск»
      await prisma.medicationLog.create({
        data: {
          medicationId,
          scheduledAt: scheduledDate,
          status: 'missed',
          syncStatus: 'synced',
        },
      });
    }

    return { sent: true, delayMinutes };
  },
  { connection: redis, concurrency: 10 }
);
