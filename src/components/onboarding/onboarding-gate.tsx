/**
 * @file onboarding-gate.tsx
 * @description Проверяет нужен ли онбординг и показывает его если да.
 * Клиентский компонент — получает флаг onboardingDone с сервера.
 * @created 2026-02-22
 */

'use client';

import { useState } from 'react';
import { OnboardingFlow } from './onboarding-flow';

interface OnboardingGateProps {
  children: React.ReactNode;
  onboardingDone: boolean;
}

export function OnboardingGate({ children, onboardingDone }: OnboardingGateProps) {
  const [isDone, setIsDone] = useState(onboardingDone);

  if (!isDone) {
    return <OnboardingFlow onComplete={() => setIsDone(true)} />;
  }

  return <>{children}</>;
}
