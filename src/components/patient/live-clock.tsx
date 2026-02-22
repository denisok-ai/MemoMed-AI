/**
 * @file live-clock.tsx
 * @description Живые часы — desktop-optimized, крупный шрифт, чёткая типографика
 * @created 2026-02-22
 */

'use client';

import { useState, useEffect } from 'react';

function formatDate(date: Date): string {
  return date.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    queueMicrotask(tick);
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!now) {
    return (
      <div className="text-center space-y-3">
        <div className="h-20 md:h-24 w-48 bg-white/10 rounded-2xl med-pulse mx-auto" />
        <div className="h-6 w-40 bg-white/10 rounded-xl med-pulse mx-auto" />
      </div>
    );
  }

  return (
    <div className="text-center space-y-2">
      <time
        dateTime={now.toISOString()}
        className="block text-7xl md:text-8xl font-black text-white tracking-tight
          font-[family-name:var(--font-montserrat)] tabular-nums leading-none
          drop-shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
        aria-live="polite"
        aria-label={`Текущее время: ${formatTime(now)}`}
      >
        {formatTime(now)}
      </time>
      <p className="text-lg md:text-xl text-white/50 capitalize font-medium tracking-wide">
        {formatDate(now)}
      </p>
    </div>
  );
}
