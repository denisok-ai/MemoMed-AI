/**
 * @file index.ts
 * @description Полный конфиг NextAuth.js v5 с Credentials провайдером.
 * Содержит Node.js зависимости (bcrypt, Prisma) — НЕ использовать в middleware.
 * @dependencies next-auth, bcryptjs, prisma, auth.config.ts
 * @created 2026-02-22
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { authConfig } from './auth.config';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) return null;

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          name: null,
        };
      },
    }),
  ],
});
