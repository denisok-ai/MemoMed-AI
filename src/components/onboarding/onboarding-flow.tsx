/**
 * @file onboarding-flow.tsx
 * @description Обучающий онбординг для новых пользователей.
 * 4 экрана с крупными иконками, минимумом текста, кнопкой «Пропустить».
 * Показывается только при первом входе (флаг onboardingDone в профиле).
 * @created 2026-02-22
 */

'use client';

import { useState, useTransition } from 'react';
import { markOnboardingDoneAction } from '@/lib/onboarding/actions';
import { PillIcon, CheckIcon, RssIcon, UsersIcon } from '@/components/shared/nav-icons';

interface OnboardingSlide {
  Icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  title: string;
  description: string;
  bgColor: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    Icon: PillIcon,
    title: 'Ваши лекарства',
    description:
      'Добавьте список лекарств — время приёма и дозировку. Приложение напомнит в нужный момент.',
    bgColor: 'from-[#1565C0] to-[#42A5F5]',
  },
  {
    Icon: CheckIcon,
    title: 'Нажмите кнопку',
    description: 'Когда придёт время — нажмите большую зелёную кнопку. Каждый приём будет записан.',
    bgColor: 'from-[#4caf50] to-[#66bb6a]',
  },
  {
    Icon: RssIcon,
    title: 'Работает офлайн',
    description:
      'Приложение работает даже без интернета. Данные синхронизируются автоматически при подключении.',
    bgColor: 'from-[#42a5f5] to-[#26c6da]',
  },
  {
    Icon: UsersIcon,
    title: 'Для близких',
    description:
      'Поделитесь кодом с родственниками — они смогут следить за приёмом лекарств в реальном времени.',
    bgColor: 'from-[#ff7043] to-[#ab47bc]',
  },
];

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [slide, setSlide] = useState(0);
  const [isPending, startTransition] = useTransition();

  const isLast = slide === SLIDES.length - 1;
  const current = SLIDES[slide]!;

  function handleComplete() {
    startTransition(async () => {
      await markOnboardingDoneAction();
      onComplete();
    });
  }

  function handleSkip() {
    startTransition(async () => {
      await markOnboardingDoneAction();
      onComplete();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Градиентный фон */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${current.bgColor} transition-all duration-500`}
      />

      {/* Кнопка «Пропустить» */}
      <div className="relative z-10 flex justify-end p-6">
        <button
          onClick={handleSkip}
          disabled={isPending}
          className="text-white/80 text-lg font-medium px-4 py-2 hover:text-white
            transition-colors min-h-[48px]"
          aria-label="Пропустить обучение"
        >
          Пропустить
        </button>
      </div>

      {/* Основной контент */}
      <div
        className="relative z-10 flex-1 flex flex-col items-center justify-center
        px-8 text-center space-y-8"
      >
        <div
          className="w-32 h-32 flex items-center justify-center text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
          aria-hidden="true"
        >
          <current.Icon className="w-24 h-24" aria-hidden />
        </div>

        <div className="space-y-4 max-w-sm">
          <h2 className="text-3xl font-bold text-white leading-tight">{current.title}</h2>
          <p className="text-xl text-white/90 leading-relaxed">{current.description}</p>
        </div>
      </div>

      {/* Точки-индикаторы и кнопки */}
      <div className="relative z-10 px-8 pb-12 space-y-6">
        {/* Индикатор текущего экрана */}
        <div className="flex justify-center gap-2" role="tablist" aria-label="Шаги онбординга">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              role="tab"
              aria-selected={i === slide}
              aria-label={`Экран ${i + 1} из ${SLIDES.length}`}
              className={`h-2 rounded-full transition-all duration-300
                ${i === slide ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
            />
          ))}
        </div>

        {/* Кнопка «Далее» / «Начать» */}
        {isLast ? (
          <button
            onClick={handleComplete}
            disabled={isPending}
            className="w-full py-5 bg-white text-[#1565C0] text-xl font-bold rounded-3xl
              hover:bg-white/90 transition-colors min-h-[64px] disabled:opacity-60"
          >
            {isPending ? 'Подготовка...' : 'Начать'}
          </button>
        ) : (
          <button
            onClick={() => setSlide((s) => s + 1)}
            className="w-full py-5 bg-white/20 text-white text-xl font-semibold rounded-3xl
              hover:bg-white/30 transition-colors border border-white/30 min-h-[64px]"
          >
            Далее →
          </button>
        )}
      </div>
    </div>
  );
}
