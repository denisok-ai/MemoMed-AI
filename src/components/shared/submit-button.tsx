/**
 * @file submit-button.tsx
 * @description Кнопка отправки формы с состоянием загрузки (useFormStatus)
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
        w-full py-4 text-lg font-bold text-white rounded-2xl
        transition-all duration-200 min-h-[56px]
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow-lg active:scale-[0.98]
        ${className ?? 'bg-[#1565C0] hover:bg-[#0D47A1] shadow-blue-200/60'}
      `}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-3">
          <span
            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
            aria-hidden="true"
          />
          {loadingLabel ?? 'Подождите...'}
        </span>
      ) : (
        label
      )}
    </button>
  );
}
