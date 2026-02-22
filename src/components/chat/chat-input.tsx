/**
 * @file chat-input.tsx
 * @description Поле ввода сообщения с отправкой по Enter и кнопкой
 * @created 2026-02-22
 */

'use client';

import { useState, type KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [text, setText] = useState('');

  function handleSend() {
    if (!text.trim() || isLoading) return;
    onSend(text);
    setText('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Отправка по Enter (без Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex items-end gap-3 p-4 bg-white border-t border-slate-100">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        rows={1}
        placeholder="Спросите об этом лекарстве..."
        className="flex-1 px-4 py-3 text-base border-2 border-slate-200 rounded-2xl
          resize-none focus:border-[#1565C0] focus:outline-none transition-colors
          disabled:opacity-60 max-h-[120px] overflow-y-auto"
        style={{ minHeight: '52px' }}
        aria-label="Сообщение ИИ-помощнику"
      />
      <button
        onClick={handleSend}
        disabled={!text.trim() || isLoading}
        aria-label="Отправить сообщение"
        className="w-13 h-13 min-w-[52px] min-h-[52px] bg-[#1565C0] text-white rounded-2xl
          hover:bg-[#0D47A1] disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors flex items-center justify-center text-xl"
      >
        {isLoading ? (
          <span
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
        ) : (
          '↑'
        )}
      </button>
    </div>
  );
}
