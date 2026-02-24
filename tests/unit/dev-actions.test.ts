/**
 * @file dev-actions.test.ts
 * @description Unit-тесты для devLoginAction
 * @created 2026-02-24
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({ signIn: vi.fn() }));
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

import { signIn } from '@/lib/auth';

describe('devLoginAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('редиректит на /login при отключённом dev-login', async () => {
    vi.stubEnv('ENABLE_DEV_LOGIN', '');
    vi.stubEnv('NODE_ENV', 'production');
    const { devLoginAction } = await import('@/lib/auth/dev-actions');
    await expect(devLoginAction('admin@test.ru', 'admin')).rejects.toThrow('REDIRECT:/login');
  });

  it('редиректит на /admin для роли admin при успехе', async () => {
    vi.stubEnv('ENABLE_DEV_LOGIN', 'true');
    vi.mocked(signIn).mockResolvedValue({ ok: true, url: null, status: 200, error: null });
    const { devLoginAction } = await import('@/lib/auth/dev-actions');
    await expect(devLoginAction('admin@test.ru', 'admin')).rejects.toThrow('REDIRECT:/admin');
  });

  it('редиректит на /feed для роли relative', async () => {
    vi.stubEnv('ENABLE_DEV_LOGIN', 'true');
    vi.mocked(signIn).mockResolvedValue({ ok: true, url: null, status: 200, error: null });
    const { devLoginAction } = await import('@/lib/auth/dev-actions');
    await expect(devLoginAction('rel@test.ru', 'relative')).rejects.toThrow('REDIRECT:/feed');
  });

  it('редиректит на /dashboard для неизвестной роли', async () => {
    vi.stubEnv('ENABLE_DEV_LOGIN', 'true');
    vi.mocked(signIn).mockResolvedValue({ ok: true, url: null, status: 200, error: null });
    const { devLoginAction } = await import('@/lib/auth/dev-actions');
    await expect(devLoginAction('u@test.ru', 'unknown')).rejects.toThrow('REDIRECT:/dashboard');
  });
});
