/**
 * @file schedule-reminders.job.ts
 * @description Крон: каждую минуту планирует напоминания для лекарств, время которых наступило.
 * T+0, T+10, T+20, T+30 — добавляет задачи в очередь.
 * @created 2026-02-22
 */

import { prisma } from '../lib/prisma';
import { scheduleReminders } from './reminder.job';

export async function runScheduleRemindersCron(): Promise<void> {
  const now = new Date();
  const currentMinute = now.getHours() * 60 + now.getMinutes();

  const medications = await prisma.medication.findMany({
    where: { isActive: true },
    select: {
      id: true,
      patientId: true,
      name: true,
      dosage: true,
      scheduledTime: true,
    },
  });

  for (const med of medications) {
    const [h, m] = med.scheduledTime.split(':').map(Number);
    const scheduledMinute = (h ?? 0) * 60 + (m ?? 0);

    if (scheduledMinute === currentMinute) {
      try {
        await scheduleReminders(med.id, med.patientId, med.name, med.dosage, med.scheduledTime);
      } catch (err) {
        console.error(`[ScheduleReminders] Ошибка для ${med.name}:`, err);
      }
    }
  }
}
