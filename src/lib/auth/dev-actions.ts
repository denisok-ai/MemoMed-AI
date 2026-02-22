/**
 * @file dev-actions.ts
 * @description Server Actions для быстрого входа в режиме разработки.
 * Работает при NODE_ENV=development или ENABLE_DEV_LOGIN=true.
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

/** Разрешён ли dev-login (development или ENABLE_DEV_LOGIN=true) */
const isDevLoginEnabled =
  process.env.NODE_ENV === 'development' || process.env.ENABLE_DEV_LOGIN === 'true';

/**
 * Быстрый вход для разработки.
 * Принимает email тестового аккаунта и автоматически входит.
 */
export async function devLoginAction(email: string, role: string): Promise<void> {
  if (!isDevLoginEnabled) {
    redirect('/login');
  }

  const targetUrl = ROLE_HOME[role] ?? '/dashboard';

  try {
    const result = await signIn('credentials', {
      email,
      password: DEV_PASSWORD,
      redirect: false,
      callbackUrl: targetUrl,
    });
    // NextAuth может вернуть ok: false при успехе в некоторых конфигурациях — проверяем ошибку
    if (result?.error) {
      console.warn('[dev-login] signIn error:', result.error);
      redirect('/login');
    }
  } catch (e) {
    console.warn('[dev-login] signIn exception:', e);
    redirect('/login');
  }

  redirect(targetUrl);
}
