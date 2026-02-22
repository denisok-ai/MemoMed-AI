/**
 * @file page.tsx
 * @description Главный экран пациента: живые часы, ближайшее лекарство и большая кнопка приёма
 * Цветовой фон меняется в зависимости от времени суток
 * @dependencies LiveClock, TakeMedicationButton, NextMedicationCard, DynamicBackground
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { getNextMedication } from '@/lib/medications/queries';
import { LiveClock } from '@/components/patient/live-clock';
import { TakeMedicationButton } from '@/components/patient/take-medication-button';
import { NextMedicationCard } from '@/components/patient/next-medication-card';
import { DynamicBackground } from '@/components/patient/dynamic-background';

export const metadata: Metadata = {
  title: 'Главная — MemoMed AI',
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const [nextMedication, profile] = await Promise.all([
    getNextMedication(session.user.id),
    prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { fullName: true },
    }),
  ]);

  const userName = profile?.fullName ?? undefined;

  // Создаём scheduledAt из сегодняшней даты + время из лекарства
  const getScheduledAt = (scheduledTime: string) => {
    const today = new Date();
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    today.setHours(hours ?? 0, minutes ?? 0, 0, 0);
    return today.toISOString();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Верхняя секция с часами и фоном */}
      <section
        className="relative overflow-hidden flex flex-col items-center justify-center
          px-6 pt-16 pb-10 min-h-[320px] space-y-6"
        aria-label="Текущее время и приветствие"
      >
        <DynamicBackground userName={userName} />
        <div className="relative z-10 space-y-6 w-full max-w-md">
          <LiveClock />

          {/* Карточка ближайшего лекарства */}
          {nextMedication && (
            <NextMedicationCard medication={nextMedication} />
          )}
        </div>
      </section>

      {/* Нижняя секция с кнопкой */}
      <section
        className="flex-1 flex flex-col gap-4 p-6 bg-white"
        aria-label="Действия"
      >
        {nextMedication ? (
          <TakeMedicationButton
            medicationId={nextMedication.id}
            medicationName={nextMedication.name}
            scheduledAt={getScheduledAt(nextMedication.scheduledTime)}
          />
        ) : (
          <div className="text-center py-8 space-y-4">
            <p className="text-5xl" aria-hidden="true">🎉</p>
            <p className="text-xl text-[#4caf50] font-semibold">
              Все лекарства приняты на сегодня!
            </p>
            <Link
              href="/medications/add"
              className="inline-block px-8 py-4 bg-[#7e57c2] text-white rounded-2xl
                text-lg font-semibold hover:bg-[#6a3fb5] transition-colors"
            >
              + Добавить лекарство
            </Link>
          </div>
        )}

        {/* Быстрые ссылки */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <Link
            href="/medications"
            className="flex items-center gap-3 p-4 bg-[#ede7f6] rounded-2xl
              hover:bg-[#d1c4e9] transition-colors min-h-[72px]"
            aria-label="Перейти к списку лекарств"
          >
            <span className="text-2xl" aria-hidden="true">💊</span>
            <span className="text-base font-medium text-[#7e57c2]">Лекарства</span>
          </Link>

          <Link
            href="/history"
            className="flex items-center gap-3 p-4 bg-[#e8f5e9] rounded-2xl
              hover:bg-[#c8e6c9] transition-colors min-h-[72px]"
            aria-label="История приёма"
          >
            <span className="text-2xl" aria-hidden="true">📋</span>
            <span className="text-base font-medium text-[#4caf50]">История</span>
          </Link>

          <Link
            href="/chat"
            className="flex items-center gap-3 p-4 bg-[#e3f2fd] rounded-2xl
              hover:bg-[#bbdefb] transition-colors min-h-[72px]"
            aria-label="ИИ-помощник"
          >
            <span className="text-2xl" aria-hidden="true">🤖</span>
            <span className="text-base font-medium text-[#42a5f5]">ИИ-помощник</span>
          </Link>

          <Link
            href="/journal"
            className="flex items-center gap-3 p-4 bg-[#fce4ec] rounded-2xl
              hover:bg-[#f8bbd9] transition-colors min-h-[72px]"
            aria-label="Дневник здоровья"
          >
            <span className="text-2xl" aria-hidden="true">📓</span>
            <span className="text-base font-medium text-[#e91e63]">Дневник</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
