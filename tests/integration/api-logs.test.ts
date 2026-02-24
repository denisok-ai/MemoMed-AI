/**
 * @file api-logs.test.ts
 * @description Integration-тест API POST /api/logs
 * @created 2026-02-24
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/logs/route';

const mockAuth = vi.fn();
const mockMedicationFindFirst = vi.fn();
const mockLogCreate = vi.fn();
const mockCancelReminders = vi.fn();

vi.mock('@/lib/auth', () => ({
  auth: () => mockAuth(),
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    medication: {
      findFirst: (...args: unknown[]) => mockMedicationFindFirst(...args),
    },
    medicationLog: {
      create: (...args: unknown[]) => mockLogCreate(...args),
    },
  },
}));

vi.mock('@/lib/reminders/queue', () => ({
  cancelReminders: (...args: unknown[]) => mockCancelReminders(...args),
}));

const mockPatientSession = {
  user: { id: 'patient-123', role: 'patient' as const, email: 'p@test.ru' },
};

describe('POST /api/logs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCancelReminders.mockResolvedValue(undefined);
  });

  it('возвращает 401 без авторизации', async () => {
    mockAuth.mockResolvedValue(null);
    const req = new Request('http://localhost/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        medicationId: '11111111-1111-4111-8111-111111111111',
        scheduledAt: '2026-02-24T08:00:00.000Z',
        status: 'taken',
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockLogCreate).not.toHaveBeenCalled();
  });

  it('возвращает 400 при некорректном теле', async () => {
    mockAuth.mockResolvedValue(mockPatientSession);
    const req = new Request('http://localhost/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('возвращает 400 при невалидном medicationId', async () => {
    mockAuth.mockResolvedValue(mockPatientSession);
    const req = new Request('http://localhost/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        medicationId: 'not-uuid',
        scheduledAt: '2026-02-24T08:00:00.000Z',
        status: 'taken',
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('возвращает 404 если лекарство не принадлежит пациенту', async () => {
    mockAuth.mockResolvedValue(mockPatientSession);
    mockMedicationFindFirst.mockResolvedValue(null);
    const req = new Request('http://localhost/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        medicationId: '11111111-1111-4111-8111-111111111111',
        scheduledAt: '2026-02-24T08:00:00.000Z',
        status: 'taken',
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
    expect(mockLogCreate).not.toHaveBeenCalled();
  });

  it('создаёт лог и возвращает 201 при валидных данных', async () => {
    mockAuth.mockResolvedValue(mockPatientSession);
    mockMedicationFindFirst.mockResolvedValue({
      id: '11111111-1111-4111-8111-111111111111',
      patientId: 'patient-123',
    });
    mockLogCreate.mockResolvedValue({ id: 'log-1' });
    const req = new Request('http://localhost/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        medicationId: '11111111-1111-4111-8111-111111111111',
        scheduledAt: '2026-02-24T08:00:00.000Z',
        status: 'taken',
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.data.id).toBe('log-1');
    expect(mockLogCreate).toHaveBeenCalled();
    expect(mockCancelReminders).toHaveBeenCalled();
  });
});
