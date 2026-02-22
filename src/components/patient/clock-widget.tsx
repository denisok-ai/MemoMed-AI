/**
 * @file clock-widget.tsx
 * @description Adaptive clock widget - displays current time with responsive font size (15% of screen width)
 * @created 2026-02-22
 */

'use client';

import { useEffect, useState } from 'react';

export function ClockWidget() {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    function update() {
      const now = new Date();
      setTime(now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
      setDate(
        now.toLocaleDateString('ru-RU', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })
      );
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center select-none" aria-live="polite" aria-label={`Время: ${time}`}>
      <div
        className="font-[family-name:var(--font-montserrat)] font-medium text-[#212121] leading-none"
        style={{ fontSize: 'clamp(3rem, 15vw, 8rem)' }}
      >
        {time}
      </div>
      <div className="text-lg text-slate-500 mt-2 capitalize">{date}</div>
    </div>
  );
}
