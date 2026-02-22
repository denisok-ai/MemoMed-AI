/**
 * @file middleware.ts
 * @description Next.js middleware: защита маршрутов, перенаправление на login/dashboard
 * Публичные маршруты: /, /login, /register, /privacy, /api/auth/*, /api/health
 * @dependencies next-auth
 * @created 2026-02-22
 */

import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/auth.config';

const { auth } = NextAuth(authConfig);

/** Маршруты, доступные без авторизации */
const PUBLIC_ROUTES = ['/', '/login', '/register', '/privacy'];

/** Префиксы API, не требующие авторизации */
const PUBLIC_API_PREFIXES = ['/api/auth', '/api/health'];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname);
  const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) => nextUrl.pathname.startsWith(prefix));

  // Статические ресурсы и публичные API — пропускаем
  if (isPublicApi) return;

  // Неавторизованный пользователь на закрытом маршруте → на login
  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL('/login', nextUrl));
  }

  // Авторизованный пользователь на странице входа/регистрации → на дашборд
  if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/register')) {
    const target = userRole === 'relative' ? '/feed' : '/dashboard';
    return Response.redirect(new URL(target, nextUrl));
  }

  // Авторизованный на главной → на дашборд
  if (isLoggedIn && nextUrl.pathname === '/') {
    const target = userRole === 'relative' ? '/feed' : '/dashboard';
    return Response.redirect(new URL(target, nextUrl));
  }
});

export const config = {
  // Исключаем статику Next.js и изображения
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/).*)'],
};
