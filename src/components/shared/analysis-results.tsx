/**
 * @file analysis-results.tsx
 * @description Компонент отображения AI-анализа корреляций.
 * Загружает данные из /api/analysis/:patientId и показывает паттерны, рекомендации, оценку.
 * @created 2026-02-22
 */

'use client';

import { useState, useCallback } from 'react';
import { AdminLinkIcon, AdminAiIcon } from '@/components/admin/admin-icons';
import { BarChartIcon, AlertTriangleIcon } from '@/components/shared/nav-icons';

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

function getPatternIcon(type: string): React.ReactNode {
  if (type === 'correlation')
    return <AdminLinkIcon className="w-5 h-5 text-[#1565C0]" aria-hidden />;
  if (type === 'trend') return <BarChartIcon className="w-5 h-5 text-[#1565C0]" aria-hidden />;
  return <AlertTriangleIcon className="w-5 h-5 text-amber-600" aria-hidden />;
}

function getConfidenceBadge(confidence: string): { text: string; className: string } {
  if (confidence === 'high')
    return { text: 'Высокая', className: 'bg-emerald-100 text-emerald-700' };
  if (confidence === 'medium') return { text: 'Средняя', className: 'bg-amber-100 text-amber-700' };
  return { text: 'Низкая', className: 'bg-slate-100 text-slate-600' };
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
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
          <AdminAiIcon className="w-8 h-8 text-white" aria-hidden />
        </div>
        <h3 className="text-lg font-semibold text-[#212121]">AI-анализ корреляций</h3>
        <p className="text-sm text-slate-500">
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
        <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-200 flex items-center justify-center">
          <AdminAiIcon className="w-8 h-8 text-indigo-400" aria-hidden />
        </div>
        <p className="text-base text-slate-500">Анализирую данные...</p>
        <p className="text-sm text-slate-500">Это может занять 10-20 секунд</p>
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
    <div className="rounded-2xl border border-slate-100 bg-white p-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-[#212121] flex items-center gap-2">
          <AdminAiIcon className="w-5 h-5 text-[#1565C0]" aria-hidden />
          AI-анализ
        </h3>
        <div className="flex items-center gap-2">
          <span className={`text-sm px-3 py-1 rounded-full border ${risk.className}`}>
            {risk.text}
          </span>
          {data.cached && <span className="text-sm text-slate-500">(из кэша)</span>}
        </div>
      </div>

      {/* Общая оценка */}
      <div className="bg-slate-50 rounded-xl p-4">
        <p className="text-base text-[#0D1B2A] leading-relaxed">{data.overallAssessment}</p>
      </div>

      {/* Паттерны */}
      {data.patterns.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-base font-medium text-[#0D1B2A]">Обнаруженные паттерны</h4>
          {data.patterns.map((pattern, i) => {
            const badge = getConfidenceBadge(pattern.confidence);
            return (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-slate-50">
                <span className="flex-shrink-0">{getPatternIcon(pattern.type)}</span>
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-[#0D1B2A] leading-relaxed">{pattern.description}</p>
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
          <h4 className="text-base font-medium text-[#0D1B2A]">Рекомендации</h4>
          <ul className="space-y-2">
            {data.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-600">
                <span className="text-emerald-500 flex-shrink-0">✓</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Дисклеймер */}
      <p className="text-sm text-slate-400 pt-2 border-t border-slate-100">
        Это предварительный AI-анализ, а не медицинский диагноз. Обсудите результаты с вашим лечащим
        врачом.
      </p>

      {/* Кнопка обновления */}
      <button
        onClick={runAnalysis}
        disabled={loading}
        className="w-full py-3 rounded-xl border border-slate-200 text-sm text-slate-500
          hover:bg-slate-50 transition-colors disabled:opacity-50"
      >
        {loading ? 'Анализирую...' : 'Обновить анализ'}
      </button>
    </div>
  );
}
