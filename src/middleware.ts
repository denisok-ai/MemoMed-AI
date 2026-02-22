/**
 * @file middleware.ts
 * @description Next.js middleware for JWT authentication on protected routes
 * @dependencies next-auth, auth.config.ts
 * @created 2026-02-22
 */

import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;

  const publicPaths = ['/', '/login', '/register', '/api/auth'];
  const isPublic = publicPaths.some((path) => nextUrl.pathname.startsWith(path));

  if (!isLoggedIn && !isPublic) {
    return Response.redirect(new URL('/login', nextUrl));
  }
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
