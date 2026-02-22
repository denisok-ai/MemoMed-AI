/**
 * @file form-error.tsx
 * @description Компонент отображения ошибки формы
 * @created 2026-02-22
 */

import { AlertTriangleIcon } from './nav-icons';

interface FormErrorProps {
  message?: string;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-start gap-3 bg-red-50 border border-red-200
        rounded-2xl p-4 text-red-700"
    >
      <AlertTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <p className="text-base font-medium">{message}</p>
    </div>
  );
}
