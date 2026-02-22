/**
 * @file copy-invite-code.tsx
 * @description Клиентский компонент: показывает инвайт-код с кнопкой копирования в буфер
 * @created 2026-02-22
 */

'use client';

import { useState } from 'react';
import { CheckIcon, ClipboardIcon } from '@/components/shared/nav-icons';

interface CopyInviteCodeProps {
  code: string;
}

export function CopyInviteCode({ code }: CopyInviteCodeProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback для устройств без Clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="space-y-4">
      {/* Отображение кода крупным шрифтом */}
      <div
        className="bg-white rounded-2xl px-8 py-6 border-2 border-[#1565C0]"
        aria-label={`Инвайт-код: ${code}`}
      >
        <p
          className="text-4xl font-bold text-[#1565C0] font-mono tracking-widest text-center"
          aria-live="polite"
        >
          {code}
        </p>
      </div>

      {/* Кнопка копирования */}
      <button
        onClick={handleCopy}
        className={`w-full py-4 text-lg font-semibold rounded-xl transition-all duration-200
          min-h-[56px] ${
            copied ? 'bg-[#4caf50] text-white' : 'bg-[#1565C0] text-white hover:bg-[#6a3fb5]'
          }`}
        aria-label={copied ? 'Код скопирован' : 'Скопировать код'}
        aria-live="polite"
      >
        {copied ? (
          <>
            <CheckIcon className="w-5 h-5 inline-block mr-2 -mt-0.5" aria-hidden />
            Скопировано!
          </>
        ) : (
          <>
            <ClipboardIcon className="w-5 h-5 inline-block mr-2 -mt-0.5" aria-hidden />
            Скопировать код
          </>
        )}
      </button>
    </div>
  );
}
