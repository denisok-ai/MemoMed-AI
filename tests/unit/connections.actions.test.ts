/**
 * @file connections.actions.test.ts
 * @description Unit-тесты для connectToPatientAction, disconnectFromPatientAction
 * @created 2026-02-24
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: { findFirst: vi.fn() },
    connection: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
  },
}));
vi.mock('@/lib/rate-limit', () => ({ checkRateLimit: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import { connectToPatientAction, disconnectFromPatientAction } from '@/lib/connections/actions';

describe('connectToPatientAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 4,
      resetInSeconds: 3600,
    });
  });

  it('возвращает ошибку при отсутствии сессии', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const formData = new FormData();
    formData.set('inviteCode', 'ABCD12345678');

    const result = await connectToPatientAction({}, formData);
    expect(result).toEqual({ error: 'Необходима авторизация' });
  });

  it('возвращает ошибку для роли не relative', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'u1', email: 'p@test.ru', role: 'patient' },
      expires: '',
    });
    const formData = new FormData();
    formData.set('inviteCode', 'ABCD12345678');

    const result = await connectToPatientAction({}, formData);
    expect(result).toEqual({ error: 'Только родственники могут использовать инвайт-коды' });
  });

  it('возвращает ошибку при некорректном формате кода', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'rel-1', email: 'r@test.ru', role: 'relative' },
      expires: '',
    });
    const formData = new FormData();
    formData.set('inviteCode', 'short'); // < 8 символов

    const result = await connectToPatientAction({}, formData);
    expect(result).toEqual({ error: 'Некорректный формат кода' });
  });

  it('возвращает ошибку если пациент не найден', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'rel-1', email: 'r@test.ru', role: 'relative' },
      expires: '',
    });
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
    const formData = new FormData();
    formData.set('inviteCode', 'ABCD12345678');

    const result = await connectToPatientAction({}, formData);
    expect(result).toEqual({ error: 'Пациент с таким кодом не найден. Проверьте код.' });
  });

  it('возвращает success при успешном подключении', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'rel-1', email: 'r@test.ru', role: 'relative' },
      expires: '',
    });
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: 'patient-1',
      profile: { fullName: 'Иван Иванов' },
    } as never);
    vi.mocked(prisma.connection.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.connection.create).mockResolvedValue({} as never);

    const formData = new FormData();
    formData.set('inviteCode', 'abcd12345678');

    const result = await connectToPatientAction({}, formData);
    expect(result).toEqual({
      success: true,
      message: 'Вы успешно подключились к Иван Иванов',
    });
    expect(prisma.connection.create).toHaveBeenCalledWith({
      data: {
        patientId: 'patient-1',
        relativeId: 'rel-1',
        status: 'active',
      },
    });
  });
});

describe('disconnectFromPatientAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ничего не делает при отсутствии сессии', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    await disconnectFromPatientAction('conn-1');
    expect(prisma.connection.updateMany).not.toHaveBeenCalled();
  });

  it('обновляет connection при наличии сессии', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'rel-1', email: 'r@test.ru', role: 'relative' },
      expires: '',
    });
    vi.mocked(prisma.connection.updateMany).mockResolvedValue({ count: 1 });

    await disconnectFromPatientAction('conn-123');
    expect(prisma.connection.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'conn-123',
        OR: [{ patientId: 'rel-1' }, { relativeId: 'rel-1' }],
      },
      data: { status: 'inactive' },
    });
  });
});
