/**
 * @file connect-form.tsx
 * @description Форма ввода инвайт-кода для привязки к пациенту
 * @dependencies FormError, SubmitButton
 * @created 2026-02-22
 */

'use client';

import { useActionState } from 'react';
import { connectToPatientAction, type ConnectActionResult } from '@/lib/connections/actions';
import { FormError } from '@/components/shared/form-error';
import { SubmitButton } from '@/components/shared/submit-button';

const initialState: ConnectActionResult = {};

export function ConnectForm() {
  const [state, action] = useActionState(connectToPatientAction, initialState);

  return (
    <form action={action} className="space-y-5">
      <FormError message={state.error} />

      {state.success && (
        <div
          role="alert"
          className="flex items-start gap-3 bg-[#e8f5e9] border border-[#4caf50] rounded-xl p-4"
        >
          <span className="text-xl">✅</span>
          <p className="text-base font-medium text-[#2e7d32]">{state.message}</p>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="inviteCode" className="block text-lg font-medium text-[#212121]">
          Код приглашения
        </label>
        <input
          id="inviteCode"
          name="inviteCode"
          type="text"
          required
          autoComplete="off"
          autoCapitalize="characters"
          className="w-full px-4 py-3 text-xl font-mono tracking-widest text-center
            border-2 border-gray-200 rounded-xl uppercase
            focus:border-[#1565C0] focus:outline-none transition-colors"
          placeholder="Введите код"
          maxLength={32}
        />
      </div>

      <SubmitButton
        label="Подключиться"
        loadingLabel="Проверка кода..."
        className="bg-[#1565C0] hover:bg-[#0D47A1]"
      />
    </form>
  );
}
