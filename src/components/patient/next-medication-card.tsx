/**
 * @file next-medication-card.tsx
 * @description Карточка ближайшего лекарства с таймером до приёма
 * @created 2026-02-22
 */

import type { NextMedication } from '@/lib/medications/queries';

interface NextMedicationCardProps {
  medication: NextMedication;
}

/** Форматирует оставшееся время в читаемый вид */
function formatTimeUntil(minutes: number): string {
  if (minutes < 0) {
    const abs = Math.abs(minutes);
    return `Просрочено ${abs} мин назад`;
  }
  if (minutes === 0) return 'Сейчас!';
  if (minutes < 60) return `Через ${minutes} мин`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `Через ${h} ч ${m} мин` : `Через ${h} ч`;
}

export function NextMedicationCard({ medication }: NextMedicationCardProps) {
  const timeText = formatTimeUntil(medication.minutesUntil);
  const isUrgent = medication.isOverdue || medication.minutesUntil <= 15;

  return (
    <div
      className={`rounded-3xl p-6 space-y-3 ${
        isUrgent
          ? 'bg-[#fff3e0] border-2 border-[#ff9800]'
          : 'bg-white/20 border border-white/30 backdrop-blur-sm'
      }`}
      role="region"
      aria-label={`Ближайшее лекарство: ${medication.name}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl" aria-hidden="true">💊</span>
        <span
          className={`text-base font-semibold px-3 py-1 rounded-full ${
            isUrgent ? 'bg-[#ff9800] text-white' : 'bg-white/30 text-white'
          }`}
          aria-label={`До приёма: ${timeText}`}
        >
          {timeText}
        </span>
      </div>

      <div>
        <p
          className={`text-xl font-bold ${isUrgent ? 'text-[#e65100]' : 'text-white'}`}
        >
          {medication.name}
        </p>
        <p
          className={`text-base ${isUrgent ? 'text-[#bf360c]' : 'text-white/80'}`}
        >
          {medication.dosage} · {medication.scheduledTime}
        </p>
        {medication.instruction && (
          <p
            className={`text-sm mt-1 ${isUrgent ? 'text-[#795548]' : 'text-white/60'}`}
          >
            {medication.instruction}
          </p>
        )}
      </div>
    </div>
  );
}
