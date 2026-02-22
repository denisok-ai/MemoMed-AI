/**
 * @file header.tsx
 * @description Шапка приложения с логотипом, именем пользователя и кнопкой выхода
 * @dependencies next-auth
 * @created 2026-02-22
 */

import Link from 'next/link';
import { SignOutButton } from './sign-out-button';

interface HeaderProps {
  userRole: 'patient' | 'relative';
  userName?: string;
}

export function Header({ userRole, userName }: HeaderProps) {
  const homeHref = userRole === 'patient' ? '/dashboard' : '/feed';

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href={homeHref}
          className="text-xl font-bold text-[#7e57c2] font-[family-name:var(--font-montserrat)]"
          aria-label="MemoMed AI — на главную"
        >
          MemoMed
        </Link>

        <div className="flex items-center gap-3">
          {userName && (
            <span className="text-base text-[#757575] hidden sm:block truncate max-w-[160px]">
              {userName}
            </span>
          )}
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
