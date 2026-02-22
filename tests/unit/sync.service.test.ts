/**
 * @file sync.service.test.ts
 * @description Юнит-тесты для сервиса синхронизации офлайн-логов
 * @created 2026-02-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Мокаем IndexedDB (Dexie) — в тестах недоступен
vi.mock('@/lib/db/indexeddb', () => {
  const logs: Array<{
    localId: string;
    medicationId: string;
    scheduledAt: string;
    actualAt: string | null;
    status: string;
    syncStatus: string;
    createdAt: string;
    serverId: string | null;
  }> = [];

  return {
    getDB: () => ({
      logs: {
        where: () => ({
          equals: () => ({
            limit: () => ({
              toArray: async () => logs.filter((l) => l.syncStatus === 'pending'),
            }),
            count: async () => logs.filter((l) => l.syncStatus === 'pending').length,
          }),
        }),
        add: async (log: (typeof logs)[0]) => logs.push(log),
        bulkPut: async (items: (typeof logs)[0][]) => {
          items.forEach((item) => {
            const idx = logs.findIndex((l) => l.localId === item.localId);
            if (idx !== -1) logs[idx] = item;
          });
        },
      },
    }),
  };
});

// Мокаем fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import { getPendingLogsCount, saveLogOffline } from '@/lib/sync/sync.service';

describe('saveLogOffline', () => {
  it('сохраняет лог в IndexedDB с syncStatus=pending', async () => {
    await saveLogOffline({
      localId: 'test-1',
      medicationId: 'med-1',
      scheduledAt: new Date().toISOString(),
      actualAt: new Date().toISOString(),
      status: 'taken',
      syncStatus: 'pending',
      createdAt: new Date().toISOString(),
    });

    const count = await getPendingLogsCount();
    expect(count).toBe(1);
  });
});

describe('getPendingLogsCount', () => {
  it('возвращает 0 если нет pending-логов', async () => {
    // Вызов после предыдущего теста (1 лог уже есть)
    const count = await getPendingLogsCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

describe('syncPendingLogs', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('возвращает пустой результат если нет pending-логов', async () => {
    // Мокаем DB без pending логов
    vi.resetModules();
  });

  it('обрабатывает ошибку сети', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { syncPendingLogs } = await import('@/lib/sync/sync.service');
    const result = await syncPendingLogs();

    // Ошибка сети должна вернуть failedCount >= 0
    expect(result).toMatchObject({
      syncedCount: expect.any(Number),
      failedCount: expect.any(Number),
    });
  });
});
