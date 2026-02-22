/**
 * @file delete-medication-button.tsx
 * @description Кнопка удаления лекарства в стиле MedTech
 * @created 2026-02-22
 */

'use client';

import { useTransition } from 'react';
import { deleteMedicationAction } from '@/lib/medications/actions';
import { TrashIcon } from '@/components/shared/nav-icons';

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
      className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400
        hover:bg-red-50 hover:text-red-500
        flex items-center justify-center transition-colors
        disabled:opacity-50"
    >
      {isPending ? (
        <span
          className="w-4 h-4 border-2 border-red-400 border-t-transparent
          rounded-full animate-spin"
        />
      ) : (
        <TrashIcon className="w-4 h-4" />
      )}
    </button>
  );
}
