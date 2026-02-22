/**
 * @file live-feed.tsx
 * @description Живая лента событий — MedTech 2025/2026 style
 * @dependencies useLiveFeed, FeedItem
 * @created 2026-02-22
 */

'use client';

import { useLiveFeed } from '@/hooks/use-live-feed';
import { FeedItem } from './feed-item';
import { ActivityIcon } from '@/components/shared/nav-icons';

export function LiveFeed() {
  const { events, isConnected, connectionMode, error, refresh } = useLiveFeed();

  return (
    <div className="space-y-4">
      {/* Connection status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
            }`}
            aria-hidden="true"
          />
          <span className="text-sm font-semibold text-slate-500">
            {isConnected
              ? connectionMode === 'sse'
                ? 'Live-обновления'
                : 'Обновляется каждую минуту'
              : 'Нет подключения'}
          </span>
        </div>

        {connectionMode === 'polling' && (
          <button
            onClick={refresh}
            className="text-sm font-bold text-[#1565C0] hover:underline
              min-h-[48px] px-3 rounded-lg hover:bg-blue-50 transition-colors"
            aria-label="Обновить ленту"
          >
            Обновить
          </button>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="text-sm text-red-600 bg-red-50 rounded-xl p-3
          border border-red-100"
        >
          {error}
        </div>
      )}

      {events.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-500
            flex items-center justify-center mx-auto shadow-lg shadow-slate-200/50 med-float"
          >
            <ActivityIcon className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-[#0D1B2A]">
              {isConnected ? 'Ожидаем события...' : 'Подключение...'}
            </p>
            <p className="text-sm text-slate-500">
              События появятся, когда пациент примет лекарство
            </p>
          </div>
        </div>
      ) : (
        <ul
          className="space-y-3 med-stagger"
          role="list"
          aria-label="Лента событий приёма лекарств"
        >
          {events.map((event) => (
            <li key={event.logId}>
              <FeedItem event={event} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
