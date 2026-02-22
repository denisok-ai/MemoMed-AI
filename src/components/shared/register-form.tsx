/**
 * @file register-form.tsx
 * @description Клиентская форма регистрации с согласием ФЗ-152 и Server Action
 * @dependencies registerAction, FormError, SubmitButton
 * @created 2026-02-22
 */

'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { registerAction, type ActionResult } from '@/lib/auth/actions';
import { FormError } from './form-error';
import { SubmitButton } from './submit-button';

const initialState: ActionResult = {};

export function RegisterForm() {
  const [state, action] = useActionState(registerAction, initialState);

  return (
    <form action={action} className="space-y-5">
      <FormError message={state.error} />

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
          className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl
            focus:border-[#7e57c2] focus:outline-none transition-colors"
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
          className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl
            focus:border-[#7e57c2] focus:outline-none transition-colors"
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
          className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl
            focus:border-[#7e57c2] focus:outline-none transition-colors"
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
          className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl
            focus:border-[#7e57c2] focus:outline-none transition-colors bg-white"
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
            value="on"
            required
            className="mt-1 w-5 h-5 rounded border-gray-300 text-[#7e57c2] flex-shrink-0 cursor-pointer"
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
            value="on"
            className="mt-1 w-5 h-5 rounded border-gray-300 text-[#7e57c2] flex-shrink-0 cursor-pointer"
          />
          <span className="text-base text-[#757575]">
            Разрешить использование анонимных данных об эффективности лекарств (необязательно)
          </span>
        </label>
      </div>

      <SubmitButton
        label="Создать аккаунт"
        loadingLabel="Создание аккаунта..."
        className="bg-[#4caf50] hover:bg-[#43a047]"
      />
    </form>
  );
}
