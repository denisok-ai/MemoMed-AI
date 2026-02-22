/**
 * @file header.tsx
 * @description Шапка приложения в стиле MedTech: логотип с медкрестом,
 * имя пользователя, переключатель языка и кнопка выхода
 * @dependencies next-auth, LanguageSwitcher, SignOutButton, MedCrossIcon
 * @created 2026-02-22
 */

import Link from 'next/link';
import { SignOutButton } from './sign-out-button';
import { LanguageSwitcher } from './language-switcher';
import { MedCrossIcon, UserIcon, SettingsIcon } from './nav-icons';
import { getLocale } from 'next-intl/server';

interface HeaderProps {
  userRole: 'patient' | 'relative' | 'doctor' | 'admin';
  userName?: string;
}

const ROLE_CONFIG: Record<
  HeaderProps['userRole'],
  { label: string; badge: string; href: string; settingsHref: string }
> = {
  patient: {
    label: 'Пациент',
    badge: 'bg-blue-100 text-blue-700',
    href: '/dashboard',
    settingsHref: '/settings',
  },
  relative: {
    label: 'Родственник',
    badge: 'bg-blue-100 text-blue-700',
    href: '/feed',
    settingsHref: '/account',
  },
  doctor: {
    label: 'Врач',
    badge: 'bg-teal-100 text-teal-700',
    href: '/doctor/dashboard',
    settingsHref: '/doctor/settings',
  },
  admin: {
    label: 'Администратор',
    badge: 'bg-slate-100 text-slate-600',
    href: '/admin',
    settingsHref: '/admin',
  },
};

export async function Header({ userRole, userName }: HeaderProps) {
  const locale = await getLocale();
  const config = ROLE_CONFIG[userRole];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Логотип */}
        <Link
          href={config.href}
          className="flex items-center gap-2.5 flex-shrink-0 group"
          aria-label="MemoMed AI — на главную"
        >
          <div
            className="w-9 h-9 rounded-xl bg-[#1565C0] flex items-center justify-center
            shadow-sm group-hover:bg-[#0D47A1] transition-colors flex-shrink-0"
          >
            <MedCrossIcon className="w-5 h-5 text-white" />
          </div>
          <span
            className="font-bold text-[#0D1B2A] text-lg tracking-tight
            font-[family-name:var(--font-montserrat)] hidden sm:block"
          >
            MemoMed
            <span className="text-[#1565C0] font-black"> AI</span>
          </span>
        </Link>

        {/* Центр: бейдж роли */}
        {userRole !== 'patient' && (
          <span
            className={`hidden md:inline-flex items-center gap-1.5 text-sm font-semibold
            px-3 py-1.5 rounded-full ${config.badge} uppercase tracking-wide`}
          >
            {config.label}
          </span>
        )}

        {/* Правая часть */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Имя пользователя */}
          {userName && (
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5
              bg-slate-50 rounded-xl border border-slate-100"
            >
              <UserIcon className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-600 max-w-[130px] truncate">
                {userName}
              </span>
            </div>
          )}

          {/* Настройки */}
          <Link
            href={config.settingsHref}
            className="flex items-center justify-center w-10 h-10 rounded-xl
              text-slate-400 hover:text-[#1565C0] hover:bg-blue-50 transition-colors"
            aria-label="Настройки"
          >
            <SettingsIcon className="w-5 h-5" />
          </Link>

          {/* Переключатель языка */}
          <LanguageSwitcher currentLocale={locale} />

          {/* Кнопка выхода */}
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
