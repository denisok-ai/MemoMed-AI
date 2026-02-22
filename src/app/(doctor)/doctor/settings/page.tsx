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
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-[#212121]">Настройки</h1>

      {/* Профиль */}
      <section className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#212121]">👤 Профиль</h2>
        <div className="space-y-2">
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-[#757575]">Имя</span>
            <span className="text-[#212121] font-medium">{profile?.fullName ?? '—'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-[#757575]">Email</span>
            <span className="text-[#212121] font-medium text-sm">{session.user.email ?? '—'}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-[#757575]">Роль</span>
            <span className="inline-flex items-center gap-1.5 text-[#212121] font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              Врач
            </span>
          </div>
        </div>
      </section>

      {/* Язык интерфейса */}
      <section className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#212121]">🌐 Язык интерфейса</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#424242] font-medium">{locale === 'ru' ? 'Русский' : 'English'}</p>
            <p className="text-sm text-[#757575]">
              {locale === 'ru'
                ? 'Нажмите кнопку, чтобы переключить на английский'
                : 'Click the button to switch to Russian'}
            </p>
          </div>
          <LanguageSwitcher currentLocale={locale} />
        </div>
      </section>

      {/* Конфиденциальность */}
      <section className="bg-white rounded-3xl border border-gray-100 p-6 space-y-3">
        <h2 className="text-lg font-semibold text-[#212121]">🔒 Конфиденциальность</h2>
        <p className="text-sm text-[#757575]">
          Данные ваших пациентов хранятся в зашифрованном виде. Доступ к данным предоставляется
          только с явного согласия пациента.
        </p>
        <p className="text-xs text-[#bdbdbd]">
          MemoMed AI соответствует требованиям GDPR и 152-ФЗ.
        </p>
      </section>

      {/* Аккаунт */}
      <section className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#212121]">🔐 Аккаунт</h2>
        <SignOutButton />
      </section>

      {/* О приложении */}
      <section className="bg-[#f5f5f5] rounded-3xl p-6 space-y-3">
        <h2 className="text-lg font-semibold text-[#212121]">ℹ️ О приложении</h2>
        <BuildInfo variant="full" />
      </section>
    </div>
  );
}
