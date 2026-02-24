/**
 * @file api-feed-events.test.ts
 * @description Integration-тест API GET /api/feed/events
 * @created 2026-02-24
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/feed/events/route';

const mockAuth = vi.fn();
const mockConnectionFindMany = vi.fn();
const mockLogFindMany = vi.fn();

vi.mock('@/lib/auth', () => ({
  auth: () => mockAuth(),
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    connection: {
      findMany: (...args: unknown[]) => mockConnectionFindMany(...args),
    },
    medicationLog: {
      findMany: (...args: unknown[]) => mockLogFindMany(...args),
    },
  },
}));

const mockRelativeSession = {
  user: { id: 'relative-123', role: 'relative' as const, email: 'r@test.ru' },
};

describe('GET /api/feed/events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConnectionFindMany.mockResolvedValue([{ patientId: 'patient-1' }]);
    mockLogFindMany.mockResolvedValue([]);
  });

  it('возвращает 401 без авторизации', async () => {
    mockAuth.mockResolvedValue(null);
    const req = new Request('http://localhost/api/feed/events');
    const res = await GET(req);
    expect(res.status).toBe(401);
    expect(mockConnectionFindMany).not.toHaveBeenCalled();
  });

  it('возвращает пустой массив если нет подключённых пациентов', async () => {
    mockAuth.mockResolvedValue(mockRelativeSession);
    mockConnectionFindMany.mockResolvedValue([]);
    const req = new Request('http://localhost/api/feed/events');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toEqual([]);
    expect(data.hasMore).toBe(false);
    expect(mockLogFindMany).not.toHaveBeenCalled();
  });

  it('возвращает события и hasMore при наличии логов', async () => {
    mockAuth.mockResolvedValue(mockRelativeSession);
    const mockLogs = [
      {
        id: 'log-1',
        status: 'taken',
        actualAt: new Date('2026-02-24T08:05:00.000Z'),
        createdAt: new Date('2026-02-24T08:05:00.000Z'),
        medication: {
          name: 'Аспирин',
          dosage: '100мг',
          scheduledTime: '08:00',
          patientId: 'patient-1',
          patient: { profile: { fullName: 'Иван Иванов' } },
        },
      },
    ];
    mockLogFindMany.mockResolvedValue(mockLogs);
    const req = new Request('http://localhost/api/feed/events');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toHaveLength(1);
    expect(data.data[0].medicationName).toBe('Аспирин');
    expect(data.data[0].patientName).toBe('Иван Иванов');
    expect(data.data[0].color).toBeDefined();
  });
});
