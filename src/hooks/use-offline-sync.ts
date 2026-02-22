/**
 * @file use-offline-sync.ts
 * @description Хук для автоматической синхронизации при восстановлении сети.
 * Запускает syncPendingLogs() каждый раз, когда соединение восстанавливается.
 * @dependencies sync.service, use-offline
 * @created 2026-02-22
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { syncPendingLogs, getPendingLogsCount, type SyncResult } from '@/lib/sync/sync.service';
import { useOffline } from './use-offline';

interface UseSyncState {
  pendingCount: number;
  isSyncing: boolean;
  lastSyncResult: SyncResult | null;
}

/**
 * Автоматически синхронизирует офлайн-данные при восстановлении сети.
 * Также предоставляет функцию ручной синхронизации.
 */
export function useOfflineSync(): UseSyncState & { syncNow: () => Promise<void> } {
  const isOffline = useOffline();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  const updatePendingCount = useCallback(async () => {
    try {
      const count = await getPendingLogsCount();
      setPendingCount(count);
    } catch {
      // IndexedDB может быть недоступна в некоторых браузерах/SSR
    }
  }, []);

  const syncNow = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const result = await syncPendingLogs();
      setLastSyncResult(result);
      await updatePendingCount();
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, updatePendingCount]);

  // Синхронизируем при восстановлении сети
  useEffect(() => {
    if (!isOffline && pendingCount > 0) {
      syncNow();
    }
  }, [isOffline, pendingCount, syncNow]);

  // Проверяем количество pending-логов при монтировании
  useEffect(() => {
    updatePendingCount();
  }, [updatePendingCount]);

  return { pendingCount, isSyncing, lastSyncResult, syncNow };
}
