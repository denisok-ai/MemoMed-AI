/**
 * @file auth.config.ts
 * @description Edge-safe конфиг NextAuth.js v5 — только callbacks и pages.
 * НЕ содержит Prisma, bcrypt и другие Node.js зависимости.
 * Используется в middleware (Edge Runtime) и в полном конфиге.
 * @created 2026-02-22
 */

import type { NextAuthConfig } from 'next-auth';

function getRoleHome(role?: string): string {
  if (role === 'relative') return '/feed';
  if (role === 'doctor') return '/doctor/dashboard';
  if (role === 'admin') return '/admin';
  return '/dashboard';
}

export const authConfig = {
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      // /dev-login всегда в publicPages — проверка ENABLE_DEV_LOGIN на странице (env в middleware только при сборке)
      const publicPages = ['/', '/login', '/register', '/privacy', '/dev-login'];
      const isOnPublicPage = publicPages.includes(nextUrl.pathname);
      const isPublicApi = ['/api/auth', '/api/health'].some((p) => nextUrl.pathname.startsWith(p));

      if (isPublicApi) return true;
      if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/register')) {
        const target = getRoleHome(auth?.user?.role);
        return Response.redirect(new URL(target, nextUrl));
      }
      if (isLoggedIn && nextUrl.pathname === '/') {
        const target = getRoleHome(auth?.user?.role);
        return Response.redirect(new URL(target, nextUrl));
      }
      if (!isLoggedIn && !isOnPublicPage) return false;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as 'patient' | 'relative' | 'doctor' | 'admin';
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'patient' | 'relative' | 'doctor' | 'admin';
      }
      return session;
    },
  },
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
} satisfies NextAuthConfig;
