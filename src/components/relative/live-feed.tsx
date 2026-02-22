/**
 * @file live-feed.tsx
 * @description Живая лента событий для родственника с SSE и polling-fallback.
 * Показывает статус подключения и список событий в реальном времени.
 * @dependencies useLiveFeed, FeedItem
 * @created 2026-02-22
 */

'use client';

import { useLiveFeed } from '@/hooks/use-live-feed';
import { FeedItem } from './feed-item';

export function LiveFeed() {
  const { events, isConnected, connectionMode, error, refresh } = useLiveFeed();

  return (
    <div className="space-y-4">
      {/* Строка статуса подключения */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isConnected ? 'bg-[#4caf50] animate-pulse' : 'bg-[#9e9e9e]'
            }`}
            aria-hidden="true"
          />
          <span className="text-sm text-[#757575]">
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
            className="text-sm text-[#7e57c2] hover:underline min-h-[44px] px-2"
            aria-label="Обновить ленту"
          >
            Обновить
          </button>
        )}
      </div>

      {/* Ошибка */}
      {error && (
        <div role="alert" className="text-sm text-[#f44336] bg-[#ffebee] rounded-xl p-3">
          ⚠️ {error}
        </div>
      )}

      {/* Список событий */}
      {events.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <p className="text-4xl" aria-hidden="true">
            {isConnected ? '👀' : '📡'}
          </p>
          <p className="text-lg text-[#757575]">
            {isConnected ? 'Ожидаем события...' : 'Подключение...'}
          </p>
          <p className="text-sm text-[#9e9e9e]">
            События появятся, когда пациент примет лекарство
          </p>
        </div>
      ) : (
        <ul className="space-y-3" role="list" aria-label="Лента событий приёма лекарств">
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
