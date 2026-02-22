/**
 * @file route.ts
 * @description User registration API endpoint with validation (Zod) and consent tracking
 * @dependencies prisma, bcryptjs, zod
 * @created 2026-02-22
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import type { ApiResponse } from '@/types';

const registerSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Пароль должен быть минимум 8 символов'),
  fullName: z.string().min(2, 'Имя слишком короткое').max(100),
  role: z.enum(['patient', 'relative']),
  consentGiven: z
    .union([z.boolean(), z.string()])
    .transform((v) => v === true || v === 'on' || v === 'true'),
  feedbackConsent: z
    .union([z.boolean(), z.string()])
    .transform((v) => v === true || v === 'on' || v === 'true')
    .optional()
    .default(false),
});

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  let body: unknown;
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    body = await request.json();
  } else {
    const formData = await request.formData();
    body = Object.fromEntries(formData.entries());
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Некорректные данные' },
      { status: 400 }
    );
  }

  const { email, password, fullName, role, consentGiven, feedbackConsent } = parsed.data;

  if (!consentGiven) {
    return NextResponse.json(
      { error: 'Необходимо принять политику обработки данных' },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Пользователь с таким email уже существует' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
      consentGiven,
      feedbackConsent: feedbackConsent ?? false,
      profile: {
        create: { fullName },
      },
    },
  });

  return NextResponse.json({ data: { id: user.id }, message: 'Аккаунт создан' }, { status: 201 });
}
