/**
 * @file page.tsx
 * @description Управление prompt-шаблонами для AI-чата в админ-панели
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import { prisma } from '@/lib/db/prisma';
import { PromptEditor } from '@/components/admin/prompt-editor';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { AdminAiIcon } from '@/components/admin/admin-icons';

export const metadata: Metadata = {
  title: 'Промпты — Админ — MemoMed AI',
};

const PAGE_SIZE = 10;

export default async function AdminPromptsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1'));
  const skip = (page - 1) * PAGE_SIZE;

  const [prompts, total] = await Promise.all([
    prisma.promptTemplate.findMany({
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
      take: PAGE_SIZE,
      skip,
    }),
    prisma.promptTemplate.count(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#212121]">Промпты AI</h1>
        <p className="text-sm text-slate-500">Управление системными промптами для DeepSeek</p>
      </div>

      {prompts.length === 0 ? (
        <div className="med-card p-10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
            <AdminAiIcon className="w-8 h-8 text-white" aria-hidden />
          </div>
          <p className="text-lg font-medium text-[#0D1B2A]">Нет сохранённых промптов</p>
          <p className="text-sm text-slate-500 mt-2">
            Промпты создаются автоматически или через интерфейс ниже
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {prompts.map((prompt) => (
            <PromptEditor key={prompt.id} prompt={prompt} />
          ))}
          <AdminPagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={PAGE_SIZE}
            buildHref={(p) => `/admin/prompts?page=${p}`}
          />
        </div>
      )}
    </div>
  );
}
