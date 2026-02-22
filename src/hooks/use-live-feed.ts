/**
 * @file use-live-feed.ts
 * @description Хук для получения живой ленты событий через SSE.
 * Автоматически переключается на polling (60 сек) при проблемах с SSE.
 * @created 2026-02-22
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export type EventColor = 'green' | 'yellow' | 'red';

export interface FeedEvent {
  logId: string;
  status: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  actualAt: string | null;
  patientName: string;
  patientId: string;
  delayMinutes: number | null;
  color: EventColor;
  timestamp: number;
}

interface UseLiveFeedReturn {
  events: FeedEvent[];
  isConnected: boolean;
  connectionMode: 'sse' | 'polling' | 'disconnected';
  error: string | null;
  refresh: () => void;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  isLoadingMore: boolean;
}

/** Максимальное количество событий в ленте */
const MAX_EVENTS = 50;
/** Интервал polling-fallback в мс */
const POLLING_INTERVAL_MS = 60_000;
/** Количество попыток SSE перед переключением на polling */
const MAX_SSE_RETRIES = 3;

export function useLiveFeed(): UseLiveFeedReturn {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionMode, setConnectionMode] = useState<'sse' | 'polling' | 'disconnected'>(
    'disconnected'
  );
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sseRetriesRef = useRef(0);

  /** Добавляет новое событие в начало ленты */
  const addEvent = useCallback((event: FeedEvent) => {
    setEvents((prev) => {
      // Дедупликация по logId
      if (prev.some((e) => e.logId === event.logId)) return prev;
      return [event, ...prev].slice(0, MAX_EVENTS);
    });
  }, []);

  /** Загружает события через REST API (для polling-режима и начальной загрузки) */
  const fetchEvents = useCallback(async (before?: number) => {
    try {
      const url = before ? `/api/feed/events?before=${before}` : '/api/feed/events';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Ошибка загрузки');
      const data = (await res.json()) as { data: FeedEvent[]; hasMore?: boolean };
      if (before !== undefined) {
        setEvents((prev) => {
          const ids = new Set(prev.map((e) => e.logId));
          const newEvents = data.data.filter((e) => !ids.has(e.logId));
          return [...prev, ...newEvents];
        });
        setHasMore(data.hasMore ?? false);
      } else {
        setEvents(data.data.slice(0, MAX_EVENTS));
        setHasMore(data.hasMore ?? false);
        setConnectionMode('polling');
        setIsConnected(true);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка подключения');
      setConnectionMode('disconnected');
      setIsConnected(false);
    }
  }, []);

  /** Загружает более старые события (курсорная пагинация) */
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || events.length === 0) return;
    const oldest = events[events.length - 1];
    const beforeTs = oldest.timestamp;
    setIsLoadingMore(true);
    try {
      await fetchEvents(beforeTs);
    } finally {
      setIsLoadingMore(false);
    }
  }, [events, hasMore, isLoadingMore, fetchEvents]);

  /** Запускает polling-режим как fallback */
  const startPolling = useCallback(() => {
    if (pollingTimerRef.current) return;
    fetchEvents();
    pollingTimerRef.current = setInterval(fetchEvents, POLLING_INTERVAL_MS);
  }, [fetchEvents]);

  /** Подключается к SSE */
  const connectSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource('/api/feed');
    eventSourceRef.current = es;

    es.addEventListener('connected', () => {
      setIsConnected(true);
      setConnectionMode('sse');
      setError(null);
      sseRetriesRef.current = 0;
    });

    es.addEventListener('medication_log', (e: MessageEvent) => {
      try {
        const event = JSON.parse(e.data as string) as FeedEvent;
        addEvent(event);
      } catch {
        // Игнорируем некорректные данные
      }
    });

    es.addEventListener('reconnect', () => {
      es.close();
      // Переподключаемся через 1 секунду
      setTimeout(connectSSE, 1000);
    });

    es.addEventListener('error', () => {
      sseRetriesRef.current += 1;
      setIsConnected(false);

      if (sseRetriesRef.current >= MAX_SSE_RETRIES) {
        // Переключаемся на polling
        es.close();
        setConnectionMode('polling');
        startPolling();
      }
    });
  }, [addEvent, startPolling]);

  const refresh = useCallback(() => {
    if (connectionMode === 'polling') {
      fetchEvents();
    }
  }, [connectionMode, fetchEvents]);

  useEffect(() => {
    // Начальная загрузка событий (лента показывает историю за 7 дней)
    fetchEvents();

    // Проверяем поддержку SSE
    if (typeof EventSource !== 'undefined') {
      connectSSE();
    } else {
      startPolling();
    }

    return () => {
      eventSourceRef.current?.close();
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
    };
  }, [connectSSE, startPolling, fetchEvents]);

  return { events, isConnected, connectionMode, error, refresh, loadMore, hasMore, isLoadingMore };
}
