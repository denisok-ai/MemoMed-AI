/**
 * @file route.ts
 * @description API: POST /api/connections/link — привязка родственника к пациенту по инвайт-коду.
 * Rate limiting: 5 попыток в час на пользователя.
 * @dependencies prisma, next-auth, rate-limit
 * @created 2026-02-22
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import type { ApiResponse } from '@/types';

const linkSchema = z.object({
  inviteCode: z
    .string()
    .min(8, 'Код слишком короткий')
    .max(32, 'Код слишком длинный')
    .toUpperCase(),
});

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
  }

  if (session.user.role !== 'relative') {
    return NextResponse.json(
      { error: 'Только родственники могут использовать инвайт-коды' },
      { status: 403 }
    );
  }

  // Rate limiting: 5 попыток в час
  const rl = await checkRateLimit(`link:${session.user.id}`, 5, 3600).catch(() => ({
    allowed: true,
    remaining: 5,
    resetInSeconds: 3600,
  }));

  if (!rl.allowed) {
    return NextResponse.json(
      {
        error: `Слишком много попыток. Повторите через ${Math.ceil(rl.resetInSeconds / 60)} минут`,
      },
      {
        status: 429,
        headers: { 'Retry-After': String(rl.resetInSeconds) },
      }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Некорректное тело запроса' }, { status: 400 });
  }

  const parsed = linkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Некорректный код' },
      { status: 400 }
    );
  }

  // Ищем пациента по инвайт-коду
  const patient = await prisma.user.findFirst({
    where: {
      inviteCode: parsed.data.inviteCode,
      role: 'patient',
    },
    select: { id: true, profile: { select: { fullName: true } } },
  });

  if (!patient) {
    return NextResponse.json({ error: 'Пациент с таким кодом не найден' }, { status: 404 });
  }

  if (patient.id === session.user.id) {
    return NextResponse.json({ error: 'Нельзя подключиться к самому себе' }, { status: 400 });
  }

  // Проверяем, что связь ещё не существует
  const existing = await prisma.connection.findFirst({
    where: { patientId: patient.id, relativeId: session.user.id },
  });

  if (existing) {
    if (existing.status === 'active') {
      return NextResponse.json({ error: 'Вы уже подключены к этому пациенту' }, { status: 409 });
    }
    // Переактивируем неактивную связь
    await prisma.connection.update({
      where: { id: existing.id },
      data: { status: 'active' },
    });
    return NextResponse.json({
      message: `Подключение к ${patient.profile?.fullName ?? 'пациенту'} восстановлено`,
    });
  }

  // Создаём новую связь
  await prisma.connection.create({
    data: {
      patientId: patient.id,
      relativeId: session.user.id,
      status: 'active',
    },
  });

  return NextResponse.json(
    { message: `Вы подключились к ${patient.profile?.fullName ?? 'пациенту'}` },
    { status: 201 }
  );
}
