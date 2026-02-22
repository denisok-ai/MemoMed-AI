/**
 * @file route.ts
 * @description API: POST /api/medications/:id/photo — загрузка фото упаковки лекарства.
 * Клиент предварительно сжимает до 500px WebP через Canvas API.
 * Сервер валидирует тип, размер и сохраняет через storage.service.
 * @dependencies storage.service, prisma, next-auth
 * @created 2026-02-22
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { saveFile, deleteFile, StorageError } from '@/lib/storage/storage.service';
import type { ApiResponse } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<{ photoUrl: string }>>> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
  }

  const { id } = await params;

  const medication = await prisma.medication.findFirst({
    where: { id, patientId: session.user.id, isActive: true },
    select: { id: true, photoUrl: true },
  });

  if (!medication) {
    return NextResponse.json({ error: 'Лекарство не найдено' }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Некорректный формат запроса' }, { status: 400 });
  }

  const file = formData.get('photo');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Файл не передан' }, { status: 400 });
  }

  // Генерируем уникальное имя файла
  const ext = file.type === 'image/webp' ? 'webp' : 'jpg';
  const filename = `med_${id}_${randomUUID().slice(0, 8)}.${ext}`;

  try {
    const buffer = await file.arrayBuffer();
    const photoUrl = await saveFile(buffer, filename, file.type);

    // Удаляем старое фото
    if (medication.photoUrl) {
      await deleteFile(medication.photoUrl).catch(() => {});
    }

    await prisma.medication.update({
      where: { id },
      data: { photoUrl },
    });

    return NextResponse.json({ data: { photoUrl }, message: 'Фото загружено' });
  } catch (error) {
    if (error instanceof StorageError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Ошибка загрузки файла' }, { status: 500 });
  }
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

  const medication = await prisma.medication.findFirst({
    where: { id, patientId: session.user.id, isActive: true },
    select: { id: true, photoUrl: true },
  });

  if (!medication) {
    return NextResponse.json({ error: 'Лекарство не найдено' }, { status: 404 });
  }

  if (medication.photoUrl) {
    await deleteFile(medication.photoUrl).catch(() => {});
    await prisma.medication.update({
      where: { id },
      data: { photoUrl: null },
    });
  }

  return NextResponse.json({ message: 'Фото удалено' });
}
