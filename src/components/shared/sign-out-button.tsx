/**
 * @file sign-out-button.tsx
 * @description Кнопка выхода из аккаунта в стиле MedTech
 * @dependencies next-auth
 * @created 2026-02-22
 */

'use client';

import { signOut } from 'next-auth/react';
import { LogOutIcon } from './nav-icons';

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ redirectTo: '/login' })}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-500
        hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
      aria-label="Выйти из аккаунта"
    >
      <LogOutIcon className="w-4 h-4" />
      <span className="hidden sm:block">Выйти</span>
    </button>
  );
}
