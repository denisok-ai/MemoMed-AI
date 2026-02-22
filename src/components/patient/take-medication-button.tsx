/**
 * @file take-medication-button.tsx
 * @description Большая кнопка «Принял(а) лекарство» с поддержкой офлайн-режима.
 * Онлайн: вызывает Server Action → записывает в БД.
 * Офлайн: сохраняет лог в IndexedDB, синхронизирует при появлении сети.
 * @dependencies takeMedicationAction, saveLogOffline, useOffline
 * @created 2026-02-22
 */

'use client';

import { useState, useTransition } from 'react';
import { takeMedicationAction } from '@/lib/medications/log-actions';
import { saveLogOffline } from '@/lib/sync/sync.service';
import { useOffline } from '@/hooks/use-offline';

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
  const isOffline = useOffline();

  async function handleTake() {
    setButtonState('loading');

    if (isOffline) {
      // Офлайн: сохраняем в IndexedDB, синхронизируем позже
      try {
        await saveLogOffline({
          localId: `local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          medicationId,
          scheduledAt,
          actualAt: new Date().toISOString(),
          status: 'taken',
          syncStatus: 'pending',
          createdAt: new Date().toISOString(),
        });
        setButtonState('success');
        setTimeout(() => setButtonState('idle'), 3000);
      } catch {
        setButtonState('error');
        setTimeout(() => setButtonState('idle'), 2000);
      }
      return;
    }

    // Онлайн: Server Action
    startTransition(async () => {
      const result = await takeMedicationAction(medicationId, scheduledAt);

      if (result.success) {
        setButtonState('success');
        setTimeout(() => setButtonState('idle'), 3000);
      } else {
        setButtonState('error');
        setTimeout(() => setButtonState('idle'), 2000);
      }
    });
  }

  const isDisabled = isPending || buttonState === 'success';

  const buttonConfig: Record<ButtonState, { bg: string; text: string; shadow: string }> = {
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
      text: isOffline ? '✅ Сохранено локально' : '✅ Отлично! Записано',
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
    <div className="space-y-2">
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
            <span
              className="w-6 h-6 border-[3px] border-white border-t-transparent rounded-full animate-spin"
              aria-hidden="true"
            />
            Запись...
          </span>
        ) : (
          config.text
        )}
      </button>

      {/* Подсказка при офлайн */}
      {isOffline && buttonState === 'idle' && (
        <p className="text-center text-sm text-[#ff9800] font-medium" role="status">
          📴 Офлайн-режим — данные сохранятся и отправятся при появлении сети
        </p>
      )}
    </div>
  );
}
