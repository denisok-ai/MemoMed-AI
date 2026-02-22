/**
 * @file login-form.tsx
 * @description Форма входа в стиле MedTech
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

      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-slate-600 uppercase tracking-wide"
        >
          Электронная почта
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="med-input"
          placeholder="your@email.ru"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-slate-600 uppercase tracking-wide"
        >
          Пароль
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="med-input"
          placeholder="••••••••"
        />
      </div>

      <SubmitButton label="Войти" loadingLabel="Проверка данных..." />
    </form>
  );
}
