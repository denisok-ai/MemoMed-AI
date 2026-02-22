/**
 * @file journal-form.tsx
 * @description Форма ежедневного дневника самочувствия.
 * Ползунки 1-5 для настроения, боли, сна, энергии + свободный текст.
 * Сохраняет в IndexedDB при офлайне, синхронизирует при восстановлении сети.
 * @created 2026-02-22
 */

'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangleIcon, CheckIcon, XIcon } from '@/components/shared/nav-icons';

interface JournalFormProps {
  date: string; // YYYY-MM-DD
  initialData?: {
    moodScore: number | null;
    painLevel: number | null;
    sleepQuality: number | null;
    energyLevel: number | null;
    freeText: string | null;
  };
}

interface ScoreField {
  key: 'moodScore' | 'painLevel' | 'sleepQuality' | 'energyLevel';
  label: string;
  /** Что означает высокий балл — хорошо или плохо */
  highIsGood: boolean;
}

const SCORE_FIELDS: ScoreField[] = [
  { key: 'moodScore', label: 'Настроение', highIsGood: true },
  { key: 'painLevel', label: 'Боль', highIsGood: false },
  { key: 'sleepQuality', label: 'Сон', highIsGood: true },
  { key: 'energyLevel', label: 'Энергия', highIsGood: true },
];

/** Цвет ползунка в зависимости от значения и направления */
function getSliderColor(value: number, highIsGood: boolean): string {
  const good = highIsGood ? value >= 4 : value <= 2;
  const bad = highIsGood ? value <= 2 : value >= 4;
  if (good) return 'var(--color-success)';
  if (bad) return 'var(--color-error)';
  return 'var(--color-warning)';
}

/** Форматирует дату для отображения */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function JournalForm({ date, initialData }: JournalFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [scores, setScores] = useState({
    moodScore: initialData?.moodScore ?? null,
    painLevel: initialData?.painLevel ?? null,
    sleepQuality: initialData?.sleepQuality ?? null,
    energyLevel: initialData?.energyLevel ?? null,
  });

  const [freeText, setFreeText] = useState(initialData?.freeText ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  async function saveOffline() {
    const { getDB } = await import('@/lib/db/indexeddb');
    const db = getDB();
    await db.journal.put({
      logDate: date,
      moodScore: scores.moodScore,
      painLevel: scores.painLevel,
      sleepQuality: scores.sleepQuality,
      energyLevel: scores.energyLevel,
      freeText: freeText || null,
      syncStatus: 'pending',
      updatedAt: Date.now(),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (isOffline) {
      await saveOffline();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/journal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            logDate: date,
            ...scores,
            freeText: freeText || null,
          }),
        });

        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          setError(data.error ?? 'Ошибка сохранения');
          return;
        }

        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        router.refresh();
      } catch {
        // При сетевой ошибке сохраняем офлайн
        await saveOffline();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Заголовок с датой */}
      <div>
        <p className="text-sm text-slate-500 capitalize">{formatDate(date)}</p>
        {isOffline && (
          <p className="mt-1 text-sm text-[#ffa726] flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ffa726] animate-pulse" aria-hidden />
            Офлайн — запись сохранится локально
          </p>
        )}
      </div>

      {/* Ползунки для метрик */}
      <div className="space-y-6">
        {SCORE_FIELDS.map(({ key, label, highIsGood }) => {
          const value = scores[key];
          const color = value ? getSliderColor(value, highIsGood) : '#94a3b8';

          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor={key} className="text-base font-medium text-[#212121]">
                  {label}
                </label>
                <span className="flex gap-0.5" aria-label={`${label}: ${value ?? 'не задано'}`}>
                  {value
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className="w-2 h-2 rounded-full transition-colors"
                          style={{
                            backgroundColor: i < value ? color : '#e2e8f0',
                          }}
                        />
                      ))
                    : '—'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500 w-3">1</span>
                <input
                  id={key}
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={value ?? 3}
                  onChange={(e) =>
                    setScores((prev) => ({ ...prev, [key]: parseInt(e.target.value) }))
                  }
                  className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: color }}
                  aria-valuemin={1}
                  aria-valuemax={5}
                  aria-valuenow={value ?? undefined}
                />
                <span className="text-sm text-slate-500 w-3">5</span>

                {/* Кнопка сброса */}
                {value !== null && (
                  <button
                    type="button"
                    onClick={() => setScores((prev) => ({ ...prev, [key]: null }))}
                    className="text-slate-400 hover:text-slate-500 text-sm"
                    aria-label={`Сбросить ${label}`}
                  >
                    <XIcon className="w-4 h-4 text-slate-400" aria-hidden />
                  </button>
                )}
              </div>

              {/* Значение */}
              {value && (
                <div className="flex justify-between text-sm text-slate-500">
                  {highIsGood ? (
                    <>
                      <span>плохо</span>
                      <span>отлично</span>
                    </>
                  ) : (
                    <>
                      <span>нет боли</span>
                      <span>сильная боль</span>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Свободный текст */}
      <div className="space-y-2">
        <label htmlFor="freeText" className="text-base font-medium text-[#212121]">
          Заметки (необязательно)
        </label>
        <textarea
          id="freeText"
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="Как вы себя чувствуете? Что произошло сегодня?"
          maxLength={2000}
          rows={4}
          className="w-full px-4 py-3 text-base rounded-2xl border border-slate-200
            focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#E3F2FD]
            resize-none transition-colors"
        />
        <p className="text-sm text-slate-500 text-right">{freeText.length}/2000</p>
      </div>

      {/* Сообщения */}
      {error && (
        <p role="alert" className="text-sm text-[#f44336] flex items-center gap-2">
          <AlertTriangleIcon className="w-4 h-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="text-sm text-[#4caf50] flex items-center gap-2">
          <CheckIcon className="w-4 h-4 shrink-0" aria-hidden />
          {isOffline ? 'Сохранено офлайн' : 'Запись сохранена'}
        </p>
      )}

      {/* Кнопка сохранения */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-4 text-lg font-semibold text-white bg-[#1565C0]
          rounded-2xl hover:bg-[#0D47A1] transition-colors min-h-[56px]
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Сохраняю...' : 'Сохранить запись'}
      </button>
    </form>
  );
}
