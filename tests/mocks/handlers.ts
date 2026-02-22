/**
 * @file handlers.ts
 * @description MSW request handlers for test mocking
 * @created 2026-02-22
 */

import { http, HttpResponse } from 'msw';

export const handlers = [
  /** Статус сервиса */
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: { database: 'ok', redis: 'ok' },
    });
  }),

  /** Синхронизация офлайн-логов */
  http.post('/api/logs/sync', () => {
    return HttpResponse.json({ synced: 0, skipped: 0 });
  }),

  /** Отправка отзыва о лекарстве */
  http.post('/api/feedback', () => {
    return HttpResponse.json({ success: true });
  }),

  /** Переключение языка интерфейса */
  http.post('/api/locale', async ({ request }) => {
    const body = (await request.json()) as { locale?: string };
    const validLocales = ['ru', 'en'];
    if (!body.locale || !validLocales.includes(body.locale)) {
      return HttpResponse.json({ error: 'Unsupported locale' }, { status: 400 });
    }
    return HttpResponse.json({ success: true, locale: body.locale });
  }),

  /** Список лекарств */
  http.get('/api/medications', () => {
    return HttpResponse.json([]);
  }),

  /** Аналитика AI */
  http.get('/api/analysis/:patientId', () => {
    return HttpResponse.json({ summary: '', insights: [] });
  }),

  /** Статистика пациента */
  http.get('/api/stats/:patientId', () => {
    return HttpResponse.json({
      discipline: 0,
      streak: 0,
      avgDelayMin: null,
      total: 0,
      taken: 0,
      missed: 0,
    });
  }),
];
