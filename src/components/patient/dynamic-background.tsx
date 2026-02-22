/**
 * @file dynamic-background.tsx
 * @description Динамический фон — только декоративный слой.
 * Приветствие вынесено в отдельный компонент для корректного позиционирования.
 * @created 2026-02-22
 */

'use client';

import { useEffect, useState } from 'react';

type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';

function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'day';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

const gradients: Record<TimeOfDay, string> = {
  morning: 'from-[#1565C0] via-[#1976D2] to-[#42A5F5]',
  day: 'from-[#0D47A1] via-[#1565C0] to-[#00838F]',
  evening: 'from-[#0D47A1] via-[#4A148C] to-[#BF360C]',
  night: 'from-[#0A1628] via-[#0D47A1] to-[#1A237E]',
};

const greetings: Record<TimeOfDay, string> = {
  morning: 'Доброе утро',
  day: 'Добрый день',
  evening: 'Добрый вечер',
  night: 'Доброй ночи',
};

interface DynamicBackgroundProps {
  userName?: string;
}

export function DynamicBackground({ userName }: DynamicBackgroundProps) {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');

  useEffect(() => {
    const update = () => setTimeOfDay(getTimeOfDay(new Date().getHours()));
    update();
    const interval = setInterval(update, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const greeting = `${greetings[timeOfDay]}${userName ? `, ${userName.split(' ')[0]}` : ''}`;

  return (
    <>
      {/* Decorative background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradients[timeOfDay]}
          transition-all duration-[3000ms] ease-in-out`}
        aria-hidden="true"
      >
        <div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full
          bg-white/[0.06] blur-3xl"
        />
        <div
          className="absolute bottom-10 -left-14 w-64 h-64 rounded-full
          bg-white/[0.04] blur-2xl"
        />
        <div
          className="absolute top-1/2 right-[20%] w-40 h-40 rounded-full
          bg-white/[0.03] blur-xl"
        />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* Greeting — relative positioned, inside the content flow */}
      <p
        className="relative z-10 text-white/60 text-lg md:text-xl
        font-semibold tracking-wide text-center"
      >
        {greeting}
      </p>
    </>
  );
}
