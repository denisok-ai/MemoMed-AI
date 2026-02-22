/**
 * @file photo-upload.tsx
 * @description Компонент загрузки фото лекарства.
 * Сжимает изображение до 500px WebP через Canvas API перед отправкой.
 * Поддерживает камеру и галерею, drag-and-drop.
 * @created 2026-02-22
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AlertTriangleIcon, PlusIcon, TrashIcon } from '@/components/shared/nav-icons';

interface PhotoUploadProps {
  medicationId: string;
  currentPhotoUrl?: string | null;
  medicationName: string;
}

/** Сжимает изображение до 500px ширины в формат WebP через Canvas */
async function compressImage(file: File): Promise<Blob> {
  const MAX_WIDTH = 500;
  const QUALITY = 0.82;

  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(1, MAX_WIDTH / img.width);
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas недоступен'));
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Ошибка сжатия'));
            return;
          }
          resolve(blob);
        },
        'image/webp',
        QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Не удалось загрузить изображение'));
    };

    img.src = objectUrl;
  });
}

export function PhotoUpload({ medicationId, currentPhotoUrl, medicationName }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsUploading(true);

      try {
        // Предварительный просмотр
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        // Сжимаем на клиенте
        const compressed = await compressImage(file);

        // Отправляем на сервер
        const formData = new FormData();
        formData.append('photo', compressed, 'photo.webp');

        const response = await fetch(`/api/medications/${medicationId}/photo`, {
          method: 'POST',
          body: formData,
        });

        URL.revokeObjectURL(objectUrl);

        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          throw new Error(data.error ?? 'Ошибка загрузки');
        }

        const data = (await response.json()) as { data: { photoUrl: string } };
        setPreview(data.data.photoUrl);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
        setPreview(currentPhotoUrl ?? null);
      } finally {
        setIsUploading(false);
      }
    },
    [medicationId, currentPhotoUrl, router]
  );

  async function handleDelete() {
    if (!confirm('Удалить фото?')) return;
    setIsUploading(true);

    try {
      const res = await fetch(`/api/medications/${medicationId}/photo`, { method: 'DELETE' });
      if (res.ok) {
        setPreview(null);
        router.refresh();
      }
    } finally {
      setIsUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) processFile(file);
  }

  return (
    <div className="space-y-3">
      {/* Область загрузки / превью */}
      <div
        className={`relative rounded-2xl overflow-hidden border-2 transition-all
          ${isDragging ? 'border-[#1565C0] bg-[#E3F2FD]' : 'border-dashed border-slate-300'}
          ${preview ? 'border-solid' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative aspect-square w-full max-w-[200px] mx-auto">
            <Image
              src={preview}
              alt={`Фото ${medicationName}`}
              fill
              className="object-cover rounded-2xl"
              sizes="200px"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
                <span className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full py-10 flex flex-col items-center gap-3 text-slate-500
              hover:text-[#1565C0] hover:bg-[#f5f5f5] transition-colors"
            aria-label="Добавить фото лекарства"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              <PlusIcon className="w-8 h-8 text-slate-400" aria-hidden />
            </div>
            <span className="text-base">
              {isDragging ? 'Отпустите файл' : 'Добавить фото упаковки'}
            </span>
            <span className="text-sm text-slate-400">Камера или галерея</span>
          </button>
        )}
      </div>

      {/* Сообщение об ошибке */}
      {error && (
        <p role="alert" className="text-sm text-[#f44336]">
          <AlertTriangleIcon className="w-4 h-4 shrink-0 inline-block mr-1" aria-hidden />
          {error}
        </p>
      )}

      {/* Кнопки управления */}
      <div className="flex gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex-1 py-3 text-base font-medium text-[#1565C0] bg-[#E3F2FD]
            rounded-xl hover:bg-[#BBDEFB] transition-colors min-h-[48px]
            disabled:opacity-50"
        >
          {preview ? 'Заменить' : 'Добавить фото'}
        </button>

        {preview && (
          <button
            onClick={handleDelete}
            disabled={isUploading}
            className="py-3 px-4 text-base text-[#f44336] bg-[#ffebee]
              rounded-xl hover:bg-[#ffcdd2] transition-colors min-h-[48px]
              disabled:opacity-50"
            aria-label="Удалить фото"
          >
            <TrashIcon className="w-5 h-5" aria-hidden />
          </button>
        )}
      </div>

      {/* Скрытый input для выбора файла */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
          e.target.value = '';
        }}
        aria-hidden="true"
      />

      <p className="text-sm text-slate-500">
        Макс. {process.env.NEXT_PUBLIC_UPLOAD_MAX_SIZE_MB ?? '5'} МБ · JPG, PNG, WebP · Сжимается
        автоматически
      </p>
    </div>
  );
}
