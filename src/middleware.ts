/**
 * @file middleware.ts
 * @description Next.js middleware: авторизация через NextAuth (Edge Runtime safe).
 * Логика перенаправлений вынесена в authConfig.callbacks.authorized.
 * @dependencies next-auth, auth.config.ts (edge-safe)
 * @created 2026-02-22
 */

import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/|uploads/|sw\\.js|workbox-).*)',
  ],
};
