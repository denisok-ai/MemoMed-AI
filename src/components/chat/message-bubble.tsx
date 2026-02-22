/**
 * @file message-bubble.tsx
 * @description Пузырь сообщения чата с поддержкой markdown и анимации печати
 * @created 2026-02-22
 */

import type { ChatMessage } from '@/hooks/use-ai-chat';
import { BotIcon } from '@/components/shared/nav-icons';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-3`}
      aria-label={`${isUser ? 'Вы' : 'ИИ-помощник'}: ${message.content}`}
    >
      {/* Аватар ИИ */}
      {!isUser && (
        <div
          className="w-9 h-9 rounded-full bg-[#1565C0] flex items-center justify-center
            flex-shrink-0 mt-1"
          aria-hidden="true"
        >
          <BotIcon className="w-5 h-5 text-white" />
        </div>
      )}

      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl space-y-1 ${
          isUser
            ? 'bg-[#1565C0] text-white rounded-br-sm'
            : 'bg-[#f5f5f5] text-[#212121] rounded-bl-sm'
        }`}
      >
        {/* Форматируем текст: разбиваем по абзацам */}
        {message.content.split('\n\n').map((paragraph, i) => {
          // Дисклеймер рендерим особо
          if (paragraph.startsWith('---')) {
            return (
              <p
                key={i}
                className="text-sm text-slate-500 italic border-t border-slate-200 pt-2 mt-2"
              >
                {paragraph.replace(/^---\n/, '').replace(/_/g, '')}
              </p>
            );
          }
          return (
            <p key={i} className="text-base leading-relaxed whitespace-pre-wrap">
              {paragraph}
            </p>
          );
        })}

        {/* Анимация печати */}
        {message.isStreaming && (
          <span className="inline-flex gap-1 ml-1" aria-label="ИИ печатает">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
                aria-hidden="true"
              />
            ))}
          </span>
        )}
      </div>
    </div>
  );
}
