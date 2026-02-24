/**
 * @file log-actions.test.ts
 * @description Unit-тесты для takeMedicationAction
 * @created 2026-02-24
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    medication: { findFirst: vi.fn() },
    medicationLog: { create: vi.fn() },
  },
}));
vi.mock('@/lib/reminders/queue', () => ({
  cancelReminders: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { takeMedicationAction } from '@/lib/medications/log-actions';

describe('takeMedicationAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('возвращает ошибку при отсутствии сессии', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const result = await takeMedicationAction('med-1', '2026-02-24T08:00:00');
    expect(result).toEqual({ success: false, error: 'Необходима авторизация' });
    expect(prisma.medication.findFirst).not.toHaveBeenCalled();
  });

  it('возвращает ошибку если лекарство не найдено', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'patient-1', email: 'p@test.ru', role: 'patient' },
      expires: '',
    });
    vi.mocked(prisma.medication.findFirst).mockResolvedValue(null);

    const result = await takeMedicationAction('med-unknown', '2026-02-24T08:00:00');
    expect(result).toEqual({ success: false, error: 'Лекарство не найдено' });
    expect(prisma.medicationLog.create).not.toHaveBeenCalled();
  });

  it('создаёт лог и возвращает success при найденном лекарстве', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'patient-1', email: 'p@test.ru', role: 'patient' },
      expires: '',
    });
    vi.mocked(prisma.medication.findFirst).mockResolvedValue({
      id: 'med-1',
      name: 'Метформин',
      patientId: 'patient-1',
      isActive: true,
    } as never);
    vi.mocked(prisma.medicationLog.create).mockResolvedValue({
      id: 'log-123',
      medicationId: 'med-1',
      scheduledAt: new Date(),
      actualAt: new Date(),
      status: 'taken',
      syncStatus: 'synced',
      createdAt: new Date(),
    } as never);

    const result = await takeMedicationAction('med-1', '2026-02-24T08:00:00');
    expect(result).toEqual({ success: true, logId: 'log-123' });
    expect(prisma.medicationLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          medicationId: 'med-1',
          status: 'taken',
          syncStatus: 'synced',
        }),
      })
    );
  });
});
