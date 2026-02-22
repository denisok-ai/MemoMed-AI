/**
 * @file download-report-button.tsx
 * @description Кнопка для скачивания PDF-отчёта для врача.
 * Показывает прогресс и обрабатывает ошибки.
 * @created 2026-02-22
 */

'use client';

import { useState } from 'react';
import { DownloadIcon, AlertTriangleIcon } from '@/components/shared/nav-icons';

interface DownloadReportButtonProps {
  patientId: string;
  period?: '30d' | '90d' | '180d';
  label?: string;
  /** Компактный вариант для встроенного отображения */
  compact?: boolean;
}

const PERIOD_LABELS: Record<string, string> = {
  '30d': '30 дней',
  '90d': '3 месяца',
  '180d': '6 месяцев',
};

export function DownloadReportButton({
  patientId,
  period = '30d',
  label,
  compact = false,
}: DownloadReportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/reports/${patientId}?period=${period}`);

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? 'Ошибка генерации отчёта');
      }

      // Скачиваем PDF
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `memomed-report-${period}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleDownload}
        disabled={isLoading}
        className={`flex items-center gap-2 text-white bg-[#1565C0] rounded-2xl hover:bg-[#0D47A1]
          transition-colors disabled:opacity-50
          ${compact ? 'px-4 py-2.5 text-sm font-semibold min-h-[44px]' : 'px-6 py-4 text-base font-semibold min-h-[56px] gap-3'}`}
        aria-label={`Скачать PDF-отчёт за ${PERIOD_LABELS[period]}`}
      >
        {isLoading ? (
          <>
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Генерируется...
          </>
        ) : (
          <>
            <DownloadIcon className="w-5 h-5 shrink-0" aria-hidden />
            {label ?? `Отчёт для врача (${PERIOD_LABELS[period]})`}
          </>
        )}
      </button>

      {error && (
        <p role="alert" className="text-sm text-[#f44336] flex items-center gap-2">
          <AlertTriangleIcon className="w-4 h-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}
