/**
 * @file ai-disclaimer-modal.tsx
 * @description Модальное окно медицинского дисклеймера при первом использовании чата.
 * Показывается один раз, статус сохраняется в LocalStorage.
 * @created 2026-02-22
 */

'use client';

import { useState, useEffect } from 'react';

const DISCLAIMER_KEY = 'memomed_ai_disclaimer_shown';

export function AiDisclaimerModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const shown = localStorage.getItem(DISCLAIMER_KEY);
    if (!shown) {
      queueMicrotask(() => setIsOpen(true));
    }
  }, []);

  function handleAccept() {
    localStorage.setItem(DISCLAIMER_KEY, '1');
    setIsOpen(false);
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6">
        <div className="space-y-3">
          <div className="text-4xl text-center" aria-hidden="true">
            ⚕️
          </div>
          <h2 id="disclaimer-title" className="text-xl font-bold text-[#212121] text-center">
            Важная информация
          </h2>
        </div>

        <div className="space-y-3 text-base text-[#424242]">
          <p>
            ИИ-помощник MemoMed отвечает на общие вопросы о лекарствах и здоровье, но
            <strong> не заменяет консультацию врача.</strong>
          </p>
          <p>
            Информация носит <strong>справочный характер</strong> и не является медицинской
            рекомендацией.
          </p>
          <p>
            При любых сомнениях относительно вашего здоровья или лечения —{' '}
            <strong>обратитесь к лечащему врачу.</strong>
          </p>
        </div>

        <button
          onClick={handleAccept}
          className="w-full py-4 bg-[#1565C0] text-white text-lg font-semibold rounded-xl
            hover:bg-[#0D47A1] transition-colors min-h-[56px]"
          autoFocus
        >
          Я понимаю, продолжить
        </button>
      </div>
    </div>
  );
}
