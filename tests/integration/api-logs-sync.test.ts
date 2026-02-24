/**
 * @file api-logs-sync.test.ts
 * @description Integration-тест API POST /api/logs/sync
 * @created 2026-02-24
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/logs/sync/route';

const mockAuth = vi.fn();
const mockMedicationFindMany = vi.fn();
const mockLogCreate = vi.fn();
const mockCancelReminders = vi.fn();

vi.mock('@/lib/auth', () => ({
  auth: () => mockAuth(),
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    medication: {
      findMany: (...args: unknown[]) => mockMedicationFindMany(...args),
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

const validMedId = '11111111-1111-4111-8111-111111111111';

describe('POST /api/logs/sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMedicationFindMany.mockResolvedValue([{ id: validMedId }]);
    mockLogCreate.mockResolvedValue({});
    mockCancelReminders.mockResolvedValue(undefined);
  });

  it('возвращает 401 без авторизации', async () => {
    mockAuth.mockResolvedValue(null);
    const req = new Request('http://localhost/api/logs/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        logs: [
          {
            localId: 'local-1',
            medicationId: validMedId,
            scheduledAt: '2026-02-24T08:00:00.000Z',
            actualAt: '2026-02-24T08:05:00.000Z',
            status: 'taken',
            createdAt: '2026-02-24T08:05:00.000Z',
          },
        ],
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockLogCreate).not.toHaveBeenCalled();
  });

  it('возвращает 400 при пустом теле', async () => {
    mockAuth.mockResolvedValue(mockPatientSession);
    const req = new Request('http://localhost/api/logs/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('возвращает 400 при >100 записей', async () => {
    mockAuth.mockResolvedValue(mockPatientSession);
    const logs = Array.from({ length: 101 }, (_, i) => ({
      localId: `local-${i}`,
      medicationId: validMedId,
      scheduledAt: '2026-02-24T08:00:00.000Z',
      status: 'taken' as const,
      createdAt: '2026-02-24T08:00:00.000Z',
    }));
    const req = new Request('http://localhost/api/logs/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logs }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('синхронизирует логи и возвращает synced/failed', async () => {
    mockAuth.mockResolvedValue(mockPatientSession);
    const req = new Request('http://localhost/api/logs/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        logs: [
          {
            localId: 'local-1',
            medicationId: validMedId,
            scheduledAt: '2026-02-24T08:00:00.000Z',
            actualAt: '2026-02-24T08:05:00.000Z',
            status: 'taken',
            createdAt: '2026-02-24T08:05:00.000Z',
          },
        ],
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.synced).toContain('local-1');
    expect(data.data.failed).toEqual([]);
    expect(mockLogCreate).toHaveBeenCalled();
  });

  it('добавляет в failed логи с чужим medicationId', async () => {
    mockAuth.mockResolvedValue(mockPatientSession);
    mockMedicationFindMany.mockResolvedValue([{ id: validMedId }]);
    const foreignMedId = '22222222-2222-4222-8222-222222222222';
    const req = new Request('http://localhost/api/logs/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        logs: [
          {
            localId: 'local-1',
            medicationId: validMedId,
            scheduledAt: '2026-02-24T08:00:00.000Z',
            status: 'taken',
            createdAt: '2026-02-24T08:00:00.000Z',
          },
          {
            localId: 'local-2',
            medicationId: foreignMedId,
            scheduledAt: '2026-02-24T09:00:00.000Z',
            status: 'taken',
            createdAt: '2026-02-24T09:00:00.000Z',
          },
        ],
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.synced).toContain('local-1');
    expect(data.data.failed).toContain('local-2');
  });
});
