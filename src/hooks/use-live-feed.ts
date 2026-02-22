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
}

/** Максимальное количество событий в ленте */
const MAX_EVENTS = 50;
/** Интервал polling-fallback в мс */
const POLLING_INTERVAL_MS = 60_000;
/** Количество попыток SSE перед переключением на polling */
const MAX_SSE_RETRIES = 3;

export function useLiveFeed(): UseLiveFeedReturn {
  const [events, setEvents] = useState<FeedEvent[]>([]);
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

  /** Загружает события через REST API (для polling-режима) */
  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/feed/events');
      if (!res.ok) throw new Error('Ошибка загрузки');
      const data = (await res.json()) as { data: FeedEvent[] };
      setEvents(data.data.slice(0, MAX_EVENTS));
      setConnectionMode('polling');
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка подключения');
      setConnectionMode('disconnected');
      setIsConnected(false);
    }
  }, []);

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
  }, [connectSSE, startPolling]);

  return { events, isConnected, connectionMode, error, refresh };
}
