/**
 * @file page.tsx
 * @description Registration page with consent form (ФЗ-152 compliance)
 * @dependencies auth API, RegisterForm
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import Link from 'next/link';

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
          <form action="/api/auth/register" method="POST" className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-lg font-medium text-[#212121]">
                Ваше имя
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-[#7e57c2] focus:outline-none transition-colors"
                placeholder="Иванов Иван Иванович"
              />
            </div>

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
                autoComplete="new-password"
                required
                minLength={8}
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-[#7e57c2] focus:outline-none transition-colors"
                placeholder="Минимум 8 символов"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="block text-lg font-medium text-[#212121]">
                Кто вы?
              </label>
              <select
                id="role"
                name="role"
                required
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-[#7e57c2] focus:outline-none transition-colors bg-white"
              >
                <option value="patient">Пациент (принимаю лекарства)</option>
                <option value="relative">Родственник (слежу за близким)</option>
              </select>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="consentGiven"
                  required
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-[#7e57c2] flex-shrink-0"
                />
                <span className="text-base text-[#212121]">
                  Я согласен(а) с{' '}
                  <Link href="/privacy" className="text-[#7e57c2] underline">
                    политикой обработки персональных данных
                  </Link>{' '}
                  (обязательно, ФЗ-152)
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="feedbackConsent"
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-[#7e57c2] flex-shrink-0"
                />
                <span className="text-base text-[#757575]">
                  Разрешить использование анонимных данных об эффективности лекарств для улучшения
                  сервиса (необязательно)
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-4 text-lg font-semibold text-white bg-[#4caf50] rounded-xl hover:bg-[#43a047] transition-colors min-h-[56px]"
            >
              Создать аккаунт
            </button>
          </form>

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
