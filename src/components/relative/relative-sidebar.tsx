/**
 * @file relative-sidebar.tsx
 * @description Боковое меню родственника в стиле Admin: бургер на мобильных, sidebar на десктопе
 * @created 2026-02-22
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignOutButton } from '@/components/shared/sign-out-button';
import { Logo } from '@/components/shared/logo';
import {
  MenuIcon,
  XIcon,
  RssIcon,
  BotIcon,
  SettingsIcon,
  MedCrossIcon,
} from '@/components/shared/nav-icons';
import { AdminLinkIcon } from '@/components/admin/admin-icons';

const NAV_ITEMS = [
  { href: '/feed', label: 'Лента', Icon: RssIcon },
  { href: '/connect', label: 'Подключиться', Icon: AdminLinkIcon },
  { href: '/chat', label: 'Чат', Icon: BotIcon },
  { href: '/account', label: 'Аккаунт', Icon: SettingsIcon },
];

export function RelativeSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Мобильный хедер — бургер над контентом, не сбоку */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4
          bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm"
      >
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center
            text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
          aria-label="Открыть меню"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
        <Logo href="/feed" variant="sidebar-compact" className="flex-1 justify-center" />
        <div className="w-10 shrink-0" aria-hidden />
      </header>

      {/* Оверлей */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/30 z-40 transition-opacity duration-200
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Боковая панель */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 sm:w-72
          flex flex-col overflow-y-auto z-40
          transition-transform duration-200 ease-out
          bg-white border-r border-slate-200 p-4 sm:p-5 shadow-xl
          lg:translate-x-0 lg:shadow-none lg:bg-slate-50/95 lg:border-slate-200 lg:w-60 lg:min-w-[240px] lg:px-4 lg:py-6 admin-sidebar-scroll
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Логотип + кнопка закрытия */}
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <Logo href="/feed" variant="sidebar" onClick={closeSidebar} />
          <button
            type="button"
            onClick={closeSidebar}
            className="lg:hidden w-10 h-10 min-w-[48px] min-h-[48px] rounded-xl flex items-center justify-center
              text-slate-500 hover:bg-slate-100 active:scale-95 transition-all"
            aria-label="Закрыть меню"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Навигация */}
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/feed'
                ? pathname === '/feed' || pathname.startsWith('/patients')
                : pathname === item.href || pathname.startsWith(item.href + '/');
            const active = isActive;
            const { Icon } = item;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-3 sm:py-2.5 lg:py-2 rounded-xl font-medium min-h-[48px] lg:min-h-[44px]
                  transition-all duration-200
                  ${
                    active
                      ? 'bg-blue-50 text-[#1565C0] lg:bg-white lg:shadow-sm lg:ring-1 lg:ring-slate-200/80'
                      : 'text-[#475569] hover:bg-slate-100/80 hover:text-[#1565C0] lg:hover:bg-white/80'
                  }`}
              >
                <span
                  className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                    ${
                      active
                        ? 'bg-gradient-to-br from-[#1565C0] to-[#0D47A1] text-white lg:shadow-sm'
                        : 'bg-slate-200/60 text-slate-500 lg:bg-slate-200/80'
                    }`}
                >
                  <Icon className="w-4 h-4" aria-hidden />
                </span>
                <span className="text-sm sm:text-base lg:text-sm truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Низ панели */}
        <div className="pt-4 mt-4 border-t border-slate-200 lg:pt-5 lg:mt-5">
          <SignOutButton />
        </div>
      </aside>
    </>
  );
}
