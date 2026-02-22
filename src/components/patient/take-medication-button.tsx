/**
 * @file take-medication-button.tsx
 * @description Кнопка «Принял(а)» — desktop-optimized.
 * Не растягивается на весь экран, центрирована, с иконкой и плавной анимацией.
 * @created 2026-02-22
 */

'use client';

import { useState, useTransition, useEffect } from 'react';
import { takeMedicationAction } from '@/lib/medications/log-actions';
import { saveLogOffline } from '@/lib/sync/sync.service';
import { useOffline } from '@/hooks/use-offline';
import { useTts } from '@/hooks/use-tts';
import { CheckIcon, AlertTriangleIcon, PillIcon } from '@/components/shared/nav-icons';

interface TakeMedicationButtonProps {
  medicationId: string;
  medicationName: string;
  dosage?: string;
  scheduledAt: string;
  scheduledTime?: string;
  autoAnnounce?: boolean;
}

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

export function TakeMedicationButton({
  medicationId,
  medicationName,
  dosage = '',
  scheduledAt,
  scheduledTime = '',
  autoAnnounce = false,
}: TakeMedicationButtonProps) {
  const [buttonState, setButtonState] = useState<ButtonState>('idle');
  const [isPending, startTransition] = useTransition();
  const isOffline = useOffline();
  const { speakMedicationReminder } = useTts();

  useEffect(() => {
    if (autoAnnounce && scheduledTime) {
      const timer = setTimeout(() => {
        speakMedicationReminder(medicationName, dosage, scheduledTime);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [autoAnnounce, medicationName, dosage, scheduledTime, speakMedicationReminder]);

  async function handleTake() {
    setButtonState('loading');

    if (isOffline) {
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

  const stateStyles: Record<ButtonState, string> = {
    idle: 'bg-gradient-to-r from-[#2E7D32] to-[#43A047] shadow-lg shadow-green-200/50 hover:shadow-xl hover:shadow-green-300/50 hover:-translate-y-0.5 active:scale-[0.97]',
    loading: 'bg-[#2E7D32]/80',
    success: 'bg-[#1B5E20] shadow-lg shadow-green-300/40',
    error: 'bg-red-600 shadow-lg shadow-red-200/40',
  };

  const stateIcons: Record<ButtonState, React.ReactNode> = {
    idle: <PillIcon className="w-6 h-6" />,
    loading: (
      <span className="w-6 h-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
    ),
    success: <CheckIcon className="w-6 h-6" />,
    error: <AlertTriangleIcon className="w-6 h-6" />,
  };

  const stateLabels: Record<ButtonState, string> = {
    idle: 'Принял(а) лекарство',
    loading: 'Запись...',
    success: isOffline ? 'Сохранено локально' : 'Записано!',
    error: 'Ошибка. Попробуйте снова',
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleTake}
        disabled={isDisabled}
        aria-label={`Принять лекарство ${medicationName}`}
        aria-live="polite"
        className={`w-full rounded-2xl text-white font-bold
          transition-all duration-200 disabled:cursor-not-allowed
          flex items-center justify-center gap-3
          py-4 px-6 text-lg min-h-[64px]
          ${stateStyles[buttonState]}`}
      >
        {stateIcons[buttonState]}
        <span>{stateLabels[buttonState]}</span>
      </button>

      {isOffline && buttonState === 'idle' && (
        <div
          className="flex items-center justify-center gap-2 py-2 px-4 bg-amber-50
          border border-amber-100 rounded-xl"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <p className="text-sm text-amber-700 font-medium">
            Офлайн — данные отправятся при появлении сети
          </p>
        </div>
      )}
    </div>
  );
}
