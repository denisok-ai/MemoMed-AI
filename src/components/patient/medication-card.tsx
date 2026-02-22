/**
 * @file medication-card.tsx
 * @description Карточка лекарства для списка — показывает имя, дозировку и время
 * @created 2026-02-22
 */

interface MedicationCardProps {
  name: string;
  dosage: string;
  scheduledTime: string;
  photoUrl?: string | null;
}

export function MedicationCard({ name, dosage, scheduledTime, photoUrl }: MedicationCardProps) {
  return (
    <article
      className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
      aria-label={`Лекарство: ${name}`}
    >
      {/* Иконка или фото */}
      <div
        className="w-14 h-14 rounded-2xl bg-[#ede7f6] flex items-center justify-center flex-shrink-0 overflow-hidden"
        aria-hidden="true"
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl">💊</span>
        )}
      </div>

      {/* Информация */}
      <div className="flex-1 min-w-0">
        <p className="text-lg font-semibold text-[#212121] truncate">{name}</p>
        <p className="text-base text-[#757575]">{dosage}</p>
      </div>

      {/* Время */}
      <time
        dateTime={scheduledTime}
        className="text-base font-medium text-[#7e57c2] flex-shrink-0"
        aria-label={`Время приёма: ${scheduledTime}`}
      >
        {scheduledTime}
      </time>
    </article>
  );
}
