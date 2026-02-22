/**
 * @file ai-chat.tsx
 * @description AI-чат — MedTech 2025/2026:
 * glassmorphism header, smooth scroll, modern bubble layout
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
import { BotIcon, AlertTriangleIcon } from '@/components/shared/nav-icons';

export function AiChat() {
  const { messages, isLoading, error, sendMessage, clearHistory } = useAiChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isEmpty = messages.length === 0;

  return (
    <>
      <AiDisclaimerModal />

      <div className="flex flex-col h-full">
        {/* Header — glassmorphism */}
        <div
          className="flex items-center justify-between px-4 py-3
          bg-white/80 backdrop-blur-md border-b border-slate-100"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600
              flex items-center justify-center shadow-sm"
            >
              <BotIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-base font-bold text-[#0D1B2A]">ИИ-помощник</p>
              <p className="text-sm text-slate-400">Вопросы о лекарствах и здоровье</p>
            </div>
          </div>

          {!isEmpty && (
            <button
              onClick={clearHistory}
              className="text-sm font-semibold text-slate-400 hover:text-red-500
                transition-colors min-h-[44px] px-3 rounded-lg
                hover:bg-red-50"
              aria-label="Очистить историю чата"
            >
              Очистить
            </button>
          )}
        </div>

        {/* Messages area */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4 med-scroll"
          role="log"
          aria-label="История переписки"
          aria-live="polite"
        >
          {isEmpty ? (
            <div
              className="flex flex-col items-center justify-center h-full text-center
              space-y-5 py-8"
            >
              <div
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600
                flex items-center justify-center shadow-lg shadow-blue-200/40 med-float"
              >
                <BotIcon className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-bold text-[#0D1B2A]">ИИ-помощник</p>
                <p className="text-sm text-slate-500 max-w-xs">
                  Задайте вопрос о ваших лекарствах или здоровье
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
          )}

          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 text-red-600
              text-sm px-4 py-2 bg-red-50 rounded-xl"
            >
              <AlertTriangleIcon className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div ref={messagesEndRef} aria-hidden="true" />
        </div>

        {isEmpty && <ChatSuggestions onSelect={sendMessage} />}

        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </>
  );
}
