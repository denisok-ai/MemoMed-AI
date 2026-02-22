/**
 * @file sign-out-button.tsx
 * @description Кнопка выхода из аккаунта с Server Action
 * @dependencies next-auth
 * @created 2026-02-22
 */

'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ redirectTo: '/login' })}
      className="px-4 py-2 text-base text-[#757575] hover:text-[#f44336] rounded-xl
        hover:bg-[#ffebee] transition-colors min-h-[48px]"
      aria-label="Выйти из аккаунта"
    >
      Выйти
    </button>
  );
}
