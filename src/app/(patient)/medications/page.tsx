/**
 * @file page.tsx
 * @description Страница списка лекарств — MedTech 2025/2026:
 * glassmorphism карточки, staggered анимации, профессиональные иконки
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { MedicationCard } from '@/components/patient/medication-card';
import { DeleteMedicationButton } from '@/components/patient/delete-medication-button';
import { PillIcon, PlusIcon, EditIcon, ChevronRightIcon } from '@/components/shared/nav-icons';

export const metadata: Metadata = {
  title: 'Мои лекарства — MemoMed AI',
};

export default async function MedicationsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const medications = await prisma.medication.findMany({
    where: { patientId: session.user.id, isActive: true },
    orderBy: { scheduledTime: 'asc' },
  });

  return (
    <div className="med-page med-animate">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#0D1B2A]">Мои лекарства</h1>
          {medications.length > 0 && (
            <p className="text-slate-500 text-sm mt-0.5">
              {medications.length}{' '}
              {medications.length === 1
                ? 'препарат'
                : medications.length < 5
                  ? 'препарата'
                  : 'препаратов'}
            </p>
          )}
        </div>
        <Link
          href="/medications/add"
          className="flex items-center gap-2 px-5 py-2.5
            bg-gradient-to-r from-[#1565C0] to-[#1976D2]
            text-white rounded-xl font-bold text-sm
            hover:shadow-lg hover:shadow-blue-200/50
            active:scale-[0.97] transition-all min-h-[48px]"
          aria-label="Добавить лекарство"
        >
          <PlusIcon className="w-4 h-4" />
          Добавить
        </Link>
      </div>

      {medications.length === 0 ? (
        <div
          className="med-card flex flex-col items-center justify-center
          py-16 space-y-5 text-center"
        >
          <div
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600
            flex items-center justify-center shadow-lg shadow-blue-200/50 med-float"
          >
            <PillIcon className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-bold text-[#0D1B2A]">Лекарства не добавлены</p>
            <p className="text-slate-500 max-w-xs text-sm">
              Добавьте лекарство, чтобы получать напоминания о приёме
            </p>
          </div>
          <Link href="/medications/add" className="med-btn-primary rounded-2xl gap-3">
            <PlusIcon className="w-4 h-4" />
            Добавить первое лекарство
            <ChevronRightIcon className="w-4 h-4 opacity-60" />
          </Link>
        </div>
      ) : (
        <ul className="space-y-3 med-stagger" role="list" aria-label="Список лекарств">
          {medications.map((med) => (
            <li key={med.id}>
              <div
                className="med-card-accent group flex items-center gap-3
                hover:translate-x-1 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <MedicationCard
                    name={med.name}
                    dosage={med.dosage}
                    scheduledTime={med.scheduledTime}
                    photoUrl={med.photoUrl}
                  />
                </div>

                <div
                  className="flex gap-1.5 items-center opacity-60
                  group-hover:opacity-100 transition-opacity"
                >
                  <Link
                    href={`/medications/${med.id}/edit`}
                    className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400
                      hover:bg-blue-50 hover:text-[#1565C0]
                      flex items-center justify-center transition-all"
                    aria-label={`Редактировать ${med.name}`}
                  >
                    <EditIcon className="w-4 h-4" />
                  </Link>
                  <DeleteMedicationButton id={med.id} name={med.name} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
