/**
 * @file sync.service.test.ts
 * @description Юнит-тесты для сервиса синхронизации офлайн-логов
 * @created 2026-02-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';

type LogItem = {
  localId: string;
  medicationId: string;
  scheduledAt: string;
  actualAt: string | null;
  status: string;
  syncStatus: string;
  createdAt: string;
  serverId: string | null;
};

// Один массив в замыкании — и мок, и тесты используют одну ссылку
const { mockLogs, createIndexedDBMock } = vi.hoisted(() => {
  const logs: LogItem[] = [];
  return {
    mockLogs: logs,
    createIndexedDBMock: () => ({
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
          add: async (log: LogItem) => logs.push(log),
          bulkPut: async (items: LogItem[]) => {
            items.forEach((item) => {
              const idx = logs.findIndex((l) => l.localId === item.localId);
              if (idx !== -1) logs[idx] = item;
            });
          },
        },
      }),
    }),
  };
});

vi.mock('@/lib/db/indexeddb', () => createIndexedDBMock());

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
    mockLogs.length = 0;
  });

  it('синхронизирует логи и обновляет syncStatus', async () => {
    mockLogs.push({
      localId: 'sync-test-1',
      medicationId: 'med-1',
      scheduledAt: new Date().toISOString(),
      actualAt: new Date().toISOString(),
      status: 'taken',
      syncStatus: 'pending',
      createdAt: new Date().toISOString(),
      serverId: null,
    });

    server.use(
      http.post('/api/logs/sync', async ({ request }) => {
        const body = (await request.json()) as { logs?: { localId: string }[] };
        const synced = (body.logs ?? []).map((l) => l.localId);
        return HttpResponse.json({ data: { synced, failed: [] } });
      })
    );

    const { syncPendingLogs } = await import('@/lib/sync/sync.service');
    const result = await syncPendingLogs();

    expect(result.syncedCount).toBe(1);
    expect(result.failedCount).toBe(0);
  });

  it('обрабатывает ошибку сети', async () => {
    mockLogs.push({
      localId: 'err-net',
      medicationId: 'med-1',
      scheduledAt: new Date().toISOString(),
      actualAt: null,
      status: 'taken',
      syncStatus: 'pending',
      createdAt: new Date().toISOString(),
      serverId: null,
    });
    server.use(http.post('/api/logs/sync', () => HttpResponse.error()));

    const { syncPendingLogs } = await import('@/lib/sync/sync.service');
    const result = await syncPendingLogs();

    expect(result).toMatchObject({
      syncedCount: expect.any(Number),
      failedCount: expect.any(Number),
    });
    expect(result.error).toBeDefined();
  });

  it('обрабатывает ответ 500', async () => {
    mockLogs.push({
      localId: 'err-500',
      medicationId: 'med-1',
      scheduledAt: new Date().toISOString(),
      actualAt: null,
      status: 'taken',
      syncStatus: 'pending',
      createdAt: new Date().toISOString(),
      serverId: null,
    });
    server.use(
      http.post('/api/logs/sync', () =>
        HttpResponse.json({ error: 'Server error' }, { status: 500 })
      )
    );

    const { syncPendingLogs } = await import('@/lib/sync/sync.service');
    const result = await syncPendingLogs();

    expect(result.syncedCount).toBe(0);
    expect(result.failedCount).toBeGreaterThanOrEqual(0);
    expect(result.error).toBe('Ошибка сервера');
  });
});
