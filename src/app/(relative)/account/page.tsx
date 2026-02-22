/**
 * @file page.tsx
 * @description Настройки родственника/опекуна: профиль, язык, уведомления, выход.
 * Путь /account — избегает конфликта с /settings пациента.
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { BuildInfo } from '@/components/shared/build-info';
import { SignOutButton } from '@/components/shared/sign-out-button';
import { PushNotificationsToggle } from '@/components/shared/push-notifications-toggle';
import { UserIcon, GlobeIcon, BellIcon, LockIcon, InfoIcon } from '@/components/shared/nav-icons';

export const metadata: Metadata = {
  title: 'Настройки — MemoMed AI',
};

export default async function RelativeAccountPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const [profile, locale] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
    getLocale(),
  ]);

  return (
    <div className="med-page med-animate space-y-5 med-stagger">
      <h1 className="text-2xl md:text-3xl font-black text-[#0D1B2A]">Настройки</h1>

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
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
              bg-indigo-50 text-indigo-700 text-sm font-semibold"
            >
              Родственник
            </span>
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

      {/* Push-уведомления */}
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
        <p className="text-sm text-slate-500">
          Получайте уведомления, если пациент пропустил приём лекарства
        </p>
        <PushNotificationsToggle />
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
          Данные пациентов доступны вам только с их явного согласия. Вся информация хранится в
          зашифрованном виде.
        </p>
        <p className="text-sm text-slate-400">
          MemoMed AI соответствует требованиям GDPR и 152-ФЗ.
        </p>
      </section>

      {/* Аккаунт */}
      <section className="med-card space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-red-500
            flex items-center justify-center"
          >
            <LockIcon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-[#0D1B2A]">Аккаунт</h2>
        </div>
        <SignOutButton />
      </section>

      {/* О приложении */}
      <section className="med-card bg-slate-50/80 space-y-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600
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
