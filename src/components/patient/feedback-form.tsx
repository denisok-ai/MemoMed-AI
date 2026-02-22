/**
 * @file feedback-form.tsx
 * @description Форма отзыва о лекарстве с оценкой эффективности и AI-анализом побочных эффектов.
 * @created 2026-02-22
 */

'use client';

import { useState, useTransition } from 'react';
import type { FeedbackAnalysis } from '@/lib/ai/feedback-analyzer';
import {
  CheckIcon,
  LockIcon,
  BotIcon,
  AlertTriangleIcon,
  StarIcon,
} from '@/components/shared/nav-icons';

interface FeedbackFormProps {
  medicationId: string;
  medicationName: string;
  dosage: string;
  onClose?: () => void;
}

const EFFECTIVENESS_LABELS: Record<number, string> = {
  1: 'Не помогает',
  2: 'Слабый эффект',
  3: 'Умеренный эффект',
  4: 'Хороший эффект',
  5: 'Отличный эффект',
};

/** Количество звёзд для каждой оценки эффективности */
const EFFECTIVENESS_STARS: Record<number, number> = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
};

const COMMON_SIDE_EFFECTS = [
  'Тошнота',
  'Головная боль',
  'Головокружение',
  'Слабость',
  'Сухость во рту',
  'Проблемы со сном',
  'Расстройство желудка',
  'Сыпь',
];

export function FeedbackForm({ medicationId, medicationName, dosage, onClose }: FeedbackFormProps) {
  const [isPending, startTransition] = useTransition();
  const [effectiveness, setEffectiveness] = useState<number | null>(null);
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    analysis: FeedbackAnalysis | null;
    warning: string | null;
  } | null>(null);

  function toggleEffect(effect: string) {
    setSelectedEffects((prev) =>
      prev.includes(effect) ? prev.filter((e) => e !== effect) : [...prev, effect]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicationId,
          effectivenessScore: effectiveness,
          sideEffects: selectedEffects.length > 0 ? selectedEffects.join(', ') : null,
          freeText: freeText || null,
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        data?: { aiAnalysis: FeedbackAnalysis | null; warning: string | null };
      };

      if (!res.ok) {
        setError(data.error ?? 'Ошибка сохранения');
        return;
      }

      setResult({
        analysis: data.data?.aiAnalysis ?? null,
        warning: data.data?.warning ?? null,
      });
    });
  }

  // Показываем результат AI-анализа
  if (result) {
    const { analysis, warning } = result;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
            <CheckIcon className="w-8 h-8 text-white" aria-hidden />
          </div>
          <h3 className="text-xl font-bold text-[#212121] mt-3">Отзыв сохранён</h3>
        </div>

        {warning && (
          <div className="bg-[#fff8e1] border border-[#ffa726] rounded-2xl p-4">
            <p className="text-[#e65100] font-medium">{warning}</p>
          </div>
        )}

        {analysis && (
          <div className="space-y-4">
            {analysis.sideEffects.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-2">
                  Выявленные побочные эффекты:
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysis.sideEffects.map((effect) => (
                    <span
                      key={effect}
                      className="px-3 py-1 bg-[#ffebee] text-[#c62828] rounded-full text-sm"
                    >
                      {effect}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {analysis.positiveEffects.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-2">Положительные эффекты:</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.positiveEffects.map((effect) => (
                    <span
                      key={effect}
                      className="px-3 py-1 bg-[#e8f5e9] text-[#2e7d32] rounded-full text-sm"
                    >
                      {effect}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[#f5f5f5] rounded-2xl p-4">
              <p className="text-sm text-slate-500">
                <strong>AI-заключение:</strong> {analysis.anonymizedSummary}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-4 text-base font-semibold text-white bg-[#1565C0]
            rounded-2xl hover:bg-[#0D47A1] transition-colors min-h-[56px]"
        >
          Закрыть
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-[#212121]">Отзыв о лекарстве</h3>
        <p className="text-slate-500 mt-1">
          {medicationName} · {dosage}
        </p>
      </div>

      {/* Оценка эффективности */}
      <div className="space-y-3">
        <p className="text-base font-semibold text-[#212121]">Эффективность</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              type="button"
              onClick={() => setEffectiveness(score)}
              className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-0.5 transition-all
                ${
                  effectiveness === score
                    ? 'bg-[#1565C0] text-white shadow-md scale-105'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-400'
                }`}
              aria-label={EFFECTIVENESS_LABELS[score]}
              aria-pressed={effectiveness === score}
            >
              {Array.from({ length: EFFECTIVENESS_STARS[score] }).map((_, i) => (
                <StarIcon key={i} className="w-5 h-5" aria-hidden />
              ))}
            </button>
          ))}
        </div>
        {effectiveness && (
          <p className="text-sm text-center text-[#1565C0] font-medium">
            {EFFECTIVENESS_LABELS[effectiveness]}
          </p>
        )}
      </div>

      {/* Побочные эффекты — чекбоксы */}
      <div className="space-y-3">
        <p className="text-base font-semibold text-[#212121]">
          Побочные эффекты <span className="text-slate-500 font-normal">(если есть)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {COMMON_SIDE_EFFECTS.map((effect) => (
            <button
              key={effect}
              type="button"
              onClick={() => toggleEffect(effect)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                ${
                  selectedEffects.includes(effect)
                    ? 'bg-[#ffebee] text-[#c62828] border border-[#ef9a9a]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              aria-pressed={selectedEffects.includes(effect)}
            >
              {selectedEffects.includes(effect) ? '✓ ' : ''}
              {effect}
            </button>
          ))}
        </div>
      </div>

      {/* Свободный текст */}
      <div className="space-y-2">
        <label htmlFor="feedbackText" className="text-base font-semibold text-[#212121]">
          Дополнительно <span className="text-slate-500 font-normal">(необязательно)</span>
        </label>
        <textarea
          id="feedbackText"
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="Расскажите подробнее о вашем опыте с этим лекарством..."
          maxLength={2000}
          rows={4}
          className="w-full px-4 py-3 text-base rounded-2xl border border-slate-200
            focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#E3F2FD]
            resize-none transition-colors"
        />
        <p className="text-sm text-slate-500 text-right">{freeText.length}/2000</p>
      </div>

      <div className="bg-[#e8f5e9] rounded-2xl p-4 flex items-start gap-2">
        <LockIcon className="w-4 h-4 shrink-0 mt-0.5 text-[#2e7d32]" aria-hidden />
        <p className="text-sm text-[#2e7d32]">
          Ваши данные анонимизируются перед анализом. Они помогают улучшить помощь другим пациентам.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-[#f44336] flex items-center gap-2">
          <AlertTriangleIcon className="w-4 h-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-4 text-lg font-semibold text-white bg-[#1565C0]
          rounded-2xl hover:bg-[#0D47A1] transition-colors min-h-[56px]
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <BotIcon className="w-5 h-5 inline-block mr-2 -mt-0.5" aria-hidden />
            AI анализирует...
          </>
        ) : (
          'Отправить отзыв'
        )}
      </button>
    </form>
  );
}
