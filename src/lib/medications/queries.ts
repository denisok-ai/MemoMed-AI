/**
 * @file queries.ts
 * @description Вспомогательные функции для работы с лекарствами: определение ближайшего приёма
 * @dependencies prisma
 * @created 2026-02-22
 */

import { prisma } from '@/lib/db/prisma';

export interface NextMedication {
  id: string;
  name: string;
  dosage: string;
  scheduledTime: string;
  instruction: string | null;
  minutesUntil: number;
  isOverdue: boolean;
}

/**
 * Находит ближайшее к текущему времени лекарство для приёма
 * Логика: сортируем по времени, ищем следующее (или просроченное в пределах 30 мин)
 */
export async function getNextMedication(patientId: string): Promise<NextMedication | null> {
  const medications = await prisma.medication.findMany({
    where: { patientId, isActive: true },
    orderBy: { scheduledTime: 'asc' },
  });

  if (medications.length === 0) return null;

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  // Определяем статус каждого лекарства по времени
  const withMinutes = medications.map((med) => {
    const [hours, minutes] = med.scheduledTime.split(':').map(Number);
    const medMinutes = (hours ?? 0) * 60 + (minutes ?? 0);
    const diff = medMinutes - nowMinutes;

    return {
      ...med,
      medMinutes,
      diff,
    };
  });

  // Сначала ищем просроченные (до -30 минут) или предстоящие
  const overdue = withMinutes.find((m) => m.diff >= -30 && m.diff < 0);
  if (overdue) {
    return {
      id: overdue.id,
      name: overdue.name,
      dosage: overdue.dosage,
      scheduledTime: overdue.scheduledTime,
      instruction: overdue.instruction,
      minutesUntil: overdue.diff,
      isOverdue: true,
    };
  }

  // Ищем ближайшее предстоящее
  const upcoming = withMinutes.find((m) => m.diff >= 0);
  if (upcoming) {
    return {
      id: upcoming.id,
      name: upcoming.name,
      dosage: upcoming.dosage,
      scheduledTime: upcoming.scheduledTime,
      instruction: upcoming.instruction,
      minutesUntil: upcoming.diff,
      isOverdue: false,
    };
  }

  // Если сегодня все приёмы уже прошли — показываем первый на завтра
  const first = withMinutes[0];
  if (!first) return null;

  const minutesUntilTomorrow = 24 * 60 - nowMinutes + first.medMinutes;
  return {
    id: first.id,
    name: first.name,
    dosage: first.dosage,
    scheduledTime: first.scheduledTime,
    instruction: first.instruction,
    minutesUntil: minutesUntilTomorrow,
    isOverdue: false,
  };
}
