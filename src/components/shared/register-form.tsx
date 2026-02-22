/**
 * @file register-form.tsx
 * @description Форма регистрации в стиле MedTech
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

      <div className="space-y-1.5">
        <label
          htmlFor="fullName"
          className="block text-sm font-semibold text-slate-600 uppercase tracking-wide"
        >
          Ваше имя
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          className="med-input"
          placeholder="Иванов Иван Иванович"
        />
      </div>

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
          autoComplete="new-password"
          required
          minLength={8}
          className="med-input"
          placeholder="Минимум 8 символов"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="role"
          className="block text-sm font-semibold text-slate-600 uppercase tracking-wide"
        >
          Кто вы?
        </label>
        <select id="role" name="role" required className="med-input bg-white">
          <option value="patient">Пациент (принимаю лекарства)</option>
          <option value="relative">Родственник (слежу за близким)</option>
          <option value="doctor">Врач (наблюдаю пациентов)</option>
        </select>
      </div>

      <div className="space-y-3 pt-2">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            name="consentGiven"
            value="on"
            required
            className="mt-1.5 w-5 h-5 rounded-md border-slate-300 text-[#1565C0]
              focus:ring-[#1565C0] flex-shrink-0 cursor-pointer
              checked:bg-[#1565C0] checked:border-[#1565C0]"
          />
          <span className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-800 transition-colors">
            Я согласен(а) с{' '}
            <Link href="/privacy" className="text-[#1565C0] font-semibold hover:underline">
              политикой обработки персональных данных
            </Link>{' '}
            (обязательно, ФЗ-152)
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            name="feedbackConsent"
            value="on"
            className="mt-1.5 w-5 h-5 rounded-md border-slate-300 text-[#1565C0]
              focus:ring-[#1565C0] flex-shrink-0 cursor-pointer
              checked:bg-[#1565C0] checked:border-[#1565C0]"
          />
          <span className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-600 transition-colors">
            Разрешить использование анонимных данных об эффективности лекарств (необязательно)
          </span>
        </label>
      </div>

      <SubmitButton
        label="Создать аккаунт"
        loadingLabel="Создание аккаунта..."
        className="bg-[#2E7D32] hover:bg-[#1B5E20] shadow-green-200/60"
      />
    </form>
  );
}
