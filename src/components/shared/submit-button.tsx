/**
 * @file submit-button.tsx
 * @description Кнопка отправки формы с состоянием загрузки (использует useFormStatus)
 * @dependencies react-dom
 * @created 2026-02-22
 */

'use client';

import { useFormStatus } from 'react-dom';

interface SubmitButtonProps {
  label: string;
  loadingLabel?: string;
  className?: string;
}

export function SubmitButton({ label, loadingLabel, className }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={`
        w-full py-4 text-lg font-semibold text-white rounded-xl
        transition-all duration-150 min-h-[56px]
        disabled:opacity-60 disabled:cursor-not-allowed
        ${className ?? 'bg-[#7e57c2] hover:bg-[#6a3fb5]'}
      `}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-3">
          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          {loadingLabel ?? 'Подождите...'}
        </span>
      ) : (
        label
      )}
    </button>
  );
}
