/**
 * @file route.ts
 * @description API: GET /api/feed/events — REST-эндпоинт для ленты событий.
 * Используется для начальной загрузки и polling-режима.
 * Возвращает события за 30 дней с курсорной пагинацией (?before=timestamp).
 * @dependencies prisma, next-auth
 * @created 2026-02-22
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import type { ApiResponse } from '@/types';

/** Цветовая логика: зелёный/жёлтый/красный */
function getEventColor(status: string, delayMinutes: number | null): 'green' | 'yellow' | 'red' {
  if (status === 'missed') return 'red';
  if (status === 'taken') {
    if (delayMinutes === null || delayMinutes <= 0) return 'green';
    if (delayMinutes <= 30) return 'yellow';
    return 'red';
  }
  return 'yellow';
}

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function timeToMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

const PAGE_SIZE = 50;
const MAX_DAYS = 30;

export async function GET(request: Request): Promise<NextResponse<ApiResponse>> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const beforeStr = searchParams.get('before');
  const beforeTs = beforeStr ? parseInt(beforeStr, 10) : null;

  const since = new Date(Date.now() - MAX_DAYS * 24 * 60 * 60 * 1000);

  const connections = await prisma.connection.findMany({
    where: { relativeId: session.user.id, status: 'active' },
    select: { patientId: true },
  });

  if (connections.length === 0) {
    return NextResponse.json({ data: [], hasMore: false });
  }

  const patientIds = connections.map((c) => c.patientId);

  const logs = await prisma.medicationLog.findMany({
    where: {
      medication: { patientId: { in: patientIds } },
      createdAt: beforeTs ? { lt: new Date(beforeTs), gte: since } : { gte: since },
    },
    include: {
      medication: {
        select: {
          name: true,
          dosage: true,
          scheduledTime: true,
          patientId: true,
          patient: {
            include: { profile: { select: { fullName: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: PAGE_SIZE + 1,
  });

  const hasMore = logs.length > PAGE_SIZE;
  const pageLogs = logs.slice(0, PAGE_SIZE);

  const events = pageLogs.map((log) => {
    const scheduledMinutes = parseTimeToMinutes(log.medication.scheduledTime);
    const actualMinutes = log.actualAt ? timeToMinutes(log.actualAt) : null;
    const delayMinutes = actualMinutes !== null ? actualMinutes - scheduledMinutes : null;

    return {
      logId: log.id,
      status: log.status,
      medicationName: log.medication.name,
      dosage: log.medication.dosage,
      scheduledTime: log.medication.scheduledTime,
      actualAt: log.actualAt?.toISOString() ?? null,
      patientName: log.medication.patient.profile?.fullName ?? 'Пациент',
      patientId: log.medication.patientId,
      delayMinutes,
      color: getEventColor(log.status, delayMinutes),
      timestamp: log.createdAt.getTime(),
    };
  });

  return NextResponse.json({ data: events, hasMore });
}
