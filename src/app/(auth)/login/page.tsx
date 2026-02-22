/**
 * @file page.tsx
 * @description Login page for MemoMed AI
 * @dependencies auth.config.ts, LoginForm
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Вход — MemoMed AI',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-[#7e57c2] font-[family-name:var(--font-montserrat)]">
            MemoMed AI
          </h1>
          <p className="text-lg text-[#757575]">Войдите в свой аккаунт</p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 space-y-6">
          <form action="/api/auth/callback/credentials" method="POST" className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-lg font-medium text-[#212121]">
                Электронная почта
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-[#7e57c2] focus:outline-none transition-colors"
                placeholder="your@email.ru"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-lg font-medium text-[#212121]">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-[#7e57c2] focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 text-lg font-semibold text-white bg-[#7e57c2] rounded-xl hover:bg-[#6a3fb5] transition-colors min-h-[56px]"
            >
              Войти
            </button>
          </form>

          <p className="text-center text-lg text-[#757575]">
            Нет аккаунта?{' '}
            <Link href="/register" className="text-[#7e57c2] font-semibold hover:underline">
              Зарегистрируйтесь
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
