/**
 * @file build-info.tsx
 * @description Версия сборки, дата и коммит — MedTech style
 * @created 2026-02-22
 */

'use client';

const VERSION = process.env.NEXT_PUBLIC_BUILD_VERSION ?? '0.0.0';
const BUILD_DATE = process.env.NEXT_PUBLIC_BUILD_DATE ?? '';
const COMMIT = process.env.NEXT_PUBLIC_BUILD_COMMIT ?? 'dev';

function formatDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function BuildInfo({ variant = 'compact' }: { variant?: 'compact' | 'full' }) {
  if (variant === 'compact') {
    return <p className="text-xs text-slate-400 text-center select-all font-mono">v{VERSION}</p>;
  }

  return (
    <div className="text-sm text-slate-500 space-y-2">
      <div className="flex justify-between py-2 border-b border-slate-100">
        <span className="text-slate-400 text-xs uppercase tracking-wider font-bold">Версия</span>
        <span className="font-mono font-semibold select-all">v{VERSION}</span>
      </div>
      <div className="flex justify-between py-2 border-b border-slate-100">
        <span className="text-slate-400 text-xs uppercase tracking-wider font-bold">Сборка</span>
        <span className="font-mono select-all">{formatDate(BUILD_DATE)}</span>
      </div>
      <div className="flex justify-between py-2">
        <span className="text-slate-400 text-xs uppercase tracking-wider font-bold">Коммит</span>
        <span className="font-mono select-all">{COMMIT.slice(0, 8)}</span>
      </div>
    </div>
  );
}
