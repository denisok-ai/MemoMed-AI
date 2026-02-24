/**
 * @file medications.actions.test.ts
 * @description Unit-тесты для createMedicationAction, updateMedicationAction, deleteMedicationAction
 * @created 2026-02-24
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    medication: { create: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
  },
}));
vi.mock('@/lib/reminders/queue', () => ({
  scheduleReminders: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import {
  createMedicationAction,
  updateMedicationAction,
  deleteMedicationAction,
} from '@/lib/medications/actions';

describe('createMedicationAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('возвращает ошибку при отсутствии сессии', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const formData = new FormData();
    formData.set('name', 'Метформин');
    formData.set('dosage', '500 мг');
    formData.set('scheduledTime', '08:00');

    const result = await createMedicationAction({}, formData);
    expect(result).toEqual({ error: 'Доступ запрещён' });
  });

  it('возвращает ошибку для роли не patient', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'u1', email: 'r@test.ru', role: 'relative' },
      expires: '',
    });
    const formData = new FormData();
    formData.set('name', 'Метформин');
    formData.set('dosage', '500 мг');
    formData.set('scheduledTime', '08:00');

    const result = await createMedicationAction({}, formData);
    expect(result).toEqual({ error: 'Доступ запрещён' });
  });

  it('возвращает ошибку при невалидных данных', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'p1', email: 'p@test.ru', role: 'patient' },
      expires: '',
    });
    const formData = new FormData();
    formData.set('name', ''); // пустое имя
    formData.set('dosage', '500 мг');
    formData.set('scheduledTime', '08:00');

    const result = await createMedicationAction({}, formData);
    expect(result).toHaveProperty('error');
    expect(result.error).not.toBe('Доступ запрещён');
  });

  it('создаёт лекарство и редиректит при валидных данных', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'p1', email: 'p@test.ru', role: 'patient' },
      expires: '',
    });
    vi.mocked(prisma.medication.create).mockResolvedValue({
      id: 'med-1',
      name: 'Метформин',
      dosage: '500 мг',
      patientId: 'p1',
      scheduledTime: '08:00',
      instruction: null,
      isActive: true,
      photoUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      archivedAt: null,
    } as never);

    const formData = new FormData();
    formData.set('name', 'Метформин');
    formData.set('dosage', '500 мг');
    formData.set('scheduledTime', '08:00');

    await expect(createMedicationAction({}, formData)).rejects.toThrow('REDIRECT:/medications');
    expect(prisma.medication.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Метформин',
          dosage: '500 мг',
          scheduledTime: '08:00',
          patientId: 'p1',
        }),
      })
    );
  });
});

describe('updateMedicationAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('возвращает ошибку при отсутствии сессии', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const formData = new FormData();
    formData.set('name', 'Метформин');
    formData.set('dosage', '1000 мг');
    formData.set('scheduledTime', '08:00');

    const result = await updateMedicationAction('med-1', {}, formData);
    expect(result).toEqual({ error: 'Доступ запрещён' });
  });

  it('возвращает ошибку если лекарство не найдено', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'p1', email: 'p@test.ru', role: 'patient' },
      expires: '',
    });
    vi.mocked(prisma.medication.findFirst).mockResolvedValue(null);

    const formData = new FormData();
    formData.set('name', 'Метформин');
    formData.set('dosage', '1000 мг');
    formData.set('scheduledTime', '08:00');

    const result = await updateMedicationAction('med-unknown', {}, formData);
    expect(result).toEqual({ error: 'Лекарство не найдено' });
  });

  it('обновляет и редиректит при успехе', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'p1', email: 'p@test.ru', role: 'patient' },
      expires: '',
    });
    vi.mocked(prisma.medication.findFirst).mockResolvedValue({
      id: 'med-1',
      patientId: 'p1',
      isActive: true,
    } as never);
    vi.mocked(prisma.medication.update).mockResolvedValue({} as never);

    const formData = new FormData();
    formData.set('name', 'Метформин');
    formData.set('dosage', '1000 мг');
    formData.set('scheduledTime', '08:00');

    await expect(updateMedicationAction('med-1', {}, formData)).rejects.toThrow(
      'REDIRECT:/medications'
    );
    expect(prisma.medication.update).toHaveBeenCalled();
  });
});

describe('deleteMedicationAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('ничего не делает при отсутствии сессии', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    await deleteMedicationAction('med-1');
    expect(prisma.medication.update).not.toHaveBeenCalled();
  });

  it('ничего не делает если лекарство не найдено', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'p1', email: 'p@test.ru', role: 'patient' },
      expires: '',
    });
    vi.mocked(prisma.medication.findFirst).mockResolvedValue(null);

    await deleteMedicationAction('med-unknown');
    expect(prisma.medication.update).not.toHaveBeenCalled();
  });

  it('архивирует лекарство при успехе', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'p1', email: 'p@test.ru', role: 'patient' },
      expires: '',
    });
    vi.mocked(prisma.medication.findFirst).mockResolvedValue({
      id: 'med-1',
      patientId: 'p1',
      isActive: true,
    } as never);
    vi.mocked(prisma.medication.update).mockResolvedValue({} as never);

    await deleteMedicationAction('med-1');
    expect(prisma.medication.update).toHaveBeenCalledWith({
      where: { id: 'med-1' },
      data: expect.objectContaining({
        isActive: false,
        archivedAt: expect.any(Date),
      }),
    });
  });
});
