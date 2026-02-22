/**
 * @file feed-item.tsx
 * @description Элемент ленты — MedTech 2025/2026:
 * glassmorphism карточки со статусными индикаторами
 * @created 2026-02-22
 */

import Link from 'next/link';
import type { FeedEvent } from '@/hooks/use-live-feed';
import { CheckIcon, AlertTriangleIcon } from '@/components/shared/nav-icons';

interface FeedItemProps {
  event: FeedEvent;
}

const colorMap = {
  green: {
    card: 'bg-emerald-50/80 border-emerald-200',
    icon: 'bg-gradient-to-br from-emerald-400 to-green-500',
    IconComp: CheckIcon,
    text: 'text-emerald-700',
    badge: 'bg-emerald-500 text-white',
    label: 'Вовремя',
  },
  yellow: {
    card: 'bg-amber-50/80 border-amber-200',
    icon: 'bg-gradient-to-br from-amber-400 to-orange-500',
    IconComp: AlertTriangleIcon,
    text: 'text-amber-700',
    badge: 'bg-amber-500 text-white',
    label: 'С опозданием',
  },
  red: {
    card: 'bg-red-50/80 border-red-200',
    icon: 'bg-gradient-to-br from-red-400 to-red-600',
    IconComp: AlertTriangleIcon,
    text: 'text-red-700',
    badge: 'bg-red-500 text-white',
    label: 'Пропущено',
  },
} as const;

function formatDelay(minutes: number | null): string {
  if (minutes === null) return '';
  if (minutes <= 0) return 'вовремя';
  if (minutes < 60) return `+${minutes} мин`;
  return `+${Math.floor(minutes / 60)}ч ${minutes % 60}мин`;
}

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

  const IconComp = style.IconComp;
  return (
    <Link
      href={`/patients/${event.patientId}`}
      className={`flex gap-4 p-4 min-h-[56px] rounded-2xl border backdrop-blur-sm
        ${style.card} transition-all hover:shadow-md block`}
      aria-label={`${event.patientName}: ${event.medicationName} — ${style.label}`}
    >
      <div
        className={`w-12 h-12 rounded-xl ${style.icon}
        flex items-center justify-center flex-shrink-0 shadow-sm`}
      >
        <IconComp className="w-6 h-6 text-white" />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className={`text-base font-bold ${style.text}`}>{event.patientName}</p>
            <p className="text-sm text-[#0D1B2A]">
              {event.medicationName}{' '}
              <span className="text-slate-500 font-normal">{event.dosage}</span>
            </p>
          </div>
          <span
            className={`text-sm font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${style.badge}`}
          >
            {delayText || style.label}
          </span>
        </div>
        <p className="text-sm text-slate-500">
          Запланировано на {event.scheduledTime} · {timeText}
        </p>
      </div>
    </Link>
  );
}
