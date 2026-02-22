/**
 * @file medication-card.tsx
 * @description Карточка лекарства в стиле MedTech — SVG-иконка, чёткая типография
 * @created 2026-02-22
 */

import { PillIcon } from '@/components/shared/nav-icons';

interface MedicationCardProps {
  name: string;
  dosage: string;
  scheduledTime: string;
  photoUrl?: string | null;
}

export function MedicationCard({ name, dosage, scheduledTime, photoUrl }: MedicationCardProps) {
  return (
    <article className="flex items-center gap-4 py-1" aria-label={`Лекарство: ${name}`}>
      {/* Иконка или фото */}
      <div
        className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100
          flex items-center justify-center flex-shrink-0 overflow-hidden"
        aria-hidden="true"
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <PillIcon className="w-5 h-5 text-[#1565C0]" />
        )}
      </div>

      {/* Информация */}
      <div className="flex-1 min-w-0">
        <p className="text-base font-bold text-[#0D1B2A] truncate">{name}</p>
        <p className="text-sm text-slate-500">{dosage}</p>
      </div>

      {/* Время */}
      <time
        dateTime={scheduledTime}
        className="text-sm font-bold text-[#1565C0] bg-blue-50 px-3 py-1.5
          rounded-lg flex-shrink-0"
        aria-label={`Время приёма: ${scheduledTime}`}
      >
        {scheduledTime}
      </time>
    </article>
  );
}
