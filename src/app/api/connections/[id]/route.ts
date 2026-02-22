/**
 * @file route.ts
 * @description API: DELETE /api/connections/:id — отключение родственника от пациента
 * @dependencies prisma, next-auth
 * @created 2026-02-22
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import type { ApiResponse } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
  }

  const { id } = await params;

  // Можно отключить связь если ты пациент или родственник в ней
  const connection = await prisma.connection.findFirst({
    where: {
      id,
      OR: [
        { patientId: session.user.id },
        { relativeId: session.user.id },
      ],
    },
  });

  if (!connection) {
    return NextResponse.json({ error: 'Связь не найдена' }, { status: 404 });
  }

  await prisma.connection.update({
    where: { id },
    data: { status: 'inactive' },
  });

  return NextResponse.json({ message: 'Подключение разорвано' });
}
