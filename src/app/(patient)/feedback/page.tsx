/**
 * @file page.tsx
 * @description Страница отзывов о лекарствах в стиле MedTech:
 * форма отзыва + история последних отзывов
 * @dependencies FeedbackForm, prisma, next-auth
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { FeedbackForm } from '@/components/shared/feedback-form';
import { PillIcon, StarIcon } from '@/components/shared/nav-icons';

export const metadata: Metadata = {
  title: 'Отзывы о лекарствах — MemoMed AI',
};

export default async function FeedbackPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'patient') redirect('/dashboard');

  const medications = await prisma.medication.findMany({
    where: { patientId: session.user.id, isActive: true },
    select: { id: true, name: true, dosage: true, scheduledTime: true },
    orderBy: { name: 'asc' },
  });

  const recentFeedbacks = await prisma.medicationFeedback.findMany({
    where: { patientId: session.user.id },
    include: { medication: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return (
    <div className="med-page">
      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0D1B2A]">Отзывы о лекарствах</h1>
        <p className="text-[#475569] mt-1">
          Ваши отзывы помогают врачу и исследованиям. Данные анонимизируются.
        </p>
      </div>

      {medications.length === 0 ? (
        /* Пустое состояние */
        <div
          className="flex flex-col items-center justify-center py-16 text-center
          bg-white rounded-3xl border border-dashed border-slate-200 space-y-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
            <PillIcon className="w-8 h-8 text-[#1565C0]" />
          </div>
          <div>
            <p className="text-lg font-semibold text-[#0D1B2A]">Нет активных лекарств</p>
            <p className="text-[#475569] mt-1">Добавьте лекарство, чтобы оставить отзыв</p>
          </div>
        </div>
      ) : (
        <FeedbackForm medications={medications} />
      )}

      {/* История отзывов */}
      {recentFeedbacks.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-2">
            <StarIcon className="w-4 h-4 text-amber-500" />
            <h2 className="text-base font-bold text-[#0D1B2A]">Мои последние отзывы</h2>
          </div>

          <div className="space-y-3">
            {recentFeedbacks.map((fb) => (
              <div
                key={fb.id}
                className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2.5
                  shadow-sm"
              >
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
        </div>
      )}
    </div>
  );
}
