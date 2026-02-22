/**
 * @file next-auth.d.ts
 * @description Расширение типов NextAuth.js для добавления полей id и role в сессию
 * @created 2026-02-22
 */

import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'patient' | 'relative' | 'admin';
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: 'patient' | 'relative' | 'admin';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'patient' | 'relative' | 'admin';
  }
}
