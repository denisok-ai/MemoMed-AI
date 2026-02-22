/**
 * @file route.ts
 * @description API: GET /api/feed/events — REST-эндпоинт для polling-режима ленты.
 * Используется как fallback когда SSE недоступен.
 * Возвращает последние 30 событий за 24 часа.
 * @dependencies prisma, next-auth
 * @created 2026-02-22
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import type { ApiResponse } from '@/types';

/** Цветовая логика: зелёный/жёлтый/красный */
function getEventColor(
  status: string,
  delayMinutes: number | null
): 'green' | 'yellow' | 'red' {
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

export async function GET(): Promise<NextResponse<ApiResponse>> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const connections = await prisma.connection.findMany({
    where: { relativeId: session.user.id, status: 'active' },
    select: { patientId: true },
  });

  if (connections.length === 0) {
    return NextResponse.json({ data: [] });
  }

  const patientIds = connections.map((c) => c.patientId);

  const logs = await prisma.medicationLog.findMany({
    where: {
      medication: { patientId: { in: patientIds } },
      createdAt: { gte: since },
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
    take: 30,
  });

  const events = logs.map((log) => {
    const scheduledMinutes = parseTimeToMinutes(log.medication.scheduledTime);
    const actualMinutes = log.actualAt ? timeToMinutes(log.actualAt) : null;
    const delayMinutes =
      actualMinutes !== null ? actualMinutes - scheduledMinutes : null;

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

  return NextResponse.json({ data: events });
}
