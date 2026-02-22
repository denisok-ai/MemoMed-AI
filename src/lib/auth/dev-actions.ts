/**
 * @file dev-actions.ts
 * @description Server Actions для быстрого входа в режиме разработки.
 * ВАЖНО: Работает только при NODE_ENV=development.
 * @dependencies next-auth, actions.ts
 * @created 2026-02-22
 */

'use server';

import { signIn } from '@/lib/auth';
import { redirect } from 'next/navigation';

const DEV_PASSWORD = 'Test1234!';

const ROLE_HOME: Record<string, string> = {
  admin: '/admin',
  doctor: '/doctor/dashboard',
  relative: '/feed',
  patient: '/dashboard',
};

/**
 * Быстрый вход для разработки.
 * Принимает email тестового аккаунта и автоматически входит.
 */
export async function devLoginAction(email: string, role: string): Promise<void> {
  if (process.env.NODE_ENV !== 'development') {
    redirect('/login');
  }

  try {
    await signIn('credentials', {
      email,
      password: DEV_PASSWORD,
      redirect: false,
    });
  } catch {
    redirect('/login');
  }

  redirect(ROLE_HOME[role] ?? '/dashboard');
}
