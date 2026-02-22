/**
 * @file next-medication-card.tsx
 * @description Карточка ближайшего лекарства — desktop-optimized glassmorphism.
 * Крупная иконка, больше padding, чёткая информация.
 * @created 2026-02-22
 */

import type { NextMedication } from '@/lib/medications/queries';
import { PillIcon } from '@/components/shared/nav-icons';

interface NextMedicationCardProps {
  medication: NextMedication;
}

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
      className={`rounded-2xl p-6 space-y-4 transition-all duration-300 ${
        isUrgent
          ? 'bg-orange-50/95 border-2 border-orange-300 shadow-lg shadow-orange-100'
          : 'bg-white/[0.12] border border-white/20 backdrop-blur-md shadow-lg shadow-black/10'
      }`}
      role="region"
      aria-label={`Ближайшее лекарство: ${medication.name}`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center
          ${isUrgent ? 'bg-orange-100' : 'bg-white/15'}`}
        >
          <PillIcon className={`w-6 h-6 ${isUrgent ? 'text-orange-600' : 'text-white'}`} />
        </div>

        <span
          className={`text-sm font-bold px-4 py-2 rounded-full tracking-tight
          ${
            isUrgent
              ? 'bg-orange-500 text-white animate-pulse'
              : 'bg-white/20 text-white/90 backdrop-blur'
          }`}
        >
          {timeText}
        </span>
      </div>

      <div>
        <p className={`text-2xl font-bold ${isUrgent ? 'text-orange-800' : 'text-white'}`}>
          {medication.name}
        </p>
        <p
          className={`text-base font-medium mt-1
          ${isUrgent ? 'text-orange-600' : 'text-white/70'}`}
        >
          {medication.dosage} · {medication.scheduledTime}
        </p>
        {medication.instruction && (
          <p className={`text-sm mt-2 ${isUrgent ? 'text-orange-500' : 'text-white/50'}`}>
            {medication.instruction}
          </p>
        )}
      </div>
    </div>
  );
}
