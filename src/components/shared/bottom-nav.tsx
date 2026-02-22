/**
 * @file bottom-nav.tsx
 * @description Mobile bottom navigation bar (48px+ tap targets)
 * @created 2026-02-22
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const patientNav: NavItem[] = [
  { href: '/dashboard', label: 'Главная', icon: '🏠' },
  { href: '/medications', label: 'Лекарства', icon: '💊' },
  { href: '/chat', label: 'Помощник', icon: '🤖' },
];

const relativeNav: NavItem[] = [
  { href: '/feed', label: 'Лента', icon: '📋' },
  { href: '/calendar', label: 'Календарь', icon: '📅' },
];

interface BottomNavProps {
  userRole: 'patient' | 'relative';
}

export function BottomNav({ userRole }: BottomNavProps) {
  const pathname = usePathname();
  const navItems = userRole === 'patient' ? patientNav : relativeNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 md:hidden">
      <div className="flex items-stretch">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-3 min-h-[64px] transition-colors ${
                isActive ? 'text-[#7e57c2]' : 'text-[#757575]'
              }`}
              aria-label={item.label}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className={`text-xs mt-1 font-medium ${isActive ? 'text-[#7e57c2]' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
