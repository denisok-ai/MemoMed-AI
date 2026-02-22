/**
 * Prisma 7 config for Docker/Node (no TypeScript).
 * URL берётся из process.env.DATABASE_URL (задаётся в docker-compose).
 */
const { defineConfig, env } = require('prisma/config');

module.exports = defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
