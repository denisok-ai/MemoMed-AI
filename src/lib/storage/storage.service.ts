/**
 * @file storage.service.ts
 * @description Абстракция хранилища файлов.
 * STORAGE_TYPE=local → файлы в /public/uploads/
 * STORAGE_TYPE=s3 → S3-совместимое хранилище (MinIO, AWS, Yandex)
 * @created 2026-02-22
 */

import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';

const STORAGE_TYPE = process.env.STORAGE_TYPE ?? 'local';
const MAX_SIZE_MB = parseInt(process.env.UPLOAD_MAX_SIZE_MB ?? '5', 10);
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

/** Допустимые MIME-типы для фото лекарств */
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

export class StorageError extends Error {
  constructor(
    message: string,
    public code: 'TOO_LARGE' | 'INVALID_TYPE' | 'UPLOAD_FAILED'
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Сохраняет файл и возвращает публичный URL.
 * @param file - ArrayBuffer содержимое файла
 * @param filename - Уникальное имя файла (с расширением)
 * @param mimeType - MIME-тип
 */
export async function saveFile(
  file: ArrayBuffer,
  filename: string,
  mimeType: string
): Promise<string> {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new StorageError(`Недопустимый тип файла: ${mimeType}`, 'INVALID_TYPE');
  }

  if (file.byteLength > MAX_SIZE_BYTES) {
    throw new StorageError(`Файл слишком большой. Максимум ${MAX_SIZE_MB} МБ`, 'TOO_LARGE');
  }

  if (STORAGE_TYPE === 's3') {
    return saveToS3(file, filename, mimeType);
  }

  return saveToLocal(file, filename);
}

/**
 * Удаляет файл по URL
 */
export async function deleteFile(url: string): Promise<void> {
  if (STORAGE_TYPE === 's3') {
    await deleteFromS3(url);
  } else {
    await deleteFromLocal(url);
  }
}

// --- Локальное хранилище ---

async function saveToLocal(file: ArrayBuffer, filename: string): Promise<string> {
  const uploadDir = join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });

  const filePath = join(uploadDir, filename);
  await writeFile(filePath, Buffer.from(file));

  return `/uploads/${filename}`;
}

async function deleteFromLocal(url: string): Promise<void> {
  const filename = url.replace('/uploads/', '');
  const filePath = join(process.cwd(), 'public', 'uploads', filename);
  await unlink(filePath).catch((err) => {
    console.warn('[storage] deleteFromLocal failed:', err);
  });
}

// --- S3-совместимое хранилище ---

async function saveToS3(file: ArrayBuffer, filename: string, mimeType: string): Promise<string> {
  // S3 SDK подгружается только при STORAGE_TYPE=s3 (опциональная зависимость)

  // @ts-expect-error: @aws-sdk/client-s3 устанавливается при необходимости
  const { S3Client, PutObjectCommand } = (await import(
    /* @vite-ignore */ '@aws-sdk/client-s3'
  )) as typeof import('@aws-sdk/client-s3');

  const client = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION ?? 'auto',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY ?? '',
      secretAccessKey: process.env.S3_SECRET_KEY ?? '',
    },
  });

  const bucket = process.env.S3_BUCKET ?? 'memomed-uploads';

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: `medications/${filename}`,
      Body: Buffer.from(file),
      ContentType: mimeType,
      ACL: 'public-read',
    })
  );

  const endpoint = process.env.S3_ENDPOINT ?? `https://s3.amazonaws.com`;
  return `${endpoint}/${bucket}/medications/${filename}`;
}

async function deleteFromS3(url: string): Promise<void> {
  // @ts-expect-error: @aws-sdk/client-s3 устанавливается при необходимости
  const { S3Client, DeleteObjectCommand } = (await import(
    /* @vite-ignore */ '@aws-sdk/client-s3'
  )) as typeof import('@aws-sdk/client-s3');

  const client = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION ?? 'auto',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY ?? '',
      secretAccessKey: process.env.S3_SECRET_KEY ?? '',
    },
  });

  const bucket = process.env.S3_BUCKET ?? 'memomed-uploads';
  const key = url.split(`/${bucket}/`)[1] ?? '';

  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key })).catch((err) => {
    console.warn('[storage] deleteFromS3 failed:', err);
  });
}
