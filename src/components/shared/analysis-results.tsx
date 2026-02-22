/**
 * @file analysis-results.tsx
 * @description Компонент отображения AI-анализа корреляций.
 * Загружает данные из /api/analysis/:patientId и показывает паттерны, рекомендации, оценку.
 * @created 2026-02-22
 */

'use client';

import { useState, useCallback } from 'react';

interface Pattern {
  type: 'correlation' | 'trend' | 'anomaly';
  description: string;
  confidence: 'high' | 'medium' | 'low';
}

interface AnalysisData {
  patterns: Pattern[];
  recommendations: string[];
  overallAssessment: string;
  riskLevel: 'low' | 'medium' | 'high';
  cached: boolean;
  aiError?: boolean;
}

interface AnalysisResultsProps {
  patientId: string;
}

function getPatternIcon(type: string): string {
  if (type === 'correlation') return '🔗';
  if (type === 'trend') return '📈';
  return '⚠️';
}

function getConfidenceBadge(confidence: string): { text: string; className: string } {
  if (confidence === 'high')
    return { text: 'Высокая', className: 'bg-emerald-100 text-emerald-700' };
  if (confidence === 'medium') return { text: 'Средняя', className: 'bg-amber-100 text-amber-700' };
  return { text: 'Низкая', className: 'bg-gray-100 text-gray-600' };
}

function getRiskBadge(level: string): { text: string; className: string } {
  if (level === 'high')
    return { text: 'Высокий риск', className: 'bg-red-100 text-red-700 border-red-200' };
  if (level === 'medium')
    return { text: 'Средний риск', className: 'bg-amber-100 text-amber-700 border-amber-200' };
  return { text: 'Низкий риск', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
}

export function AnalysisResults({ patientId }: AnalysisResultsProps) {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analysis/${patientId}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Ошибка ${res.status}`);
      }
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка анализа');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  // Начальное состояние — кнопка запуска
  if (!data && !loading && !error) {
    return (
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6 text-center space-y-4">
        <p className="text-4xl">🧠</p>
        <h3 className="text-lg font-semibold text-[#212121]">AI-анализ корреляций</h3>
        <p className="text-sm text-[#757575]">
          ИИ проанализирует связь между приёмом лекарств и вашим самочувствием за 30 дней
        </p>
        <button
          onClick={runAnalysis}
          className="px-6 py-3 rounded-full bg-[#1565C0] text-white font-medium text-base
            hover:bg-[#0D47A1] transition-colors min-h-[48px]"
        >
          Запустить анализ
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6 text-center space-y-3
        animate-pulse"
      >
        <p className="text-4xl">🧠</p>
        <p className="text-base text-[#757575]">Анализирую данные...</p>
        <p className="text-sm text-[#9e9e9e]">Это может занять 10-20 секунд</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-3">
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={runAnalysis}
          className="px-4 py-2 rounded-full bg-red-600 text-white text-sm font-medium
            hover:bg-red-700 transition-colors"
        >
          Повторить
        </button>
      </div>
    );
  }

  if (!data) return null;

  const risk = getRiskBadge(data.riskLevel);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-[#212121]">🧠 AI-анализ</h3>
        <div className="flex items-center gap-2">
          <span className={`text-sm px-3 py-1 rounded-full border ${risk.className}`}>
            {risk.text}
          </span>
          {data.cached && <span className="text-sm text-[#9e9e9e]">(из кэша)</span>}
        </div>
      </div>

      {/* Общая оценка */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-base text-[#424242] leading-relaxed">{data.overallAssessment}</p>
      </div>

      {/* Паттерны */}
      {data.patterns.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-base font-medium text-[#424242]">Обнаруженные паттерны</h4>
          {data.patterns.map((pattern, i) => {
            const badge = getConfidenceBadge(pattern.confidence);
            return (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-gray-50">
                <span className="text-xl flex-shrink-0">{getPatternIcon(pattern.type)}</span>
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-[#424242] leading-relaxed">{pattern.description}</p>
                  <span
                    className={`inline-block text-sm px-2 py-0.5 rounded-full ${badge.className}`}
                  >
                    {badge.text} уверенность
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Рекомендации */}
      {data.recommendations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-base font-medium text-[#424242]">Рекомендации</h4>
          <ul className="space-y-2">
            {data.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-2 text-sm text-[#616161]">
                <span className="text-emerald-500 flex-shrink-0">✓</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Дисклеймер */}
      <p className="text-sm text-[#bdbdbd] pt-2 border-t border-gray-100">
        ⚕️ Это предварительный AI-анализ, а не медицинский диагноз. Обсудите результаты с вашим
        лечащим врачом.
      </p>

      {/* Кнопка обновления */}
      <button
        onClick={runAnalysis}
        disabled={loading}
        className="w-full py-3 rounded-xl border border-gray-200 text-sm text-[#757575]
          hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        {loading ? 'Анализирую...' : 'Обновить анализ'}
      </button>
    </div>
  );
}
