/**
 * @file handlers.ts
 * @description MSW request handlers for test mocking
 * @created 2026-02-22
 */

import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: { database: 'ok', redis: 'ok' },
    });
  }),
];
