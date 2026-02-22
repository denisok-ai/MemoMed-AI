/**
 * @file route.ts
 * @description NextAuth.js v5 route handler
 * @dependencies next-auth, auth/index.ts
 * @created 2026-02-22
 */

import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
