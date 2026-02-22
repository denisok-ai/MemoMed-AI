/**
 * @file sync.service.ts
 * @description Сервис синхронизации офлайн-логов с сервером.
 * Стратегия: Last Write Wins по полю createdAt.
 * Пакетная отправка до 50 записей за раз.
 * @created 2026-02-22
 */

import { getDB, type LocalMedicationLog } from '@/lib/db/indexeddb';

/** Результат синхронизации */
export interface SyncResult {
  syncedCount: number;
  failedCount: number;
  error?: string;
}

/**
 * Отправляет все pending-логи на сервер.
 * Обновляет syncStatus в IndexedDB на 'synced' после успеха.
 */
export async function syncPendingLogs(): Promise<SyncResult> {
  const db = getDB();

  const pendingLogs = await db.logs
    .where('syncStatus')
    .equals('pending')
    .limit(50)
    .toArray();

  if (pendingLogs.length === 0) {
    return { syncedCount: 0, failedCount: 0 };
  }

  try {
    const response = await fetch('/api/logs/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        logs: pendingLogs.map((log) => ({
          localId: log.localId,
          medicationId: log.medicationId,
          scheduledAt: log.scheduledAt,
          actualAt: log.actualAt ?? undefined,
          status: log.status,
          createdAt: log.createdAt,
        })),
      }),
    });

    if (!response.ok) {
      return { syncedCount: 0, failedCount: pendingLogs.length, error: 'Ошибка сервера' };
    }

    const data = (await response.json()) as { data: { synced: string[]; failed: string[] } };
    const { synced, failed } = data.data;

    // Обновляем syncStatus для успешно синхронизированных
    if (synced.length > 0) {
      await db.logs.bulkPut(
        pendingLogs
          .filter((log) => synced.includes(log.localId))
          .map((log) => ({ ...log, syncStatus: 'synced' as const }))
      );
    }

    return { syncedCount: synced.length, failedCount: failed.length };
  } catch {
    return { syncedCount: 0, failedCount: pendingLogs.length, error: 'Нет соединения' };
  }
}

/**
 * Сохраняет лог приёма в IndexedDB.
 * Используется когда пользователь оффлайн.
 */
export async function saveLogOffline(log: Omit<LocalMedicationLog, 'serverId'>): Promise<void> {
  const db = getDB();
  await db.logs.add({ ...log, serverId: null });
}

/**
 * Получает количество неотправленных логов
 */
export async function getPendingLogsCount(): Promise<number> {
  const db = getDB();
  return db.logs.where('syncStatus').equals('pending').count();
}
