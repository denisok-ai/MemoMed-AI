/**
 * @file page.tsx
 * @description Управление prompt-шаблонами для AI-чата в админ-панели
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import { prisma } from '@/lib/db/prisma';
import { PromptEditor } from '@/components/admin/prompt-editor';

export const metadata: Metadata = {
  title: 'Промпты — Админ — MemoMed AI',
};

export default async function AdminPromptsPage() {
  const prompts = await prisma.promptTemplate.findMany({
    orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#212121]">Промпты AI</h1>
        <p className="text-sm text-[#9e9e9e]">Управление системными промптами для DeepSeek</p>
      </div>

      {prompts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
          <p className="text-4xl mb-4">🤖</p>
          <p className="text-lg font-medium text-[#212121]">Нет сохранённых промптов</p>
          <p className="text-sm text-[#757575] mt-2">
            Промпты создаются автоматически или через интерфейс ниже
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {prompts.map((prompt) => (
            <PromptEditor key={prompt.id} prompt={prompt} />
          ))}
        </div>
      )}
    </div>
  );
}
