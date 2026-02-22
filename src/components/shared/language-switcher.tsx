/**
 * @file language-switcher.tsx
 * @description Переключатель языка (RU / EN) в стиле MedTech.
 * Записывает локаль в cookie и перезагружает страницу.
 * @created 2026-02-22
 */

'use client';

import { useTransition } from 'react';
import { GlobeIcon } from './nav-icons';

interface LanguageSwitcherProps {
  currentLocale: string;
}

const nextLocale: Record<string, string> = {
  ru: 'en',
  en: 'ru',
};

const currentLabel: Record<string, string> = {
  ru: 'RU',
  en: 'EN',
};

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const [isPending, startTransition] = useTransition();

  async function switchLocale() {
    const target = nextLocale[currentLocale] ?? 'ru';

    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: target }),
    });

    startTransition(() => {
      window.location.reload();
    });
  }

  return (
    <button
      onClick={switchLocale}
      disabled={isPending}
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold
        text-slate-500 hover:text-[#1565C0] bg-transparent hover:bg-blue-50
        rounded-lg transition-colors disabled:opacity-50 min-h-[36px]"
      aria-label={`Переключить язык (сейчас: ${currentLocale.toUpperCase()})`}
      title="Переключить язык"
    >
      <GlobeIcon className="w-3.5 h-3.5" />
      <span>{isPending ? '...' : (currentLabel[currentLocale] ?? 'RU')}</span>
    </button>
  );
}
