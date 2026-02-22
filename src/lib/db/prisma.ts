/**
 * @file prisma.ts
 * @description Singleton Prisma client (Prisma 7+ c PrismaPg адаптером).
 * Проверяет наличие DATABASE_URL при создании.
 * @dependencies @prisma/client, @prisma/adapter-pg, pg
 * @created 2026-02-22
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL не задана. Скопируйте .env.example в .env и заполните значение.');
  }

  const pool = new Pool({ connectionString, max: 10 });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
