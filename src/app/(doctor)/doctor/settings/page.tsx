/**
 * @file page.tsx
 * @description Страница настроек врача: профиль, язык интерфейса.
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
import { LockIcon, InfoIcon } from '@/components/shared/nav-icons';

export const metadata: Metadata = {
  title: 'Настройки — MemoMed AI',
};

export default async function DoctorSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'doctor' && session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  const [profile, locale] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId: session.user.id },
    }),
    getLocale(),
  ]);

  return (
    <div className="med-page med-animate max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl md:text-3xl font-black text-[#0D1B2A]">Настройки</h1>

      {/* Профиль */}
      <section className="med-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#0D1B2A]">Профиль</h2>
        <div className="space-y-2">
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Имя</span>
            <span className="text-[#0D1B2A] font-medium">{profile?.fullName ?? '—'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Email</span>
            <span className="text-[#0D1B2A] font-medium text-sm">{session.user.email ?? '—'}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-500">Роль</span>
            <span className="inline-flex items-center gap-1.5 text-[#212121] font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              Врач
            </span>
          </div>
        </div>
      </section>

      {/* Язык интерфейса */}
      <section className="med-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#0D1B2A]">Язык интерфейса</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#0D1B2A] font-medium">{locale === 'ru' ? 'Русский' : 'English'}</p>
            <p className="text-sm text-slate-500">
              {locale === 'ru'
                ? 'Нажмите кнопку, чтобы переключить на английский'
                : 'Click the button to switch to Russian'}
            </p>
          </div>
          <LanguageSwitcher currentLocale={locale} />
        </div>
      </section>

      {/* Конфиденциальность */}
      <section className="med-card p-6 space-y-3">
        <h2 className="text-lg font-semibold text-[#0D1B2A]">Конфиденциальность</h2>
        <p className="text-sm text-slate-500">
          Данные ваших пациентов хранятся в зашифрованном виде. Доступ к данным предоставляется
          только с явного согласия пациента.
        </p>
        <p className="text-xs text-slate-400">
          MemoMed AI соответствует требованиям GDPR и 152-ФЗ.
        </p>
      </section>

      {/* Аккаунт */}
      <section className="med-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#0D1B2A] flex items-center gap-2">
          <LockIcon className="w-5 h-5 text-[#1565C0]" aria-hidden />
          Аккаунт
        </h2>
        <SignOutButton />
      </section>

      {/* О приложении */}
      <section className="med-card bg-slate-50/80 p-6 space-y-3">
        <h2 className="text-lg font-semibold text-[#0D1B2A] flex items-center gap-2">
          <InfoIcon className="w-5 h-5 text-[#1565C0]" aria-hidden />О приложении
        </h2>
        <BuildInfo variant="full" />
      </section>
    </div>
  );
}
