/**
 * @file feed-item.tsx
 * @description Элемент живой ленты: событие приёма лекарства с цветовой индикацией.
 * Зелёный — вовремя, жёлтый — опоздание до 30 мин, красный — пропуск/опоздание >30 мин.
 * @created 2026-02-22
 */

import type { FeedEvent } from '@/hooks/use-live-feed';

interface FeedItemProps {
  event: FeedEvent;
}

const colorMap = {
  green: {
    bg: 'bg-[#e8f5e9]',
    border: 'border-[#4caf50]',
    icon: '✅',
    text: 'text-[#2e7d32]',
    badge: 'bg-[#4caf50] text-white',
    label: 'Вовремя',
  },
  yellow: {
    bg: 'bg-[#fff3e0]',
    border: 'border-[#ff9800]',
    icon: '⚠️',
    text: 'text-[#e65100]',
    badge: 'bg-[#ff9800] text-white',
    label: 'С опозданием',
  },
  red: {
    bg: 'bg-[#ffebee]',
    border: 'border-[#f44336]',
    icon: '❌',
    text: 'text-[#c62828]',
    badge: 'bg-[#f44336] text-white',
    label: 'Пропущено',
  },
} as const;

/** Форматирует задержку в читаемый текст */
function formatDelay(minutes: number | null): string {
  if (minutes === null) return '';
  if (minutes <= 0) return 'вовремя';
  if (minutes < 60) return `+${minutes} мин`;
  return `+${Math.floor(minutes / 60)}ч ${minutes % 60}мин`;
}

/** Форматирует timestamp в «сегодня в ЧЧ:ММ» или «вчера в ЧЧ:ММ» */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  if (isToday) return `Сегодня в ${time}`;
  if (isYesterday) return `Вчера в ${time}`;
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) + ` в ${time}`;
}

export function FeedItem({ event }: FeedItemProps) {
  const style = colorMap[event.color];
  const delayText = formatDelay(event.delayMinutes);
  const timeText = formatTimestamp(event.timestamp);

  return (
    <article
      className={`flex gap-4 p-4 rounded-2xl border ${style.bg} ${style.border}`}
      aria-label={`${event.patientName}: ${event.medicationName} — ${style.label}`}
    >
      {/* Иконка статуса */}
      <span className="text-2xl flex-shrink-0 mt-0.5" aria-hidden="true">
        {style.icon}
      </span>

      {/* Основная информация */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className={`text-base font-semibold ${style.text}`}>
              {event.patientName}
            </p>
            <p className="text-base text-[#212121]">
              {event.medicationName}{' '}
              <span className="text-[#757575] font-normal">{event.dosage}</span>
            </p>
          </div>
          <span
            className={`text-sm font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${style.badge}`}
          >
            {delayText || style.label}
          </span>
        </div>
        <p className="text-sm text-[#9e9e9e]">
          Запланировано на {event.scheduledTime} · {timeText}
        </p>
      </div>
    </article>
  );
}
