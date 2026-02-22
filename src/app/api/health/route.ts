/**
 * @file route.ts
 * @description Health check endpoint for Docker and monitoring
 * @dependencies prisma, redis
 * @created 2026-02-22
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { redis } from '@/lib/db/redis';

interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  services: {
    database: 'ok' | 'error';
    redis: 'ok' | 'error';
  };
}

export async function GET(): Promise<NextResponse<HealthStatus>> {
  const services = { database: 'error' as const, redis: 'error' as const };
  let dbOk = false;
  let redisOk = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    // database unreachable
  }

  try {
    await redis.ping();
    redisOk = true;
  } catch {
    // redis unreachable
  }

  const allOk = dbOk && redisOk;
  const status: HealthStatus = {
    status: allOk ? 'ok' : dbOk || redisOk ? 'degraded' : 'error',
    timestamp: new Date().toISOString(),
    services: {
      database: dbOk ? 'ok' : 'error',
      redis: redisOk ? 'ok' : 'error',
    },
  };

  return NextResponse.json(status, { status: allOk ? 200 : 503 });
}
