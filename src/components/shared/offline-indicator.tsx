/**
 * @file offline-indicator.tsx
 * @description Displays a banner when the user is offline
 * @dependencies useOffline hook
 * @created 2026-02-22
 */

'use client';

import { useOffline } from '@/hooks/use-offline';

export function OfflineIndicator() {
  const isOffline = useOffline();

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-50 bg-[#ffc107] text-[#212121] text-center py-3 px-4 text-lg font-medium"
    >
      📵 Нет подключения к интернету. Данные будут синхронизированы при восстановлении связи.
    </div>
  );
}
