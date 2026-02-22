/**
 * @file prisma.config.ts
 * @description Prisma 7+ configuration — загружает .env и передаёт datasource URL
 * @dependencies prisma
 * @created 2026-02-22
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'prisma/config';

// Prisma CLI не загружает .env автоматически в v7 — делаем вручную
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const databaseUrl = process.env.DATABASE_URL;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  ...(databaseUrl ? { datasource: { url: databaseUrl } } : {}),
});
