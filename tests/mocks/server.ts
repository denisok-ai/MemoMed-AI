/**
 * @file server.ts
 * @description MSW (Mock Service Worker) server for API mocking in tests
 * @created 2026-02-22
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
