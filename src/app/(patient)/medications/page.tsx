/**
 * @file page.tsx
 * @description Страница списка лекарств — MedTech 2025/2026:
 * glassmorphism карточки, staggered анимации, пагинация
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { MedicationCard } from '@/components/patient/medication-card';
import { DeleteMedicationButton } from '@/components/patient/delete-medication-button';
import { Pagination } from '@/components/shared/pagination';
import { PillIcon, PlusIcon, EditIcon, ChevronRightIcon } from '@/components/shared/nav-icons';

export const metadata: Metadata = {
  title: 'Мои лекарства — MemoMed AI',
};

const PAGE_SIZE = 12;

export default async function MedicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1'));
  const skip = (page - 1) * PAGE_SIZE;

  const [medications, total] = await Promise.all([
    prisma.medication.findMany({
      where: { patientId: session.user.id, isActive: true },
      orderBy: { scheduledTime: 'asc' },
      take: PAGE_SIZE,
      skip,
    }),
    prisma.medication.count({ where: { patientId: session.user.id, isActive: true } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="med-page med-animate">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0D1B2A]">Мои лекарства</h1>
          {medications.length > 0 && (
            <p className="text-slate-500 text-base mt-0.5">
              {total} {total === 1 ? 'препарат' : total < 5 ? 'препарата' : 'препаратов'}
            </p>
          )}
        </div>
        <Link
          href="/medications/add"
          className="med-btn-primary rounded-2xl gap-2 w-full sm:w-auto justify-center"
          aria-label="Добавить лекарство"
        >
          <PlusIcon className="w-5 h-5" />
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
            <PlusIcon className="w-5 h-5" />
            Добавить первое лекарство
            <ChevronRightIcon className="w-4 h-4 opacity-60" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
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
                      className="w-12 h-12 min-w-[48px] rounded-xl bg-slate-50 text-slate-400
                        hover:bg-blue-50 hover:text-[#1565C0]
                        flex items-center justify-center transition-all"
                      aria-label={`Редактировать ${med.name}`}
                    >
                      <EditIcon className="w-5 h-5" />
                    </Link>
                    <DeleteMedicationButton id={med.id} name={med.name} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={PAGE_SIZE}
              buildHref={(p) => `/medications?page=${p}`}
            />
          )}
        </div>
      )}
    </div>
  );
}
