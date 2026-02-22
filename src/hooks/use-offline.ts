/**
 * @file use-offline.ts
 * @description Хук для отслеживания состояния сети (online/offline)
 * Возвращает true если нет подключения к интернету
 * @created 2026-02-22
 */

'use client';

import { useState, useEffect } from 'react';

/**
 * Определяет, находится ли пользователь в офлайн-режиме.
 * Возвращает false при SSR (сервер всегда "онлайн").
 */
export function useOffline(): boolean {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Инициализируем состояние только на клиенте
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOffline;
}
