/**
 * @file route.ts
 * @description API: POST /api/push/subscribe — регистрация push-подписки браузера.
 *              DELETE /api/push/subscribe — отмена подписки.
 * @dependencies prisma, next-auth
 * @created 2026-02-22
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import type { ApiResponse } from '@/types';

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = subscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Некорректный формат подписки' }, { status: 400 });
  }

  const userAgent = request.headers.get('user-agent')?.slice(0, 200) ?? null;

  await prisma.pushSubscription.upsert({
    where: { endpoint: parsed.data.endpoint },
    update: {
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
      userAgent,
    },
    create: {
      userId: session.user.id,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
      userAgent,
    },
  });

  return NextResponse.json({ message: 'Подписка зарегистрирована' }, { status: 201 });
}

export async function DELETE(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const endpoint = (body as { endpoint?: string })?.endpoint;

  if (!endpoint) {
    return NextResponse.json({ error: 'Endpoint не указан' }, { status: 400 });
  }

  await prisma.pushSubscription.deleteMany({
    where: { endpoint, userId: session.user.id },
  });

  return NextResponse.json({ message: 'Подписка удалена' });
}
