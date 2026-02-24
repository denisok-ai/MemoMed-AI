/**
 * @file api-medications.test.ts
 * @description Integration-тест API GET/POST /api/medications
 * @created 2026-02-24
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/medications/route';

const mockAuth = vi.fn();
const mockFindMany = vi.fn();
const mockCreate = vi.fn();
const mockScheduleReminders = vi.fn();

vi.mock('@/lib/auth', () => ({
  auth: () => mockAuth(),
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    medication: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));

vi.mock('@/lib/reminders/queue', () => ({
  scheduleReminders: (...args: unknown[]) => mockScheduleReminders(...args),
}));

const mockPatientSession = {
  user: {
    id: 'patient-123',
    role: 'patient' as const,
    email: 'patient@test.ru',
  },
};

describe('GET /api/medications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindMany.mockResolvedValue([]);
  });

  it('возвращает 401 без авторизации', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain('авторизация');
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it('возвращает 403 для роли не patient', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'rel-1', role: 'relative', email: 'rel@test.ru' },
    });
    const res = await GET();
    expect(res.status).toBe(403);
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it('возвращает 200 и список лекарств для пациента', async () => {
    mockAuth.mockResolvedValue(mockPatientSession);
    const mockMeds = [
      {
        id: 'med-1',
        name: 'Аспирин',
        dosage: '100мг',
        scheduledTime: '08:00',
        isActive: true,
      },
    ];
    mockFindMany.mockResolvedValue(mockMeds);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toEqual(mockMeds);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { patientId: 'patient-123', isActive: true },
      })
    );
  });
});

describe('POST /api/medications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockScheduleReminders.mockResolvedValue(undefined);
  });

  it('возвращает 401 без авторизации', async () => {
    mockAuth.mockResolvedValue(null);
    const req = new Request('http://localhost/api/medications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Аспирин',
        dosage: '100мг',
        instruction: '1 таблетка',
        scheduledTime: '08:00',
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('возвращает 400 при некорректном теле', async () => {
    mockAuth.mockResolvedValue(mockPatientSession);
    const req = new Request('http://localhost/api/medications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('возвращает 400 при невалидных данных (отсутствует name)', async () => {
    mockAuth.mockResolvedValue(mockPatientSession);
    const req = new Request('http://localhost/api/medications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dosage: '100мг',
        instruction: '1 таблетка',
        scheduledTime: '08:00',
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('создаёт лекарство и возвращает 201 при валидных данных', async () => {
    mockAuth.mockResolvedValue(mockPatientSession);
    const createdMed = {
      id: 'med-new',
      patientId: 'patient-123',
      name: 'Аспирин',
      dosage: '100мг',
      scheduledTime: '08:00',
    };
    mockCreate.mockResolvedValue(createdMed);
    const req = new Request('http://localhost/api/medications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Аспирин',
        dosage: '100мг',
        instruction: '1 таблетка утром',
        scheduledTime: '08:00',
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.data.id).toBe('med-new');
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Аспирин',
          dosage: '100мг',
          patientId: 'patient-123',
        }),
      })
    );
    expect(mockScheduleReminders).toHaveBeenCalledWith(
      'med-new',
      'patient-123',
      'Аспирин',
      '100мг',
      '08:00'
    );
  });
});
