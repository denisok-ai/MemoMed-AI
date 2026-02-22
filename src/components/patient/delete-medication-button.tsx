/**
 * @file delete-medication-button.tsx
 * @description Кнопка архивирования лекарства с подтверждением и Server Action
 * @created 2026-02-22
 */

'use client';

import { useTransition } from 'react';
import { deleteMedicationAction } from '@/lib/medications/actions';

interface DeleteMedicationButtonProps {
  id: string;
  name: string;
}

export function DeleteMedicationButton({ id, name }: DeleteMedicationButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Удалить лекарство «${name}»?`)) return;

    startTransition(async () => {
      await deleteMedicationAction(id);
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      aria-label={`Удалить ${name}`}
      className="p-3 rounded-xl bg-[#ffebee] text-[#f44336] hover:bg-[#ffcdd2]
        transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center
        disabled:opacity-50"
    >
      {isPending ? (
        <span className="w-4 h-4 border-2 border-[#f44336] border-t-transparent rounded-full animate-spin" />
      ) : (
        '🗑️'
      )}
    </button>
  );
}
