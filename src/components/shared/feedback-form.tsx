/**
 * @file feedback-form.tsx
 * @description Форма отзыва о лекарстве в стиле MedTech:
 * выбор препарата, звёздная оценка, поля побочных эффектов и комментария.
 * @created 2026-02-22
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PillIcon, CheckIcon, AlertTriangleIcon, LockIcon } from './nav-icons';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  scheduledTime: string;
}

interface FeedbackFormProps {
  medications: Medication[];
}

const STAR_LABELS = [
  '',
  'Не помогает',
  'Слабый эффект',
  'Умеренный эффект',
  'Хороший эффект',
  'Отличный эффект',
];

export function FeedbackForm({ medications }: FeedbackFormProps) {
  const t = useTranslations('feedback');
  const [selectedMedId, setSelectedMedId] = useState(medications[0]?.id ?? '');
  const [effectiveness, setEffectiveness] = useState<number | null>(null);
  const [sideEffects, setSideEffects] = useState('');
  const [freeText, setFreeText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMedId) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicationId: selectedMedId,
          effectivenessScore: effectiveness,
          sideEffects: sideEffects.trim() || null,
          freeText: freeText.trim() || null,
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Ошибка отправки');

      setSuccess(true);
      setEffectiveness(null);
      setSideEffects('');
      setFreeText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки отзыва');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl border border-slate-100
      shadow-sm overflow-hidden"
    >
      {/* Заголовок формы */}
      <div className="px-6 py-5 border-b border-slate-50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <PillIcon className="w-5 h-5 text-[#1565C0]" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#0D1B2A]">Оставить отзыв</h2>
          <p className="text-sm text-[#475569]">Оценка помогает врачу скорректировать лечение</p>
        </div>
      </div>

      <div className="px-6 py-5 space-y-6">
        {/* Сообщение об успехе */}
        {success && (
          <div
            className="flex items-start gap-3 p-4 bg-green-50 border border-green-100
            rounded-2xl"
          >
            <div
              className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center
              flex-shrink-0 mt-0.5"
            >
              <CheckIcon className="w-3.5 h-3.5 text-green-600" />
            </div>
            <p className="text-green-800 font-medium">{t('success')}</p>
          </div>
        )}

        {/* Сообщение об ошибке */}
        {error && (
          <div
            className="flex items-start gap-3 p-4 bg-red-50 border border-red-100
            rounded-2xl"
          >
            <AlertTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Выбор лекарства */}
        <div className="space-y-2">
          <label htmlFor="medication" className="med-label">
            {t('selectMedication')}
          </label>
          <select
            id="medication"
            value={selectedMedId}
            onChange={(e) => setSelectedMedId(e.target.value)}
            className="med-input"
          >
            {medications.map((med) => (
              <option key={med.id} value={med.id}>
                {med.name} — {med.dosage}
              </option>
            ))}
          </select>
        </div>

        {/* Оценка эффективности */}
        <div className="space-y-3">
          <p className="med-label">{t('effectiveness')}</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const isSelected = effectiveness !== null && star <= effectiveness;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setEffectiveness(effectiveness === star ? null : star)}
                  className={`flex-1 h-12 rounded-xl text-xl font-bold transition-all
                    border-2 ${
                      isSelected
                        ? 'bg-amber-50 border-amber-400 text-amber-500 scale-105 shadow-sm'
                        : 'bg-slate-50 border-transparent text-slate-200 hover:border-amber-200 hover:text-amber-300'
                    }`}
                  aria-label={`${star} из 5: ${STAR_LABELS[star]}`}
                  aria-pressed={isSelected}
                >
                  ★
                </button>
              );
            })}
          </div>
          {effectiveness !== null && (
            <p className="text-sm font-semibold text-amber-600 text-center">
              {STAR_LABELS[effectiveness]}
            </p>
          )}
        </div>

        {/* Побочные эффекты */}
        <div className="space-y-2">
          <label htmlFor="sideEffects" className="med-label">
            {t('sideEffects')}{' '}
            <span className="text-[#94A3B8] font-normal normal-case text-sm">{t('optional')}</span>
          </label>
          <input
            id="sideEffects"
            type="text"
            value={sideEffects}
            onChange={(e) => setSideEffects(e.target.value)}
            maxLength={500}
            placeholder={t('sideEffectsHint')}
            className="med-input"
          />
        </div>

        {/* Свободный комментарий */}
        <div className="space-y-2">
          <label htmlFor="freeText" className="med-label">
            {t('comment')}{' '}
            <span className="text-[#94A3B8] font-normal normal-case text-sm">{t('optional')}</span>
          </label>
          <textarea
            id="freeText"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            maxLength={2000}
            rows={3}
            placeholder={t('commentHint')}
            className="med-input resize-none"
          />
          <p className="text-sm text-[#94A3B8] text-right">{freeText.length}/2000</p>
        </div>

        {/* Дисклеймер конфиденциальности */}
        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <LockIcon className="w-4 h-4 text-[#1565C0] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#475569] leading-relaxed">{t('privacy')}</p>
        </div>

        {/* Кнопка отправки */}
        <button
          type="submit"
          disabled={isSubmitting || !selectedMedId}
          className="w-full min-h-[52px] text-base font-bold text-white bg-[#1565C0]
            rounded-2xl hover:bg-[#0D47A1] disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors shadow-sm shadow-blue-200
            flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span
                className="w-4 h-4 border-2 border-white/30 border-t-white
                rounded-full animate-spin"
              />
              {t('submitting')}
            </>
          ) : (
            t('submit')
          )}
        </button>
      </div>
    </form>
  );
}
