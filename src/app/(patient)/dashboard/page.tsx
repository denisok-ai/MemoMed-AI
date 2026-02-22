/**
 * @file page.tsx
 * @description Главный экран пациента — desktop-optimized MedTech dashboard.
 * Centered app-column (max 640px), generous spacing, large touch targets.
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
import {
  PillIcon,
  ClipboardIcon,
  BotIcon,
  BookIcon,
  BarChartIcon,
  StarIcon,
  CheckIcon,
  ChevronRightIcon,
} from '@/components/shared/nav-icons';

export const metadata: Metadata = {
  title: 'Главная — MemoMed AI',
};

const QUICK_LINKS = [
  {
    href: '/medications',
    label: 'Лекарства',
    Icon: PillIcon,
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
  },
  {
    href: '/history',
    label: 'История',
    Icon: ClipboardIcon,
    gradient: 'from-slate-500 to-slate-600',
    bg: 'bg-slate-50',
  },
  {
    href: '/stats',
    label: 'Статистика',
    Icon: BarChartIcon,
    gradient: 'from-teal-500 to-teal-600',
    bg: 'bg-teal-50',
  },
  {
    href: '/journal',
    label: 'Дневник',
    Icon: BookIcon,
    gradient: 'from-indigo-500 to-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    href: '/chat',
    label: 'ИИ-помощник',
    Icon: BotIcon,
    gradient: 'from-cyan-500 to-cyan-600',
    bg: 'bg-cyan-50',
  },
  {
    href: '/feedback',
    label: 'Отзывы',
    Icon: StarIcon,
    gradient: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-50',
  },
] as const;

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const [nextMedication, profile] = await Promise.all([
    getNextMedication(session.user.id),
    prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { fullName: true, onboardingDone: true },
    }),
  ]);

  if (profile && !profile.onboardingDone) {
    redirect('/onboarding');
  }

  const userName = profile?.fullName ?? undefined;

  const getScheduledAt = (scheduledTime: string) => {
    const today = new Date();
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    today.setHours(hours ?? 0, minutes ?? 0, 0, 0);
    return today.toISOString();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* ── Hero — часы + приветствие + карточка ближайшего лекарства ── */}
      <section
        className="relative overflow-hidden flex flex-col items-center
          px-6 pt-14 pb-14 md:pt-20 md:pb-20"
        aria-label="Текущее время и приветствие"
      >
        <DynamicBackground userName={userName} />

        <div
          className="relative z-10 w-full max-w-lg mx-auto
          space-y-8 md:space-y-10 med-animate"
        >
          <LiveClock />

          {nextMedication && <NextMedicationCard medication={nextMedication} />}
        </div>
      </section>

      {/* ── Основная панель ── */}
      <section
        className="flex-1 bg-[var(--color-background)] rounded-t-[2rem] -mt-6
          shadow-[0_-8px_30px_rgba(0,0,0,0.08)]"
        aria-label="Действия"
      >
        <div className="max-w-lg mx-auto px-6 py-8 md:py-10 space-y-8">
          {/* Кнопка приёма или success */}
          <div className="med-animate" style={{ animationDelay: '80ms' }}>
            {nextMedication ? (
              <TakeMedicationButton
                medicationId={nextMedication.id}
                medicationName={nextMedication.name}
                scheduledAt={getScheduledAt(nextMedication.scheduledTime)}
              />
            ) : (
              <div
                className="med-card flex items-center gap-5 p-5
                bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-100"
              >
                <div
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500
                  flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-200/50"
                >
                  <CheckIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-green-800 font-bold text-lg">Все лекарства приняты!</p>
                  <p className="text-green-600 text-sm">Отличная дисциплина на сегодня</p>
                </div>
              </div>
            )}
          </div>

          {/* Быстрые ссылки */}
          <div className="med-animate" style={{ animationDelay: '160ms' }}>
            <p className="med-section-title mb-4">Быстрый доступ</p>
            <div className="grid grid-cols-3 gap-3 md:gap-4 med-stagger">
              {QUICK_LINKS.map(({ href, label, Icon, gradient, bg }) => (
                <Link
                  key={href}
                  href={href}
                  className={`group flex flex-col items-center gap-3 p-4 md:p-5
                    rounded-2xl ${bg} border border-transparent
                    hover:border-slate-200 hover:shadow-lg hover:-translate-y-0.5
                    active:scale-[0.96] transition-all duration-200`}
                  aria-label={label}
                >
                  <div
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl
                    bg-gradient-to-br ${gradient}
                    flex items-center justify-center
                    shadow-md group-hover:shadow-lg group-hover:scale-105
                    transition-all duration-200`}
                  >
                    <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <span
                    className="text-sm md:text-base font-bold text-slate-700 text-center
                    group-hover:text-[#1565C0] transition-colors leading-tight"
                  >
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* CTA — добавить лекарство */}
          {!nextMedication && (
            <div className="med-animate" style={{ animationDelay: '240ms' }}>
              <Link
                href="/medications/add"
                className="flex items-center justify-center gap-3
                  med-btn-primary rounded-2xl py-4 text-lg w-full"
                aria-label="Добавить лекарство"
              >
                <PillIcon className="w-5 h-5" />
                Добавить лекарство
                <ChevronRightIcon className="w-4 h-4 opacity-60" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
