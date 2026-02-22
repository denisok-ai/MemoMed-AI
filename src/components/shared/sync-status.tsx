/**
 * @file sync-status.tsx
 * @description Индикатор статуса синхронизации офлайн-данных.
 * Отображается когда есть несинхронизированные логи.
 * @dependencies useOfflineSync
 * @created 2026-02-22
 */

'use client';

import { useOfflineSync } from '@/hooks/use-offline-sync';

export function SyncStatus() {
  const { pendingCount, isSyncing, syncNow } = useOfflineSync();

  // Ничего не показываем если нет pending-данных и нет синхронизации
  if (pendingCount === 0 && !isSyncing) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-between gap-3 bg-[#fff3e0] border border-[#ff9800]
        rounded-xl px-4 py-3 text-sm"
    >
      <div className="flex items-center gap-2">
        {isSyncing ? (
          <span
            className="w-4 h-4 border-2 border-[#ff9800] border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
        ) : (
          <span aria-hidden="true">⏳</span>
        )}
        <span className="text-[#e65100] font-medium">
          {isSyncing
            ? 'Синхронизация данных...'
            : `${pendingCount} запис${pendingCount === 1 ? 'ь' : 'и'} ожидают отправки`}
        </span>
      </div>

      {!isSyncing && pendingCount > 0 && (
        <button
          onClick={syncNow}
          className="text-[#ff9800] font-semibold hover:text-[#e65100] transition-colors
            min-h-[48px] px-2"
          aria-label="Синхронизировать сейчас"
        >
          Отправить
        </button>
      )}
    </div>
  );
}
