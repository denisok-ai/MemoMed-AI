/**
 * @file index.ts
 * @description Экспорт экземпляра NextAuth.js v5
 * Используем JWT-стратегию с Credentials — адаптер БД не нужен
 * @dependencies next-auth, auth.config.ts
 * @created 2026-02-22
 */

import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
