/**
 * @file login-form.tsx
 * @description Клиентская форма входа с Server Action и отображением ошибок
 * @dependencies loginAction, FormError, SubmitButton
 * @created 2026-02-22
 */

'use client';

import { useActionState } from 'react';
import { loginAction, type ActionResult } from '@/lib/auth/actions';
import { FormError } from './form-error';
import { SubmitButton } from './submit-button';

const initialState: ActionResult = {};

export function LoginForm() {
  const [state, action] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="space-y-5">
      <FormError message={state.error} />

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
          autoComplete="current-password"
          required
          className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl
            focus:border-[#7e57c2] focus:outline-none transition-colors"
          placeholder="••••••••"
        />
      </div>

      <SubmitButton label="Войти" loadingLabel="Проверка данных..." className="bg-[#7e57c2] hover:bg-[#6a3fb5]" />
    </form>
  );
}
