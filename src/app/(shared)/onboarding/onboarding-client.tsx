/**
 * @file onboarding-client.tsx
 * @description Клиентская обёртка для OnboardingWizard — обрабатывает завершение.
 * @dependencies OnboardingWizard
 * @created 2026-02-22
 */

'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { OnboardingWizard } from '@/components/shared/onboarding-wizard';

export function OnboardingClient() {
  const router = useRouter();
  const [completing, setCompleting] = useState(false);

  const handleComplete = useCallback(async () => {
    if (completing) return;
    setCompleting(true);

    try {
      await fetch('/api/profile/onboarding', { method: 'POST' });
    } catch {
      // Даже при ошибке сети пропускаем онбординг — он не критичен
    }

    router.push('/dashboard');
    router.refresh();
  }, [router, completing]);

  return <OnboardingWizard onComplete={handleComplete} />;
}
