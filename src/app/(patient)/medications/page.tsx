/**
 * @file page.tsx
 * @description Страница списка лекарств пациента с возможностью удаления
 * @dependencies prisma, next-auth, MedicationCard
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { MedicationCard } from '@/components/patient/medication-card';
import { DeleteMedicationButton } from '@/components/patient/delete-medication-button';

export const metadata: Metadata = {
  title: 'Мои лекарства — MemoMed AI',
};

export default async function MedicationsPage() {
  const session = await auth();

  if (!session?.user) redirect('/login');

  const medications = await prisma.medication.findMany({
    where: {
      patientId: session.user.id,
      isActive: true,
    },
    orderBy: { scheduledTime: 'asc' },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#212121]">Мои лекарства</h1>
        <Link
          href="/medications/add"
          className="flex items-center gap-2 px-5 py-3 bg-[#7e57c2] text-white rounded-xl
            font-semibold text-base hover:bg-[#6a3fb5] transition-colors min-h-[48px]"
          aria-label="Добавить лекарство"
        >
          <span className="text-xl" aria-hidden="true">+</span>
          Добавить
        </Link>
      </div>

      {medications.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <p className="text-5xl" aria-hidden="true">💊</p>
          <p className="text-xl text-[#757575]">Лекарства не добавлены</p>
          <Link
            href="/medications/add"
            className="inline-flex items-center px-8 py-4 bg-[#4caf50] text-white rounded-2xl
              text-lg font-semibold hover:bg-[#43a047] transition-colors"
          >
            Добавить первое лекарство
          </Link>
        </div>
      ) : (
        <ul className="space-y-4" role="list" aria-label="Список лекарств">
          {medications.map((med) => (
            <li key={med.id}>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <MedicationCard
                    name={med.name}
                    dosage={med.dosage}
                    scheduledTime={med.scheduledTime}
                  />
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <Link
                    href={`/medications/${med.id}/edit`}
                    className="p-3 rounded-xl bg-gray-100 text-[#757575] hover:bg-gray-200
                      transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
                    aria-label={`Редактировать ${med.name}`}
                  >
                    ✏️
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
