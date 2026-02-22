/**
 * @file page.tsx
 * @description Настройки пациента — MedTech 2025/2026:
 * glassmorphism секции, SVG-иконки, staggered анимации
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { TtsSettings } from '@/components/shared/tts-settings';
import { PushNotificationsToggle } from '@/components/shared/push-notifications-toggle';
import { BuildInfo } from '@/components/shared/build-info';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { UserIcon, GlobeIcon, BellIcon, LockIcon, InfoIcon } from '@/components/shared/nav-icons';

export const metadata: Metadata = {
  title: 'Настройки — MemoMed AI',
};

const ROLE_LABELS: Record<string, string> = {
  patient: 'Пациент',
  relative: 'Родственник',
  doctor: 'Врач',
  admin: 'Администратор',
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const [profile, locale] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId: session.user.id },
    }),
    getLocale(),
  ]);

  const roleLabel = ROLE_LABELS[session.user.role] ?? session.user.role;

  return (
    <div className="med-page space-y-5 med-stagger">
      <h1 className="text-2xl font-black text-[#0D1B2A]">Настройки</h1>

      {/* Профиль */}
      <section className="med-card space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600
            flex items-center justify-center"
          >
            <UserIcon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-[#0D1B2A]">Профиль</h2>
        </div>
        <div className="space-y-0.5 divide-y divide-slate-100">
          <div className="flex justify-between py-3">
            <span className="text-slate-500 text-sm">Имя</span>
            <span className="text-[#0D1B2A] font-semibold">{profile?.fullName ?? '—'}</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-slate-500 text-sm">Email</span>
            <span className="text-[#0D1B2A] font-medium text-sm">{session.user.email ?? '—'}</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-slate-500 text-sm">Роль</span>
            <span className="med-badge-info">{roleLabel}</span>
          </div>
        </div>
      </section>

      {/* Язык */}
      <section className="med-card space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600
            flex items-center justify-center"
          >
            <GlobeIcon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-[#0D1B2A]">Язык интерфейса</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#0D1B2A] font-semibold">
              {locale === 'ru' ? 'Русский' : 'English'}
            </p>
            <p className="text-sm text-slate-500">
              {locale === 'ru' ? 'Переключить на английский' : 'Switch to Russian'}
            </p>
          </div>
          <LanguageSwitcher currentLocale={locale} />
        </div>
      </section>

      {/* Push */}
      <section className="med-card space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500
            flex items-center justify-center"
          >
            <BellIcon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-[#0D1B2A]">Push-уведомления</h2>
        </div>
        <p className="text-sm text-slate-500">Получайте напоминания о лекарствах на устройство</p>
        <PushNotificationsToggle />
      </section>

      {/* TTS */}
      <section className="med-card space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600
            flex items-center justify-center"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[#0D1B2A]">Голосовые напоминания</h2>
        </div>
        <p className="text-sm text-slate-500">Озвучивание напоминаний через Web Speech API</p>
        <TtsSettings />
      </section>

      {/* Конфиденциальность */}
      <section className="med-card space-y-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600
            flex items-center justify-center"
          >
            <LockIcon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-[#0D1B2A]">Конфиденциальность</h2>
        </div>
        <p className="text-sm text-slate-500">
          Ваши данные хранятся на сервере в зашифрованном виде. При оставлении отзывов данные
          анонимизируются перед AI-анализом.
        </p>
        <p className="text-sm text-slate-400">
          MemoMed AI соответствует требованиям GDPR и 152-ФЗ.
        </p>
      </section>

      {/* О приложении */}
      <section className="med-card bg-slate-50/80 space-y-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500
            flex items-center justify-center"
          >
            <InfoIcon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-[#0D1B2A]">О приложении</h2>
        </div>
        <BuildInfo variant="full" />
      </section>
    </div>
  );
}
