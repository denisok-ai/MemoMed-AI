/**
 * @file page.tsx
 * @description Страница отзывов о лекарствах в стиле MedTech:
 * форма отзыва + история отзывов с пагинацией
 * @dependencies FeedbackForm, prisma, next-auth
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { FeedbackForm } from '@/components/shared/feedback-form';
import { Pagination } from '@/components/shared/pagination';
import { PillIcon, StarIcon } from '@/components/shared/nav-icons';

export const metadata: Metadata = {
  title: 'Отзывы о лекарствах — MemoMed AI',
};

const PAGE_SIZE = 10;

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'patient') redirect('/dashboard');

  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1'));
  const skip = (page - 1) * PAGE_SIZE;

  const medications = await prisma.medication.findMany({
    where: { patientId: session.user.id, isActive: true },
    select: { id: true, name: true, dosage: true, scheduledTime: true },
    orderBy: { name: 'asc' },
  });

  const [feedbacks, total] = await Promise.all([
    prisma.medicationFeedback.findMany({
      where: { patientId: session.user.id },
      include: { medication: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
      skip,
    }),
    prisma.medicationFeedback.count({ where: { patientId: session.user.id } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="med-page med-animate">
      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-[#0D1B2A]">Отзывы о лекарствах</h1>
        <p className="text-slate-500 text-base mt-1">
          Ваши отзывы помогают врачу и исследованиям. Данные анонимизируются.
        </p>
      </div>

      {medications.length === 0 ? (
        /* Пустое состояние */
        <div className="med-card flex flex-col items-center justify-center py-16 text-center space-y-4">
          <div
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500
              flex items-center justify-center shadow-lg shadow-amber-200/50"
          >
            <PillIcon className="w-10 h-10 text-white" />
          </div>
          <div>
            <p className="text-xl font-bold text-[#0D1B2A]">Нет активных лекарств</p>
            <p className="text-slate-500 mt-1">Добавьте лекарство, чтобы оставить отзыв</p>
          </div>
        </div>
      ) : (
        <FeedbackForm medications={medications} />
      )}

      {/* История отзывов */}
      {total > 0 && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-2">
            <StarIcon className="w-4 h-4 text-amber-500" />
            <h2 className="text-base font-bold text-[#0D1B2A]">Мои отзывы</h2>
            <span className="text-sm text-slate-500">({total})</span>
          </div>

          <div className="space-y-3 med-stagger">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="med-card p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#1565C0]" />
                    <p className="font-semibold text-[#0D1B2A]">{fb.medication.name}</p>
                  </div>
                  <span
                    className="text-sm font-medium text-[#94A3B8] bg-slate-50
                    px-2 py-1 rounded-lg"
                  >
                    {new Date(fb.createdAt).toLocaleDateString('ru')}
                  </span>
                </div>

                {fb.effectivenessScore !== null && (
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-semibold text-slate-400 uppercase
                      tracking-wide"
                    >
                      Эффект
                    </span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${
                            i < fb.effectivenessScore! ? 'text-amber-400' : 'text-slate-200'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {fb.sideEffects && (
                  <div
                    className="flex items-start gap-2 px-3 py-2 bg-amber-50
                    rounded-xl border border-amber-100"
                  >
                    <span
                      className="text-amber-600 text-sm font-semibold
                      uppercase tracking-wide flex-shrink-0"
                    >
                      Побочки:
                    </span>
                    <p className="text-sm text-amber-700">{fb.sideEffects}</p>
                  </div>
                )}

                {fb.freeText && (
                  <p className="text-sm text-[#475569] line-clamp-2 leading-relaxed">
                    {fb.freeText}
                  </p>
                )}
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={PAGE_SIZE}
              buildHref={(p) => `/feedback?page=${p}`}
            />
          )}
        </div>
      )}
    </div>
  );
}
