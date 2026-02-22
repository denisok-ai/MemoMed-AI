/**
 * @file index.ts
 * @description Auth.js (NextAuth v5) instance export
 * @dependencies next-auth, @auth/prisma-adapter, auth.config.ts
 * @created 2026-02-22
 */

import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db/prisma';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
});
