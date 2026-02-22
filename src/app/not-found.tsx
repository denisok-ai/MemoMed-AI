/**
 * @file not-found.tsx
 * @description Кастомная страница 404
 * @created 2026-02-22
 */

import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6
      bg-[var(--color-background)]"
    >
      <div className="text-center space-y-6 max-w-md">
        <p className="text-8xl font-black text-[#1565C0]/20" aria-hidden="true">
          404
        </p>
        <h1 className="text-2xl font-bold text-[#0D1B2A]">Страница не найдена</h1>
        <p className="text-slate-500">Запрашиваемая страница не существует или была перемещена</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1565C0] text-white
            rounded-xl font-semibold hover:bg-[#0D47A1] transition-colors"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}
