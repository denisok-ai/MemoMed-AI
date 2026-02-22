/**
 * @file route.ts
 * @description API: GET /api/admin/patients/search?q=... — поиск пациентов для админа.
 * Возвращает id, fullName, email для выбора в отчётах. Только роль admin.
 * @created 2026-02-22
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
  }
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Доступ только для администратора' }, { status: 403 });
  }

  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  const limit = Math.min(50, parseInt(request.nextUrl.searchParams.get('limit') ?? '20', 10));

  if (q.length < 2) {
    return NextResponse.json({ patients: [] });
  }

  const where = {
    role: 'patient' as const,
    OR: [
      { email: { contains: q, mode: 'insensitive' as const } },
      { profile: { fullName: { contains: q, mode: 'insensitive' as const } } },
    ],
  };

  const users = await prisma.user.findMany({
    where,
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      profile: { select: { fullName: true } },
    },
  });

  const patients = users.map((u) => ({
    id: u.id,
    fullName: u.profile?.fullName ?? null,
    email: u.email,
    label: [u.profile?.fullName, u.email].filter(Boolean).join(' · ') || u.id.slice(0, 8),
  }));

  return NextResponse.json({ patients });
}
