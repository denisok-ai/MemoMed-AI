/**
 * @file prisma.config.ts
 * @description Prisma 7+ configuration with pg adapter for database connection
 * @dependencies prisma, @prisma/adapter-pg, pg
 * @created 2026-02-22
 */

import { defineConfig } from 'prisma/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

export default defineConfig({
  earlyAccess: true,
  schema: 'prisma/schema.prisma',
  migrate: {
    async adapter(env) {
      const pool = new Pool({ connectionString: env.DATABASE_URL });
      return new PrismaPg(pool);
    },
  },
});
