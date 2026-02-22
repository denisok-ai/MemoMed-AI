/**
 * @file page.tsx
 * @description Управление LLM провайдерами: DeepSeek, OpenAI, Gemini и др.
 * @dependencies prisma, llm.actions
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import { prisma } from '@/lib/db/prisma';
import {
  activateLlmProviderAction,
  deleteLlmProviderAction,
  createLlmProviderAction,
} from '@/lib/admin/llm.actions';

export const metadata: Metadata = {
  title: 'LLM Провайдеры — Админ — MemoMed AI',
};

const PROVIDER_PRESETS = [
  { name: 'DeepSeek Chat', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  { name: 'DeepSeek Reasoner', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-reasoner' },
  { name: 'OpenAI GPT-4o', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o' },
  { name: 'OpenAI GPT-4o Mini', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  {
    name: 'Gemini 2.0 Flash',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    model: 'gemini-2.0-flash',
  },
  {
    name: 'Qwen Max',
    baseUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-max',
  },
];

export default async function AdminLlmPage() {
  const providers = await prisma.llmProvider.findMany({
    orderBy: [{ isActive: 'desc' }, { createdAt: 'asc' }],
  });

  const activeProvider = providers.find((p) => p.isActive);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">LLM Провайдеры</h1>
          <p className="text-sm text-[#9e9e9e] mt-1">
            Управление AI-моделями. Активный провайдер используется во всех запросах.
          </p>
        </div>
        {activeProvider && (
          <div
            className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200
            rounded-xl text-sm"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-700 font-medium">Активен: {activeProvider.name}</span>
          </div>
        )}
      </div>

      {/* Список провайдеров */}
      <div className="space-y-3">
        {providers.map((p) => (
          <div
            key={p.id}
            className={`bg-white rounded-2xl border-2 p-5 transition-all
              ${p.isActive ? 'border-green-300 shadow-sm shadow-green-50' : 'border-gray-100'}`}
          >
            <div className="flex items-start gap-4">
              {/* Иконка */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center
                text-2xl flex-shrink-0 font-bold
                ${p.isActive ? 'bg-green-50' : 'bg-gray-50'}`}
              >
                🧠
              </div>

              {/* Информация */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-base font-bold text-[#212121]">{p.name}</h3>
                  {p.isActive && (
                    <span
                      className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold
                      rounded-lg"
                    >
                      ✓ АКТИВЕН
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-[#9e9e9e] text-xs">Модель</p>
                    <p className="font-mono font-medium text-[#424242]">{p.model}</p>
                  </div>
                  <div>
                    <p className="text-[#9e9e9e] text-xs">Base URL</p>
                    <p className="font-mono text-xs text-[#757575] truncate">{p.baseUrl}</p>
                  </div>
                  <div>
                    <p className="text-[#9e9e9e] text-xs">Temperature / Max tokens</p>
                    <p className="font-mono font-medium text-[#424242]">
                      {p.temperature} / {p.maxTokens}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#9e9e9e] text-xs">API ключ</p>
                    <p className="font-mono text-[#424242]">
                      {p.apiKeyHash ? `sk-${p.apiKeyHash}` : '— не задан —'}
                    </p>
                  </div>
                </div>

                {p.notes && (
                  <p className="text-sm text-[#757575] bg-gray-50 rounded-xl px-3 py-2">
                    {p.notes}
                  </p>
                )}
              </div>

              {/* Действия */}
              <div className="flex gap-2 flex-shrink-0">
                {!p.isActive && (
                  <form
                    action={
                      activateLlmProviderAction.bind(null, p.id) as unknown as (
                        formData: FormData
                      ) => Promise<void>
                    }
                  >
                    <button
                      type="submit"
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm
                        font-medium rounded-xl transition-colors"
                    >
                      Активировать
                    </button>
                  </form>
                )}
                <a
                  href={`/admin/llm/${p.id}/edit`}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-[#424242] text-sm
                    font-medium rounded-xl transition-colors"
                >
                  Изменить
                </a>
                {!p.isActive && (
                  <form
                    action={
                      deleteLlmProviderAction.bind(null, p.id) as unknown as (
                        formData: FormData
                      ) => Promise<void>
                    }
                  >
                    <button
                      type="submit"
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm
                        font-medium rounded-xl transition-colors"
                    >
                      Удалить
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        ))}

        {providers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-4xl mb-3">🧠</p>
            <p className="text-lg font-medium text-[#212121]">Нет провайдеров</p>
            <p className="text-sm text-[#9e9e9e] mt-1">Добавьте первый LLM провайдер ниже</p>
          </div>
        )}
      </div>

      {/* Информация о текущих настройках из .env */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-2">
        <h3 className="text-sm font-bold text-amber-800">⚠️ Активный API ключ из .env</h3>
        <p className="text-sm text-amber-700">
          Приложение сейчас использует ключ из переменной{' '}
          <code className="bg-amber-100 px-1 rounded font-mono">DEEPSEEK_API_KEY</code> в файле{' '}
          <code className="bg-amber-100 px-1 rounded font-mono">.env</code>. Смена провайдера здесь
          сохраняет настройки в БД для будущей интеграции.
        </p>
        <div className="font-mono text-xs bg-amber-100 rounded-xl p-3 text-amber-800 space-y-1">
          <p>DEEPSEEK_API_KEY=sk-your_key</p>
          <p>DEEPSEEK_BASE_URL=https://api.deepseek.com/v1</p>
          <p>DEEPSEEK_MODEL=deepseek-chat</p>
        </div>
      </div>

      {/* Форма добавления нового провайдера */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h2 className="text-base font-bold text-[#212121]">Добавить провайдер</h2>

        {/* Быстрые пресеты */}
        <div>
          <p className="text-xs text-[#9e9e9e] mb-2">Быстрые пресеты:</p>
          <div className="flex flex-wrap gap-2">
            {PROVIDER_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                data-preset={JSON.stringify(preset)}
                onClick={undefined}
                className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200
                  hover:border-blue-300 text-sm text-[#424242] hover:text-[#1565C0]
                  rounded-xl transition-colors font-mono"
              >
                {preset.model}
              </button>
            ))}
          </div>
        </div>

        <form
          action={createLlmProviderAction as unknown as (formData: FormData) => Promise<void>}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#757575] mb-1">Название *</label>
              <input
                name="name"
                required
                placeholder="DeepSeek Chat"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm
                  text-[#212121] focus:outline-none focus:border-[#1565C0] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs text-[#757575] mb-1">Модель *</label>
              <input
                name="model"
                required
                placeholder="deepseek-chat"
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
                placeholder="https://api.deepseek.com/v1"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm
                  font-mono text-[#212121] focus:outline-none focus:border-[#1565C0] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs text-[#757575] mb-1">
                API Ключ (только для сохранения в маску)
              </label>
              <input
                name="apiKey"
                type="password"
                placeholder="sk-..."
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
                  defaultValue="0.7"
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
                  max="32000"
                  defaultValue="500"
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
                placeholder="Описание, особенности, ограничения..."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm
                  text-[#212121] focus:outline-none focus:border-[#1565C0] focus:bg-white resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-sm
              font-semibold rounded-xl transition-colors"
          >
            Добавить провайдер
          </button>
        </form>
      </div>
    </div>
  );
}
