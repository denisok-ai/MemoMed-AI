/**
 * @file bottom-nav.tsx
 * @description Нижняя навигация для мобильных устройств
 * Для пациента: Главная, Лекарства, История, Чат
 * Для родственника: Лента, Пациенты, Чат
 * @created 2026-02-22
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  activeIcon: string;
}

const patientNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Главная', icon: '🏠', activeIcon: '🏠' },
  { href: '/medications', label: 'Лекарства', icon: '💊', activeIcon: '💊' },
  { href: '/history', label: 'История', icon: '📋', activeIcon: '📋' },
  { href: '/chat', label: 'ИИ-помощник', icon: '🤖', activeIcon: '🤖' },
];

const relativeNavItems: NavItem[] = [
  { href: '/feed', label: 'Лента', icon: '📰', activeIcon: '📰' },
  { href: '/patients', label: 'Пациенты', icon: '👤', activeIcon: '👤' },
  { href: '/chat', label: 'ИИ-помощник', icon: '🤖', activeIcon: '🤖' },
];

interface BottomNavProps {
  userRole: 'patient' | 'relative';
}

export function BottomNav({ userRole }: BottomNavProps) {
  const pathname = usePathname();
  const items = userRole === 'patient' ? patientNavItems : relativeNavItems;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md
        border-t border-gray-100 md:hidden"
      aria-label="Основная навигация"
    >
      <ul className="flex" role="list">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 py-2 px-1 min-h-[64px]
                  transition-colors ${isActive ? 'text-[#7e57c2]' : 'text-[#9e9e9e]'}`}
              >
                <span className="text-2xl" aria-hidden="true">
                  {isActive ? item.activeIcon : item.icon}
                </span>
                <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
