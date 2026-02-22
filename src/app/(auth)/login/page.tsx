/**
 * @file page.tsx
 * @description Страница входа — использует LoginForm с Server Action
 * @dependencies LoginForm
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/components/shared/login-form';

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
          <LoginForm />

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
