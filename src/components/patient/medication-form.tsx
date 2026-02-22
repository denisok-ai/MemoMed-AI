/**
 * @file medication-form.tsx
 * @description Клиентская форма добавления/редактирования лекарства
 * @dependencies createMedicationAction, updateMedicationAction, FormError, SubmitButton
 * @created 2026-02-22
 */

'use client';

import { useActionState } from 'react';
import { createMedicationAction, updateMedicationAction, type MedicationActionResult } from '@/lib/medications/actions';
import { FormError } from '@/components/shared/form-error';
import { SubmitButton } from '@/components/shared/submit-button';

interface MedicationFormProps {
  /** При наличии id — режим редактирования */
  medicationId?: string;
  /** Начальные значения для редактирования */
  defaultValues?: {
    name?: string;
    dosage?: string;
    instruction?: string;
    scheduledTime?: string;
  };
}

const initialState: MedicationActionResult = {};

export function MedicationForm({ medicationId, defaultValues }: MedicationFormProps) {
  const action = medicationId
    ? updateMedicationAction.bind(null, medicationId)
    : createMedicationAction;

  const [state, formAction] = useActionState(action, initialState);

  const isEditing = !!medicationId;

  return (
    <form action={formAction} className="space-y-6">
      <FormError message={state.error} />

      <div className="space-y-2">
        <label htmlFor="name" className="block text-lg font-medium text-[#212121]">
          Название лекарства
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={defaultValues?.name}
          className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl
            focus:border-[#7e57c2] focus:outline-none transition-colors"
          placeholder="Например: Аспирин"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="dosage" className="block text-lg font-medium text-[#212121]">
          Дозировка
        </label>
        <input
          id="dosage"
          name="dosage"
          type="text"
          required
          defaultValue={defaultValues?.dosage}
          className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl
            focus:border-[#7e57c2] focus:outline-none transition-colors"
          placeholder="Например: 1 таблетка 500 мг"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="scheduledTime" className="block text-lg font-medium text-[#212121]">
          Время приёма
        </label>
        <input
          id="scheduledTime"
          name="scheduledTime"
          type="time"
          required
          defaultValue={defaultValues?.scheduledTime}
          className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl
            focus:border-[#7e57c2] focus:outline-none transition-colors"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="instruction" className="block text-lg font-medium text-[#212121]">
          Инструкция{' '}
          <span className="text-[#757575] font-normal text-base">(необязательно)</span>
        </label>
        <textarea
          id="instruction"
          name="instruction"
          rows={3}
          defaultValue={defaultValues?.instruction}
          className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl
            focus:border-[#7e57c2] focus:outline-none transition-colors resize-none"
          placeholder="Особые указания: принимать после еды, запивать водой..."
        />
      </div>

      <SubmitButton
        label={isEditing ? 'Сохранить изменения' : 'Добавить лекарство'}
        loadingLabel={isEditing ? 'Сохранение...' : 'Добавление...'}
        className="bg-[#4caf50] hover:bg-[#43a047]"
      />
    </form>
  );
}
