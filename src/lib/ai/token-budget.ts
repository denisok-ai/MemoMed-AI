/**
 * @file token-budget.ts
 * @description Управление бюджетом токенов AI: учёт месячного расхода через Redis.
 * Лимит: 50 000 токенов в месяц на пользователя.
 * @dependencies ioredis
 * @created 2026-02-22
 */

import { redis } from '@/lib/db/redis';

const MONTHLY_TOKEN_LIMIT = 50_000;
const TOKEN_KEY_TTL_DAYS = 35;

function getMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function buildRedisKey(userId: string): string {
  return `ai:tokens:${userId}:${getMonthKey()}`;
}

export async function getRemainingTokens(userId: string): Promise<number> {
  const key = buildRedisKey(userId);
  const used = await redis.get(key);
  const usedCount = used ? parseInt(used, 10) : 0;
  return Math.max(0, MONTHLY_TOKEN_LIMIT - usedCount);
}

export async function consumeTokens(userId: string, tokens: number): Promise<void> {
  const key = buildRedisKey(userId);
  const ttlSeconds = TOKEN_KEY_TTL_DAYS * 24 * 60 * 60;

  const pipeline = redis.pipeline();
  pipeline.incrby(key, tokens);
  pipeline.expire(key, ttlSeconds);
  await pipeline.exec();
}

export async function isTokenBudgetExceeded(userId: string): Promise<boolean> {
  const remaining = await getRemainingTokens(userId);
  return remaining <= 0;
}

export async function getUsedTokens(userId: string): Promise<number> {
  const key = buildRedisKey(userId);
  const used = await redis.get(key);
  return used ? parseInt(used, 10) : 0;
}

/** Псевдоним для использования в роутах */
export async function checkTokenBudget(
  userId: string
): Promise<{ remaining: number; exceeded: boolean }> {
  const remaining = await getRemainingTokens(userId);
  return { remaining, exceeded: remaining <= 0 };
}

/** Псевдоним для увеличения счётчика в роутах */
export const incrementTokenUsage = consumeTokens;
