/**
 * @file prisma.ts
 * @description Prisma client instance for worker service (Prisma 7+ with pg adapter)
 * @created 2026-02-22
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
  log: ['error'],
});

process.on('beforeExit', async () => {
  await prisma.$disconnect();
  await pool.end();
});
