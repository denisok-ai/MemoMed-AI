/**
 * @file prompt-editor.tsx
 * @description Клиентский компонент редактирования prompt-шаблона (CRUD)
 * Модель PromptTemplate имеет блоки: personaBlock, contextBlock, taskBlock
 * @created 2026-02-22
 */

'use client';

import { useState, useTransition } from 'react';
import type { PromptTemplate } from '@prisma/client';
import { updatePromptAction, deletePromptAction } from '@/lib/admin/prompt.actions';

interface PromptEditorProps {
  prompt: PromptTemplate;
}

const statusLabels: Record<string, { label: string; className: string }> = {
  active: { label: 'Активен', className: 'bg-green-50 text-green-700' },
  draft: { label: 'Черновик', className: 'bg-yellow-50 text-yellow-700' },
  archived: { label: 'Архив', className: 'bg-gray-100 text-gray-500' },
};

export function PromptEditor({ prompt }: PromptEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [personaBlock, setPersonaBlock] = useState(prompt.personaBlock);
  const [contextBlock, setContextBlock] = useState(prompt.contextBlock);
  const [taskBlock, setTaskBlock] = useState(prompt.taskBlock);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await updatePromptAction(prompt.id, { personaBlock, contextBlock, taskBlock });
      if (result.error) {
        setError(result.error);
      } else {
        setIsEditing(false);
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Удалить промпт "${prompt.name}"?`)) return;
    startTransition(async () => {
      await deletePromptAction(prompt.id);
    });
  }

  const statusInfo = statusLabels[prompt.status] ?? statusLabels.draft;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[#212121]">{prompt.name}</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo.className}`}
            >
              {statusInfo.label}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              {prompt.category}
            </span>
          </div>
          <p className="text-xs text-[#9e9e9e] mt-0.5">
            v{prompt.version} · обновлён {new Date(prompt.updatedAt).toLocaleDateString('ru')}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-sm text-[#1565C0] hover:underline"
          >
            {isEditing ? 'Отмена' : 'Редактировать'}
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-sm text-red-400 hover:text-red-600 transition-colors"
          >
            Удалить
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          {[
            { label: 'Персона (persona)', value: personaBlock, onChange: setPersonaBlock },
            { label: 'Контекст (context)', value: contextBlock, onChange: setContextBlock },
            { label: 'Задача (task)', value: taskBlock, onChange: setTaskBlock },
          ].map(({ label, value, onChange }) => (
            <div key={label} className="space-y-1">
              <label className="text-xs font-medium text-[#757575]">{label}</label>
              <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 text-sm font-mono border-2 border-gray-200 rounded-xl
                  focus:border-[#1565C0] focus:outline-none resize-y transition-colors"
              />
            </div>
          ))}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-5 py-2 bg-[#1565C0] text-white rounded-xl text-sm font-medium
              hover:bg-[#6d4dae] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {[
            { label: 'Персона', value: prompt.personaBlock },
            { label: 'Контекст', value: prompt.contextBlock },
            { label: 'Задача', value: prompt.taskBlock },
          ].map(({ label, value }) => (
            <details key={label} className="group">
              <summary className="cursor-pointer text-sm font-medium text-[#757575] hover:text-[#1565C0] py-1">
                {label}
              </summary>
              <pre
                className="text-sm text-[#424242] bg-gray-50 rounded-xl p-3 mt-1
                overflow-x-auto whitespace-pre-wrap font-mono max-h-32 overflow-y-auto"
              >
                {value || '—'}
              </pre>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
