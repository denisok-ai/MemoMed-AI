/**
 * @file page.tsx
 * @description Страница AI-чата — встраивает компонент AiChat
 * @dependencies AiChat
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import { AiChat } from '@/components/chat/ai-chat';

export const metadata: Metadata = {
  title: 'ИИ-помощник — MemoMed AI',
};

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-4rem-5rem)] md:h-[calc(100vh-4rem)] flex flex-col">
      <AiChat />
    </div>
  );
}
