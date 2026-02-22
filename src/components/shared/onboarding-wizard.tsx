/**
 * @file onboarding-wizard.tsx
 * @description Онбординг MedTech 2025/2026:
 * полноэкранные шаги с градиентами, SVG-иконки, плавные переходы
 * @created 2026-02-22
 */

'use client';

import { useState, useCallback } from 'react';
import { HeartPulseIcon, PillIcon, CheckIcon, UsersIcon } from '@/components/shared/nav-icons';

interface OnboardingStep {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  gradient: string;
}

const steps: OnboardingStep[] = [
  {
    Icon: HeartPulseIcon,
    title: 'Добро пожаловать в MemoMed!',
    description:
      'Мы поможем вам не забывать принимать лекарства вовремя. Всё просто и понятно — разберётесь за минуту!',
    gradient: 'from-[#1565C0] to-[#1976D2]',
  },
  {
    Icon: PillIcon,
    title: 'Добавьте лекарства',
    description:
      'Укажите название, дозировку и время приёма. Можно сфотографировать упаковку, чтобы не перепутать.',
    gradient: 'from-[#0D47A1] to-[#1565C0]',
  },
  {
    Icon: CheckIcon,
    title: 'Нажимайте большую кнопку',
    description:
      'Когда приходит время приёма — на главном экране появляется название лекарства и большая кнопка «Принято». Просто нажмите на неё!',
    gradient: 'from-[#2E7D32] to-[#43A047]',
  },
  {
    Icon: UsersIcon,
    title: 'Родные будут спокойны',
    description:
      'Поделитесь кодом приглашения с близкими. Они смогут видеть, что вы вовремя принимаете лекарства.',
    gradient: 'from-[#E65100] to-[#F57C00]',
  },
];

interface OnboardingWizardProps {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      onComplete();
    }
  }, [currentStep, onComplete]);

  const handleSkip = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  return (
    <div
      className={`min-h-screen flex flex-col bg-gradient-to-br ${step.gradient}
      transition-all duration-700`}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/[0.06] blur-2xl" />
        <div className="absolute bottom-20 -left-10 w-56 h-56 rounded-full bg-white/[0.04] blur-xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Skip */}
      <div className="relative flex justify-end p-4">
        <button
          onClick={handleSkip}
          className="text-white/60 text-sm font-semibold px-4 py-2 rounded-xl
            hover:bg-white/10 transition-colors min-h-[48px]"
          aria-label="Пропустить обучение"
        >
          Пропустить
        </button>
      </div>

      {/* Content */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div
          className="w-24 h-24 rounded-3xl bg-white/15 backdrop-blur-md
          flex items-center justify-center mb-8 med-float
          border border-white/20 shadow-lg shadow-black/10"
        >
          <step.Icon className="w-12 h-12 text-white" />
        </div>

        <h1
          className="text-3xl font-black text-white mb-4 leading-tight max-w-md
          drop-shadow-lg"
        >
          {step.title}
        </h1>

        <p className="text-lg text-white/75 leading-relaxed max-w-sm">{step.description}</p>
      </div>

      {/* Navigation */}
      <div className="relative p-6 space-y-5">
        <div
          className="flex justify-center gap-2"
          role="progressbar"
          aria-valuenow={currentStep + 1}
          aria-valuemax={steps.length}
        >
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`h-1.5 rounded-full transition-all duration-500
                ${i === currentStep ? 'w-10 bg-white' : 'w-2.5 bg-white/30 hover:bg-white/50'}`}
              aria-label={`Шаг ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full py-4 rounded-2xl bg-white text-[#0D47A1] text-xl font-black
            hover:bg-white/90 active:scale-[0.98] transition-all min-h-[56px]
            shadow-lg shadow-black/10"
        >
          {isLast ? 'Начать работу' : 'Далее'}
        </button>
      </div>
    </div>
  );
}
