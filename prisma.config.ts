/**
 * @file prisma.config.ts
 * @description Prisma 7+ configuration — schema path and conditional datasource URL
 * @dependencies prisma
 * @created 2026-02-22
 */

import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  ...(process.env.DATABASE_URL
    ? { datasource: { url: process.env.DATABASE_URL } }
    : {}),
});
