/**
 * @file offline-indicator.tsx
 * @description Баннер об отсутствии интернета — отображается при offline-режиме
 * @created 2026-02-22
 */

'use client';

import { useState, useEffect } from 'react';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOffline(!navigator.onLine);

    // Проверяем начальное состояние
    setIsOffline(!navigator.onLine);

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
      className="fixed top-0 left-0 right-0 z-50 bg-[#ff9800] text-white
        text-center py-2 px-4 text-base font-medium"
    >
      📴 Нет подключения к интернету · Данные сохраняются локально
    </div>
  );
}
