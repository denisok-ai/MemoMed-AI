/**
 * @file onboarding.actions.test.ts
 * @description Unit-тесты для markOnboardingDoneAction
 * @created 2026-02-24
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    profile: { updateMany: vi.fn() },
  },
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { markOnboardingDoneAction } from '@/lib/onboarding/actions';

describe('markOnboardingDoneAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ничего не делает при отсутствии сессии', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    await markOnboardingDoneAction();
    expect(prisma.profile.updateMany).not.toHaveBeenCalled();
  });

  it('обновляет onboardingDone при наличии сессии', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'u@test.ru', role: 'patient' },
      expires: '',
    });
    vi.mocked(prisma.profile.updateMany).mockResolvedValue({ count: 1 });

    await markOnboardingDoneAction();
    expect(prisma.profile.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      data: { onboardingDone: true },
    });
  });
});
