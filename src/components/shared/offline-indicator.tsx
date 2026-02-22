/**
 * @file offline-indicator.tsx
 * @description Баннер об отсутствии интернета — MedTech 2025/2026 style
 * @created 2026-02-22
 */

'use client';

import { useState, useEffect } from 'react';
import { AlertTriangleIcon } from './nav-icons';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOffline(!navigator.onLine);
    queueMicrotask(updateOnlineStatus);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-0 left-0 right-0 z-50 bg-amber-500
        text-white text-center py-2.5 px-4 text-sm font-bold
        flex items-center justify-center gap-2
        shadow-lg shadow-amber-200/30"
    >
      <AlertTriangleIcon className="w-4 h-4" />
      Нет подключения к интернету · Данные сохраняются локально
    </div>
  );
}
