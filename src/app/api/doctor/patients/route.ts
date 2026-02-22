/**
 * @file route.ts
 * @description API: GET /api/doctor/patients — список пациентов врача.
 * Врач видит только тех пациентов, которые связали с ним аккаунт через инвайт-код.
 * Связь хранится в модели Connection (patientId, relativeId=doctorId).
 * @dependencies prisma, next-auth
 * @created 2026-02-22
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }
  if (session.user.role !== 'doctor' && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
  }

  const connections = await prisma.connection.findMany({
    where: { relativeId: session.user.id, status: 'active' },
    include: {
      patient: {
        select: {
          id: true,
          email: true,
          profile: { select: { fullName: true, dateOfBirth: true } },
          medications: {
            where: { isActive: true },
            select: { id: true, name: true, scheduledTime: true },
          },
        },
      },
    },
  });

  // Считаем дисциплину за последние 30 дней для каждого пациента
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const patientIds = connections.map((c) => c.patientId);
  const logs = await prisma.medicationLog.findMany({
    where: {
      medication: { patientId: { in: patientIds } },
      scheduledAt: { gte: since },
      status: { in: ['taken', 'missed'] },
    },
    select: { status: true, medication: { select: { patientId: true } } },
  });

  const logsByPatient = new Map<string, { taken: number; total: number }>();
  for (const log of logs) {
    const pid = log.medication.patientId;
    const cur = logsByPatient.get(pid) ?? { taken: 0, total: 0 };
    cur.total++;
    if (log.status === 'taken') cur.taken++;
    logsByPatient.set(pid, cur);
  }

  const patients = connections.map((c) => {
    const stats = logsByPatient.get(c.patientId);
    const disciplinePercent =
      stats && stats.total > 0 ? Math.round((stats.taken / stats.total) * 100) : null;

    return {
      connectionId: c.id,
      patientId: c.patientId,
      fullName: c.patient.profile?.fullName ?? c.patient.email,
      email: c.patient.email,
      dateOfBirth: c.patient.profile?.dateOfBirth ?? null,
      activeMedicationsCount: c.patient.medications.length,
      medications: c.patient.medications,
      disciplinePercent,
      connectedSince: c.createdAt,
    };
  });

  return NextResponse.json({ patients });
}
