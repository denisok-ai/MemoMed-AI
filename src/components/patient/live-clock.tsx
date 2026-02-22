/**
 * @file live-clock.tsx
 * @description Живые часы — клиентский компонент, обновляется каждую секунду
 * @created 2026-02-22
 */

'use client';

import { useState, useEffect } from 'react';

/** Форматирует дату в русской локали с днём недели */
function formatDate(date: Date): string {
  return date.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/** Форматирует время HH:MM:SS */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Устанавливаем начальное время только на клиенте (избегаем hydration mismatch)
    setNow(new Date());

    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!now) {
    return (
      <div className="text-center space-y-1">
        <div className="h-14 w-48 bg-white/20 rounded-2xl animate-pulse mx-auto" />
        <div className="h-5 w-36 bg-white/20 rounded-xl animate-pulse mx-auto" />
      </div>
    );
  }

  return (
    <div className="text-center space-y-1">
      <time
        dateTime={now.toISOString()}
        className="block text-5xl font-bold text-white font-[family-name:var(--font-montserrat)] tabular-nums"
        aria-live="polite"
        aria-label={`Текущее время: ${formatTime(now)}`}
      >
        {formatTime(now)}
      </time>
      <p className="text-lg text-white/80 capitalize">{formatDate(now)}</p>
    </div>
  );
}
