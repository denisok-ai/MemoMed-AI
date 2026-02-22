/**
 * @file medication-card.tsx
 * @description Card component displaying medication name, dosage, and scheduled time
 * @created 2026-02-22
 */

interface MedicationCardProps {
  name: string;
  dosage: string;
  scheduledTime: string;
  isNext?: boolean;
}

export function MedicationCard({ name, dosage, scheduledTime, isNext }: MedicationCardProps) {
  return (
    <div
      className={`rounded-3xl px-8 py-6 text-center space-y-2 ${
        isNext ? 'bg-[#f3f0ff] border-2 border-[#7e57c2]' : 'bg-gray-50 border border-gray-100'
      }`}
      aria-label={`Лекарство: ${name}, доза: ${dosage}, в ${scheduledTime}`}
    >
      {isNext && (
        <div className="text-sm font-semibold text-[#7e57c2] uppercase tracking-wide">
          Следующий приём
        </div>
      )}
      <h2 className="text-3xl font-semibold text-[#212121]">{name}</h2>
      <p className="text-xl text-[#757575]">{dosage}</p>
      <p className="text-lg font-medium text-[#7e57c2]">⏰ {scheduledTime}</p>
    </div>
  );
}
