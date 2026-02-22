/**
 * @file page.tsx
 * @description Редактирование LLM провайдера
 * @dependencies prisma, llm.actions
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { updateLlmProviderAction } from '@/lib/admin/llm.actions';

export const metadata: Metadata = {
  title: 'Редактировать LLM — Админ — MemoMed AI',
};

export default async function EditLlmProviderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const provider = await prisma.llmProvider.findUnique({ where: { id } });
  if (!provider) notFound();

  const action = updateLlmProviderAction.bind(null, id);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <a
          href="/admin/llm"
          className="text-[#9e9e9e] hover:text-[#1565C0] text-sm transition-colors"
        >
          ← Провайдеры
        </a>
        <span className="text-[#bdbdbd]">/</span>
        <h1 className="text-xl font-bold text-[#212121]">Редактировать: {provider.name}</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <form action={action} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#757575] mb-1">Название *</label>
              <input
                name="name"
                required
                defaultValue={provider.name}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm
                  text-[#212121] focus:outline-none focus:border-[#1565C0] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs text-[#757575] mb-1">Модель *</label>
              <input
                name="model"
                required
                defaultValue={provider.model}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm
                  font-mono text-[#212121] focus:outline-none focus:border-[#1565C0] focus:bg-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-[#757575] mb-1">Base URL *</label>
              <input
                name="baseUrl"
                required
                type="url"
                defaultValue={provider.baseUrl}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm
                  font-mono text-[#212121] focus:outline-none focus:border-[#1565C0] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs text-[#757575] mb-1">
                Новый API ключ (оставьте пустым чтобы не менять)
              </label>
              <input
                name="apiKey"
                type="password"
                placeholder={provider.apiKeyHash ? `Текущий: sk-${provider.apiKeyHash}` : 'sk-...'}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm
                  font-mono text-[#212121] focus:outline-none focus:border-[#1565C0] focus:bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#757575] mb-1">Temperature</label>
                <input
                  name="temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  defaultValue={provider.temperature}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm
                    font-mono text-[#212121] focus:outline-none focus:border-[#1565C0] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs text-[#757575] mb-1">Max Tokens</label>
                <input
                  name="maxTokens"
                  type="number"
                  step="100"
                  min="100"
                  defaultValue={provider.maxTokens}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm
                    font-mono text-[#212121] focus:outline-none focus:border-[#1565C0] focus:bg-white"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-[#757575] mb-1">Заметки</label>
              <textarea
                name="notes"
                rows={2}
                defaultValue={provider.notes ?? ''}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm
                  text-[#212121] focus:outline-none focus:border-[#1565C0] focus:bg-white resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-sm
                font-semibold rounded-xl transition-colors"
            >
              Сохранить
            </button>
            <a
              href="/admin/llm"
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#424242] text-sm
                font-semibold rounded-xl transition-colors"
            >
              Отмена
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
