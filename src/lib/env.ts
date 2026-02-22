/**
 * @file env.ts
 * @description Валидация переменных окружения при старте.
 * Экспортирует типизированный объект env для использования в серверном коде.
 * @created 2026-02-22
 */

import { z } from 'zod';

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL обязательна'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  NEXTAUTH_SECRET: z.string().min(16, 'NEXTAUTH_SECRET слишком коротка (мин. 16)'),
  NEXTAUTH_URL: z.string().url().optional(),

  DEEPSEEK_API_KEY: z.string().optional(),
  DEEPSEEK_BASE_URL: z.string().default('https://api.deepseek.com/v1'),
  DEEPSEEK_MODEL: z.string().default('deepseek-chat'),

  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_EMAIL: z.string().optional(),

  STORAGE_TYPE: z.enum(['local', 's3']).default('local'),
  UPLOAD_MAX_SIZE_MB: z.coerce.number().default(5),

  S3_ENDPOINT: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_REGION: z.string().default('auto'),

  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let _env: ServerEnv | null = null;

/** Валидирует и возвращает серверные переменные окружения */
export function getServerEnv(): ServerEnv {
  if (_env) return _env;

  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    console.error(`\n❌ Ошибки в переменных окружения:\n${errors}\n`);

    if (process.env.NODE_ENV === 'production') {
      throw new Error('Некорректные переменные окружения');
    }
  }

  _env = (
    parsed.success
      ? parsed.data
      : serverEnvSchema.parse({
          ...process.env,
          DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://localhost:5432/memomed',
          NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? 'dev-secret-change-me-in-production',
        })
  ) as ServerEnv;

  return _env;
}
