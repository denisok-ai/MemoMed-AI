/**
 * @file page.tsx
 * @description Страница регистрации в стиле MedTech
 * @dependencies RegisterForm
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from '@/components/shared/register-form';
import { Logo } from '@/components/shared/logo';
import { LockIcon } from '@/components/shared/nav-icons';

export const metadata: Metadata = {
  title: 'Регистрация — MemoMed AI',
};

export default function RegisterPage() {
  return (
    <main
      className="min-h-screen flex items-start justify-center
      bg-[#F0F4F8] px-6 py-10"
    >
      <div className="w-full max-w-md space-y-6">
        {/* Логотип */}
        <div className="flex flex-col items-center justify-center gap-1">
          <Logo variant="auth" showIcon />
          <p className="text-slate-500 text-sm">Создайте аккаунт</p>
        </div>

        {/* Форма */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1B2A]">Регистрация</h1>
            <p className="text-slate-500 mt-1">Заполните данные для создания аккаунта</p>
          </div>

          <RegisterForm />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-400 font-medium">или</span>
            </div>
          </div>

          <p className="text-center text-base text-slate-500">
            Уже есть аккаунт?{' '}
            <Link
              href="/login"
              className="text-[#1565C0] font-semibold hover:text-[#0D47A1]
                hover:underline transition-colors"
            >
              Войти
            </Link>
          </p>
        </div>

        {/* Безопасность */}
        <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100">
          <LockIcon className="w-5 h-5 text-[#1565C0] mt-0.5 flex-shrink-0" />
          <p className="text-sm text-slate-500 leading-relaxed">
            Ваши данные защищены и не передаются третьим лицам. Соответствует требованиям GDPR и
            152-ФЗ.
          </p>
        </div>
      </div>
    </main>
  );
}
