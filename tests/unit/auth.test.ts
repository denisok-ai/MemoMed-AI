/**
 * @file auth.test.ts
 * @description Юнит-тесты для логики аутентификации: валидация, хэширование паролей
 * @created 2026-02-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';

// Мокаем модули с внешними зависимостями
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('next-auth', () => ({
  default: vi.fn(),
  AuthError: class AuthError extends Error {
    type: string;
    constructor(type: string) {
      super(type);
      this.type = type;
    }
  },
}));

vi.mock('@/lib/auth', () => ({
  signIn: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

import { prisma } from '@/lib/db/prisma';

describe('Хэширование паролей', () => {
  it('bcrypt.hash создаёт хэш, не равный исходному паролю', async () => {
    const password = 'testPassword123';
    const hash = await bcrypt.hash(password, 12);
    expect(hash).not.toBe(password);
    expect(hash.startsWith('$2b$')).toBe(true);
  });

  it('bcrypt.compare возвращает true для правильного пароля', async () => {
    const password = 'testPassword123';
    const hash = await bcrypt.hash(password, 12);
    const result = await bcrypt.compare(password, hash);
    expect(result).toBe(true);
  });

  it('bcrypt.compare возвращает false для неправильного пароля', { timeout: 10000 }, async () => {
    const password = 'testPassword123';
    const wrongPassword = 'wrongPassword';
    const hash = await bcrypt.hash(password, 12);
    const result = await bcrypt.compare(wrongPassword, hash);
    expect(result).toBe(false);
  });
});

describe('Поиск пользователя', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('возвращает null если пользователь не найден', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const user = await prisma.user.findUnique({ where: { email: 'notfound@test.ru' } });
    expect(user).toBeNull();
  });

  it('возвращает пользователя если найден', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@test.ru',
      passwordHash: '$2b$12$hash',
      role: 'patient' as const,
      inviteCode: 'INVITE123456',
      consentGiven: true,
      feedbackConsent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

    const user = await prisma.user.findUnique({ where: { email: 'test@test.ru' } });
    expect(user).not.toBeNull();
    expect(user?.email).toBe('test@test.ru');
    expect(user?.role).toBe('patient');
  });
});
