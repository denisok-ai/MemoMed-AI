/**
 * @file page.tsx
 * @description Страница регистрации — использует RegisterForm с Server Action
 * @dependencies RegisterForm
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from '@/components/shared/register-form';

export const metadata: Metadata = {
  title: 'Регистрация — MemoMed AI',
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-[#7e57c2] font-[family-name:var(--font-montserrat)]">
            Регистрация
          </h1>
          <p className="text-lg text-[#757575]">Создайте аккаунт MemoMed AI</p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 space-y-6">
          <RegisterForm />

          <p className="text-center text-lg text-[#757575]">
            Уже есть аккаунт?{' '}
            <Link href="/login" className="text-[#7e57c2] font-semibold hover:underline">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
