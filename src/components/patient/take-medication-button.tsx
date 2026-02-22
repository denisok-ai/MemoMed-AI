/**
 * @file take-medication-button.tsx
 * @description Большая зелёная кнопка «Принять лекарство» с анимацией нажатия
 * Вызывает Server Action и показывает анимацию успеха
 * @dependencies takeMedicationAction
 * @created 2026-02-22
 */

'use client';

import { useState, useTransition } from 'react';
import { takeMedicationAction } from '@/lib/medications/log-actions';

interface TakeMedicationButtonProps {
  medicationId: string;
  medicationName: string;
  scheduledAt: string;
}

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

export function TakeMedicationButton({
  medicationId,
  medicationName,
  scheduledAt,
}: TakeMedicationButtonProps) {
  const [buttonState, setButtonState] = useState<ButtonState>('idle');
  const [isPending, startTransition] = useTransition();

  function handleTake() {
    setButtonState('loading');

    startTransition(async () => {
      const result = await takeMedicationAction(medicationId, scheduledAt);

      if (result.success) {
        setButtonState('success');
        // Сброс состояния через 3 секунды
        setTimeout(() => setButtonState('idle'), 3000);
      } else {
        setButtonState('error');
        setTimeout(() => setButtonState('idle'), 2000);
      }
    });
  }

  const isDisabled = isPending || buttonState === 'success';

  const buttonConfig = {
    idle: {
      bg: 'bg-[#4caf50] hover:bg-[#43a047] active:scale-95',
      text: '💊 Принял(а) лекарство',
      shadow: 'shadow-[0_8px_32px_rgba(76,175,80,0.4)]',
    },
    loading: {
      bg: 'bg-[#4caf50] opacity-80',
      text: 'Запись...',
      shadow: '',
    },
    success: {
      bg: 'bg-[#2e7d32]',
      text: '✅ Отлично! Записано',
      shadow: 'shadow-[0_8px_32px_rgba(46,125,50,0.4)]',
    },
    error: {
      bg: 'bg-[#f44336]',
      text: '❌ Ошибка. Попробуйте снова',
      shadow: '',
    },
  };

  const config = buttonConfig[buttonState];

  return (
    <button
      onClick={handleTake}
      disabled={isDisabled}
      aria-label={`Принять лекарство ${medicationName}`}
      aria-live="polite"
      className={`
        w-full py-6 px-8 rounded-3xl text-white text-2xl font-bold
        transition-all duration-200 ${config.bg} ${config.shadow}
        min-h-[96px] disabled:cursor-not-allowed
        focus:outline-none focus:ring-4 focus:ring-white/50
      `}
    >
      {buttonState === 'loading' ? (
        <span className="flex items-center justify-center gap-3">
          <span className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          Запись...
        </span>
      ) : (
        config.text
      )}
    </button>
  );
}
