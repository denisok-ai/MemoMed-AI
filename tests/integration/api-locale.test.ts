/**
 * @file api-locale.test.ts
 * @description Integration-тест API POST /api/locale
 * @created 2026-02-22
 */

import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/locale/route';

describe('POST /api/locale', () => {
  it('принимает ru и возвращает success', async () => {
    const req = new Request('http://localhost/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: 'ru' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ success: true, locale: 'ru' });
    expect(res.headers.get('set-cookie')).toContain('NEXT_LOCALE=ru');
  });

  it('принимает en и возвращает success', async () => {
    const req = new Request('http://localhost/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: 'en' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ success: true, locale: 'en' });
  });

  it('отклоняет невалидную локаль с 400', async () => {
    const req = new Request('http://localhost/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: 'de' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('отклоняет пустое тело с 400', async () => {
    const req = new Request('http://localhost/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
