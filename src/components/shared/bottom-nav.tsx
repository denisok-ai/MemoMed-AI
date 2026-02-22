/**
 * @file bottom-nav.tsx
 * @description Нижняя навигация в стиле MedTech: SVG-иконки, пилюльный активный индикатор
 * @created 2026-02-22
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  HomeIcon,
  PillIcon,
  BookIcon,
  StarIcon,
  BotIcon,
  UsersIcon,
  RssIcon,
  SettingsIcon,
} from './nav-icons';

interface NavItem {
  href: string;
  labelKey: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const patientNavItems: NavItem[] = [
  { href: '/dashboard', labelKey: 'home', Icon: HomeIcon },
  { href: '/medications', labelKey: 'medications', Icon: PillIcon },
  { href: '/journal', labelKey: 'journal', Icon: BookIcon },
  { href: '/feedback', labelKey: 'feedback', Icon: StarIcon },
  { href: '/chat', labelKey: 'chat', Icon: BotIcon },
];

const relativeNavItems: NavItem[] = [
  { href: '/feed', labelKey: 'feed', Icon: RssIcon },
  { href: '/chat', labelKey: 'chat', Icon: BotIcon },
  { href: '/account', labelKey: 'settings', Icon: SettingsIcon },
];

const doctorNavItems: NavItem[] = [
  { href: '/doctor/dashboard', labelKey: 'patients', Icon: UsersIcon },
  { href: '/doctor/connect', labelKey: 'connect', Icon: RssIcon },
  { href: '/chat', labelKey: 'chat', Icon: BotIcon },
  { href: '/doctor/settings', labelKey: 'settings', Icon: SettingsIcon },
];

interface BottomNavProps {
  userRole: 'patient' | 'relative' | 'doctor' | 'admin';
}

export function BottomNav({ userRole }: BottomNavProps) {
  const pathname = usePathname();
  const t = useTranslations('nav');

  const items =
    userRole === 'patient'
      ? patientNavItems
      : userRole === 'doctor'
        ? doctorNavItems
        : relativeNavItems;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200
        shadow-[0_-1px_8px_rgba(0,0,0,0.06)] md:hidden"
      aria-label="Основная навигация"
    >
      {/* Безопасная зона для iPhone */}
      <ul className="flex px-1 py-1" role="list">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <li key={item.href} className="flex-1 flex justify-center">
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex flex-col items-center gap-0.5 py-2 px-2
                  min-h-[60px] min-w-[48px] rounded-xl transition-all duration-150 w-full
                  ${isActive ? 'text-[#1565C0]' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {/* Активный индикатор (пилюля) */}
                {isActive && (
                  <span
                    className="absolute top-1.5 left-1/2 -translate-x-1/2
                      w-10 h-10 bg-blue-50 rounded-xl -z-10"
                    aria-hidden="true"
                  />
                )}

                <item.Icon
                  className={`w-5 h-5 transition-transform duration-150
                    ${isActive ? 'scale-110' : ''}`}
                />

                <span
                  className={`text-[11px] font-semibold leading-tight tracking-tight
                  ${isActive ? 'text-[#1565C0]' : 'text-slate-400'}`}
                >
                  {t(item.labelKey as Parameters<typeof t>[0])}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
