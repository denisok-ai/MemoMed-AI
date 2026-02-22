/**
 * @file form-error.tsx
 * @description Компонент отображения ошибки формы с иконкой и доступностью
 * @created 2026-02-22
 */

interface FormErrorProps {
  message?: string;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-start gap-3 bg-[#ffebee] border border-[#f44336] rounded-xl p-4 text-[#c62828]"
    >
      <span className="text-xl flex-shrink-0" aria-hidden="true">⚠️</span>
      <p className="text-base font-medium">{message}</p>
    </div>
  );
}
