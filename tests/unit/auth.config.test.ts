/**
 * @file auth.config.test.ts
 * @description Unit-тесты для authConfig callbacks
 * @created 2026-02-24
 */

import { describe, it, expect } from 'vitest';
import { authConfig } from '@/lib/auth/auth.config';

describe('authConfig.callbacks', () => {
  describe('authorized', () => {
    const authorized = authConfig.callbacks!.authorized!;

    it('возвращает true для публичных API', async () => {
      const result = await authorized({
        auth: null,
        request: { nextUrl: new URL('http://localhost/api/health') },
      } as never);
      expect(result).toBe(true);
    });

    it('возвращает true для публичных страниц без авторизации', async () => {
      const result = await authorized({
        auth: null,
        request: { nextUrl: new URL('http://localhost/login') },
      } as never);
      expect(result).toBe(true);
    });

    it('возвращает false для защищённой страницы без авторизации', async () => {
      const result = await authorized({
        auth: null,
        request: { nextUrl: new URL('http://localhost/dashboard') },
      } as never);
      expect(result).toBe(false);
    });

    it('редиректит на /feed для роли relative на /login', async () => {
      const result = await authorized({
        auth: { user: { role: 'relative' } },
        request: { nextUrl: new URL('http://localhost/login') },
      } as never);
      expect(result).toBeInstanceOf(Response);
      expect((result as Response).status).toBe(302);
      expect((result as Response).headers.get('location')).toContain('/feed');
    });

    it('редиректит на /admin для роли admin на /', async () => {
      const result = await authorized({
        auth: { user: { role: 'admin' } },
        request: { nextUrl: new URL('http://localhost/') },
      } as never);
      expect(result).toBeInstanceOf(Response);
      expect((result as Response).headers.get('location')).toContain('/admin');
    });
  });

  describe('jwt', () => {
    const jwt = authConfig.callbacks!.jwt!;

    it('добавляет id и role при наличии user', async () => {
      const token = {};
      const result = await jwt({
        token,
        user: { id: 'u1', role: 'patient' },
      } as never);
      expect(result).toMatchObject({ id: 'u1', role: 'patient' });
    });

    it('возвращает token без изменений при отсутствии user', async () => {
      const token = { id: 'u1' };
      const result = await jwt({ token, user: undefined } as never);
      expect(result).toBe(token);
    });
  });

  describe('session', () => {
    const session = authConfig.callbacks!.session!;

    it('добавляет id и role в session.user', async () => {
      const sess = { user: {} };
      const result = await session({
        session: sess,
        token: { id: 'u1', role: 'patient' },
      } as never);
      expect(result?.user).toMatchObject({ id: 'u1', role: 'patient' });
    });
  });
});
