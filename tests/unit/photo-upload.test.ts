/**
 * @file photo-upload.test.ts
 * @description Тесты для storage.service и логики валидации фото
 * @created 2026-02-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Мокируем fs/promises, чтобы не создавать файлы на диске в тестах
const mockWriteFile = vi.fn().mockResolvedValue(undefined);
const mockMkdir = vi.fn().mockResolvedValue(undefined);
const mockUnlink = vi.fn().mockResolvedValue(undefined);

vi.mock('node:fs/promises', () => ({
  default: { writeFile: mockWriteFile, mkdir: mockMkdir, unlink: mockUnlink },
  writeFile: mockWriteFile,
  mkdir: mockMkdir,
  unlink: mockUnlink,
}));

vi.mock('fs/promises', () => ({
  default: { writeFile: mockWriteFile, mkdir: mockMkdir, unlink: mockUnlink },
  writeFile: mockWriteFile,
  mkdir: mockMkdir,
  unlink: mockUnlink,
}));

// Мокируем @aws-sdk/client-s3 — не нужен при STORAGE_TYPE=local
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(),
  PutObjectCommand: vi.fn(),
  DeleteObjectCommand: vi.fn(),
}));

// Устанавливаем STORAGE_TYPE=local для тестов
process.env.STORAGE_TYPE = 'local';
process.env.UPLOAD_MAX_SIZE_MB = '5';

// Динамический импорт после установки переменных окружения
const { saveFile, deleteFile } = await import('@/lib/storage/storage.service');

describe('StorageService - local', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('сохраняет файл и возвращает публичный URL', async () => {
    const buffer = new ArrayBuffer(100);
    const url = await saveFile(buffer, 'test.webp', 'image/webp');
    expect(url).toBe('/uploads/test.webp');
  });

  it('отклоняет файл недопустимого MIME-типа', async () => {
    const buffer = new ArrayBuffer(100);

    await expect(saveFile(buffer, 'test.pdf', 'application/pdf')).rejects.toThrow();

    try {
      await saveFile(buffer, 'test.pdf', 'application/pdf');
    } catch (e) {
      expect((e as { code: string }).code).toBe('INVALID_TYPE');
    }
  });

  it('отклоняет файл, превышающий лимит размера', async () => {
    const bigBuffer = new ArrayBuffer(6 * 1024 * 1024); // 6 МБ

    try {
      await saveFile(bigBuffer, 'big.webp', 'image/webp');
      expect.fail('Должна была выброситься ошибка');
    } catch (e) {
      expect((e as { code: string }).code).toBe('TOO_LARGE');
    }
  });

  it('принимает jpeg, png, webp, heic', async () => {
    const buf = new ArrayBuffer(100);
    for (const mime of ['image/jpeg', 'image/png', 'image/webp', 'image/heic']) {
      await expect(saveFile(buf, 'img.jpg', mime)).resolves.not.toThrow();
    }
  });
});

describe('StorageService - deleteFile (local)', () => {
  it('не выбрасывает ошибку при удалении несуществующего файла', async () => {
    await expect(deleteFile('/uploads/nonexistent.webp')).resolves.not.toThrow();
  });
});
