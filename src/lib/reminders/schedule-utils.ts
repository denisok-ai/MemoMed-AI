/**
 * @file schedule-utils.ts
 * @description Чистые функции для расчёта расписания напоминаний (тестируемые без Redis).
 * @created 2026-02-22
 */

export const REMINDER_DELAYS = [0, 10, 20, 30] as const;
export type ReminderDelay = (typeof REMINDER_DELAYS)[number];

/**
 * Вычисляет ближайшую дату/время приёма по строке "HH:MM".
 * Если указанное время уже прошло сегодня — возвращает завтра.
 */
export function computeNextScheduledAt(scheduledTime: string, now: Date = new Date()): Date {
  const [hours, minutes] = scheduledTime.split(':').map(Number);
  const h = Number.isFinite(hours) ? hours : 0;
  const m = Number.isFinite(minutes) ? minutes : 0;
  const scheduledAt = new Date(now);
  scheduledAt.setHours(h, m, 0, 0);
  if (scheduledAt <= now) {
    scheduledAt.setDate(scheduledAt.getDate() + 1);
  }
  return scheduledAt;
}

/**
 * Формирует jobId для BullMQ (уникальный на medication + scheduledAt + delay).
 */
export function getReminderJobId(
  medicationId: string,
  scheduledAtStr: string,
  delayMinutes: ReminderDelay
): string {
  return `${medicationId}_${scheduledAtStr}_${delayMinutes}`;
}

/**
 * Список jobId для отмены всех напоминаний по одному приёму.
 */
export function getReminderJobIds(medicationId: string, scheduledAtStr: string): string[] {
  return REMINDER_DELAYS.map((d) => getReminderJobId(medicationId, scheduledAtStr, d));
}
