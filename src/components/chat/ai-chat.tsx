/**
 * @file ai-chat.tsx
 * @description Главный компонент AI-чата: история сообщений, ввод, подсказки
 * Использует useAiChat для стримингового получения ответов
 * @dependencies useAiChat, MessageBubble, ChatInput, ChatSuggestions, AiDisclaimerModal
 * @created 2026-02-22
 */

'use client';

import { useEffect, useRef } from 'react';
import { useAiChat } from '@/hooks/use-ai-chat';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { ChatSuggestions } from './chat-suggestions';
import { AiDisclaimerModal } from './ai-disclaimer-modal';

export function AiChat() {
  const { messages, isLoading, error, sendMessage, clearHistory } = useAiChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Прокручиваем вниз при новых сообщениях
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isEmpty = messages.length === 0;

  return (
    <>
      <AiDisclaimerModal />

      <div className="flex flex-col h-full">
        {/* Шапка чата */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">🤖</span>
            <div>
              <p className="text-base font-semibold text-[#212121]">ИИ-помощник MemoMed</p>
              <p className="text-xs text-[#9e9e9e]">Вопросы о лекарствах и здоровье</p>
            </div>
          </div>

          {!isEmpty && (
            <button
              onClick={clearHistory}
              className="text-sm text-[#9e9e9e] hover:text-[#f44336] transition-colors
                min-h-[44px] px-3"
              aria-label="Очистить историю чата"
            >
              Очистить
            </button>
          )}
        </div>

        {/* Область сообщений */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
          role="log"
          aria-label="История переписки"
          aria-live="polite"
        >
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full text-center
              space-y-4 py-8">
              <span className="text-5xl" aria-hidden="true">🤖</span>
              <div className="space-y-2">
                <p className="text-xl font-semibold text-[#212121]">ИИ-помощник</p>
                <p className="text-base text-[#757575] max-w-xs">
                  Задайте вопрос о ваших лекарствах или здоровье
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))
          )}

          {/* Отображение ошибки */}
          {error && (
            <div role="alert" className="flex items-center gap-2 text-[#f44336] text-sm px-4">
              <span aria-hidden="true">⚠️</span>
              {error}
            </div>
          )}

          <div ref={messagesEndRef} aria-hidden="true" />
        </div>

        {/* Подсказки (только для пустого чата) */}
        {isEmpty && <ChatSuggestions onSelect={sendMessage} />}

        {/* Поле ввода */}
        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </>
  );
}
