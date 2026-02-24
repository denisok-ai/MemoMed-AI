/**
 * @file auth.actions.test.ts
 * @description Unit-тесты для loginAction, registerAction
 * @created 2026-02-24
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({ signIn: vi.fn() }));
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn() },
  },
}));
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));
vi.mock('next-auth', () => ({
  AuthError: class AuthError extends Error {
    type: string;
    constructor(type: string) {
      super(type);
      this.type = type;
    }
  },
}));

import { signIn } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { loginAction, registerAction } from '@/lib/auth/actions';
import { AuthError } from 'next-auth';

describe('loginAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('возвращает ошибку при невалидном email', async () => {
    const formData = new FormData();
    formData.set('email', 'invalid');
    formData.set('password', 'pass123');
    const result = await loginAction({}, formData);
    expect(result).toHaveProperty('error');
    expect(result.error).toMatch(/почты|данн/i);
  });

  it('возвращает ошибку при пустом пароле', async () => {
    const formData = new FormData();
    formData.set('email', 'user@test.ru');
    formData.set('password', '');
    const result = await loginAction({}, formData);
    expect(result).toHaveProperty('error');
  });

  it('возвращает ошибку при CredentialsSignin', async () => {
    vi.mocked(signIn).mockRejectedValue(new AuthError('CredentialsSignin'));
    const formData = new FormData();
    formData.set('email', 'user@test.ru');
    formData.set('password', 'wrong');
    const result = await loginAction({}, formData);
    expect(result).toEqual({ error: 'Неверный email или пароль' });
  });

  it('редиректит при успешном входе', async () => {
    vi.mocked(signIn).mockResolvedValue({ ok: true, url: null, status: 200, error: null });
    const formData = new FormData();
    formData.set('email', 'user@test.ru');
    formData.set('password', 'pass123');
    await expect(loginAction({}, formData)).rejects.toThrow('REDIRECT:/dashboard');
  });
});

describe('registerAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('возвращает ошибку при невалидных данных', async () => {
    const formData = new FormData();
    formData.set('email', 'bad');
    formData.set('password', 'short');
    formData.set('fullName', 'X');
    formData.set('role', 'patient');
    formData.set('consentGiven', 'on');
    const result = await registerAction({}, formData);
    expect(result).toHaveProperty('error');
  });

  it('возвращает ошибку без согласия на обработку данных', async () => {
    const formData = new FormData();
    formData.set('email', 'new@test.ru');
    formData.set('password', 'Password123!');
    formData.set('fullName', 'Иван Иванов');
    formData.set('role', 'patient');
    formData.set('consentGiven', 'off');
    formData.set('feedbackConsent', 'off');
    const result = await registerAction({}, formData);
    expect(result).toEqual({ error: 'Необходимо принять политику обработки персональных данных' });
  });

  it('возвращает ошибку если email уже существует', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'u1',
      email: 'exists@test.ru',
    } as never);
    const formData = new FormData();
    formData.set('email', 'exists@test.ru');
    formData.set('password', 'Password123!');
    formData.set('fullName', 'Иван Иванов');
    formData.set('role', 'patient');
    formData.set('consentGiven', 'on');
    formData.set('feedbackConsent', 'off');
    const result = await registerAction({}, formData);
    expect(result).toEqual({ error: 'Пользователь с таким email уже существует' });
  });

  it('создаёт пользователя и редиректит при успехе', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({} as never);
    vi.mocked(signIn).mockResolvedValue({ ok: true, url: null, status: 200, error: null });
    const formData = new FormData();
    formData.set('email', 'new@test.ru');
    formData.set('password', 'Password123!');
    formData.set('fullName', 'Иван Иванов');
    formData.set('role', 'patient');
    formData.set('consentGiven', 'on');
    formData.set('feedbackConsent', 'off');
    await expect(registerAction({}, formData)).rejects.toThrow('REDIRECT:/dashboard');
    expect(prisma.user.create).toHaveBeenCalled();
  });

  it('редиректит на /feed для роли relative', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({} as never);
    vi.mocked(signIn).mockResolvedValue({ ok: true, url: null, status: 200, error: null });
    const formData = new FormData();
    formData.set('email', 'rel@test.ru');
    formData.set('password', 'Password123!');
    formData.set('fullName', 'Родственник');
    formData.set('role', 'relative');
    formData.set('consentGiven', 'on');
    formData.set('feedbackConsent', 'off');
    await expect(registerAction({}, formData)).rejects.toThrow('REDIRECT:/feed');
  });
});
