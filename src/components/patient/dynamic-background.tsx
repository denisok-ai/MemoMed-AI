/**
 * @file dynamic-background.tsx
 * @description Динамический градиентный фон, меняющийся в зависимости от времени суток
 * Утро: сиреневый-синий, День: голубой-бирюзовый, Вечер: оранжевый-фиолетовый, Ночь: тёмно-синий
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
  morning: 'from-[#7e57c2] via-[#9575cd] to-[#42a5f5]',
  day: 'from-[#42a5f5] via-[#26c6da] to-[#4caf50]',
  evening: 'from-[#ff7043] via-[#ab47bc] to-[#7e57c2]',
  night: 'from-[#1a237e] via-[#283593] to-[#37474f]',
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

    // Обновляем фон раз в 5 минут
    const interval = setInterval(update, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`absolute inset-0 bg-gradient-to-br ${gradients[timeOfDay]} transition-all duration-[3000ms] ease-in-out`}
      aria-hidden="true"
    >
      {/* Декоративные круги для глубины */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

      {/* Приветствие */}
      <p
        className="absolute top-8 left-1/2 -translate-x-1/2 text-white/60 text-lg whitespace-nowrap"
        aria-label={userName ? `${greetings[timeOfDay]}, ${userName}` : greetings[timeOfDay]}
      >
        {greetings[timeOfDay]}{userName ? `, ${userName.split(' ')[0]}` : ''}
      </p>
    </div>
  );
}
