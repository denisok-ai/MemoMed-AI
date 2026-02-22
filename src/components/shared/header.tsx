/**
 * @file header.tsx
 * @description Shared app header with navigation and user info
 * @created 2026-02-22
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  userRole?: 'patient' | 'relative' | 'admin';
  userName?: string;
}

export function Header({ userRole, userName }: HeaderProps) {
  const pathname = usePathname();

  const navLinks =
    userRole === 'patient'
      ? [
          { href: '/dashboard', label: '🏠 Главная' },
          { href: '/medications', label: '💊 Лекарства' },
          { href: '/chat', label: '🤖 Помощник' },
        ]
      : userRole === 'relative'
        ? [
            { href: '/feed', label: '📋 Лента' },
            { href: '/calendar', label: '📅 Календарь' },
          ]
        : [];

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-xl font-bold text-[#7e57c2] font-[family-name:var(--font-montserrat)]"
        >
          MemoMed AI
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-xl text-base font-medium transition-colors min-h-[48px] flex items-center ${
                pathname === link.href
                  ? 'bg-[#7e57c2] text-white'
                  : 'text-[#757575] hover:bg-gray-100 hover:text-[#212121]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {userName && (
          <span className="text-base text-[#757575] hidden md:block">{userName}</span>
        )}
      </div>
    </header>
  );
}
