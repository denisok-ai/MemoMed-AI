/**
 * @file feedback-modal.tsx
 * @description Модальное окно для отзыва о лекарстве.
 * Открывается кнопкой из карточки или истории.
 * @created 2026-02-22
 */

'use client';

import { useState } from 'react';
import { FeedbackForm } from './feedback-form';

interface FeedbackModalProps {
  medicationId: string;
  medicationName: string;
  dosage: string;
}

export function FeedbackModal({ medicationId, medicationName, dosage }: FeedbackModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-3 text-base font-medium text-[#1565C0] bg-[#E3F2FD]
          rounded-xl hover:bg-[#BBDEFB] transition-colors min-h-[48px]"
        aria-haspopup="dialog"
      >
        ⭐ Оставить отзыв
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
            bg-black/50 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Отзыв о лекарстве"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8
            shadow-2xl"
          >
            <FeedbackForm
              medicationId={medicationId}
              medicationName={medicationName}
              dosage={dosage}
              onClose={() => setIsOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
