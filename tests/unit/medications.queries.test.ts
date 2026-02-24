/**
 * @file medications.queries.test.ts
 * @description Unit-тесты для getNextMedication — логика выбора ближайшего лекарства
 * @created 2026-02-24
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    medication: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/db/prisma';
import { getNextMedication } from '@/lib/medications/queries';

function createMed(id: string, scheduledTime: string, name: string, dosage: string) {
  return {
    id,
    name,
    dosage,
    scheduledTime,
    instruction: null,
    patientId: 'p1',
    photoUrl: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    archivedAt: null,
  };
}

describe('getNextMedication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('возвращает null при пустом списке лекарств', async () => {
    vi.mocked(prisma.medication.findMany).mockResolvedValue([]);
    const result = await getNextMedication('patient-1');
    expect(result).toBeNull();
  });

  it('возвращает просроченное лекарство (в пределах 30 мин)', async () => {
    vi.setSystemTime(new Date(2026, 1, 24, 8, 15, 0)); // 08:15
    vi.mocked(prisma.medication.findMany).mockResolvedValue([
      createMed('m1', '08:00', 'Метформин', '500 мг'),
      createMed('m2', '09:00', 'Амлодипин', '5 мг'),
    ]);
    const result = await getNextMedication('p1');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('m1');
    expect(result!.name).toBe('Метформин');
    expect(result!.isOverdue).toBe(true);
    expect(result!.minutesUntil).toBe(-15);
  });

  it('возвращает ближайшее предстоящее лекарство', async () => {
    vi.setSystemTime(new Date(2026, 1, 24, 7, 30, 0)); // 07:30
    vi.mocked(prisma.medication.findMany).mockResolvedValue([
      createMed('m1', '08:00', 'Метформин', '500 мг'),
      createMed('m2', '12:00', 'Амлодипин', '5 мг'),
    ]);
    const result = await getNextMedication('p1');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('m1');
    expect(result!.isOverdue).toBe(false);
    expect(result!.minutesUntil).toBe(30);
  });

  it('при всех приёмах за день возвращает первый на завтра', async () => {
    vi.setSystemTime(new Date(2026, 1, 24, 23, 0, 0)); // 23:00
    vi.mocked(prisma.medication.findMany).mockResolvedValue([
      createMed('m1', '08:00', 'Метформин', '500 мг'),
    ]);
    const result = await getNextMedication('p1');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('m1');
    expect(result!.minutesUntil).toBe(9 * 60); // 23:00 -> 08:00 = 9 часов
  });
});
