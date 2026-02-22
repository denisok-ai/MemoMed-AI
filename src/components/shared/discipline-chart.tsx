/**
 * @file discipline-chart.tsx
 * @description SVG-график тренда дисциплины приёма лекарств (столбчатая диаграмма).
 * Не использует внешних зависимостей — чистый SVG.
 * @created 2026-02-22
 */

'use client';

import { useMemo, useState } from 'react';

interface DailyData {
  date: string;
  total: number;
  taken: number;
  missed: number;
  percentage: number;
}

interface DisciplineChartProps {
  data: DailyData[];
}

function getBarColor(percentage: number): string {
  if (percentage >= 90) return '#10b981';
  if (percentage >= 70) return '#f59e0b';
  if (percentage > 0) return '#ef4444';
  return '#e5e7eb';
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }).replace('.', '');
}

export function DisciplineChart({ data }: DisciplineChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartData = useMemo(() => {
    const last30 = data.slice(-30);
    return last30;
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center">
        <p className="text-slate-500 text-lg">Нет данных для отображения графика</p>
      </div>
    );
  }

  const svgWidth = 600;
  const svgHeight = 200;
  const padding = { top: 20, right: 10, bottom: 40, left: 35 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;
  const barWidth = Math.max(4, Math.min(14, chartWidth / chartData.length - 2));
  const barGap = (chartWidth - barWidth * chartData.length) / (chartData.length - 1 || 1);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 md:p-6">
      <h3 className="text-lg font-semibold text-[#212121] mb-4">Тренд дисциплины</h3>

      <div className="relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto"
          role="img"
          aria-label="График тренда дисциплины приёма лекарств"
        >
          {/* Горизонтальные линии сетки */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = padding.top + chartHeight - (val / 100) * chartHeight;
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  stroke="#f3f4f6"
                  strokeWidth={1}
                />
                <text x={padding.left - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#9ca3af">
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Столбцы */}
          {chartData.map((day, i) => {
            const x = padding.left + i * (barWidth + barGap);
            const barHeight = (day.percentage / 100) * chartHeight;
            const y = padding.top + chartHeight - barHeight;
            const isHovered = hoveredIndex === i;

            return (
              <g
                key={day.date}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Невидимая зона клика */}
                <rect
                  x={x - 2}
                  y={padding.top}
                  width={barWidth + 4}
                  height={chartHeight}
                  fill="transparent"
                />
                {/* Столбец */}
                <rect
                  x={x}
                  y={day.percentage > 0 ? y : padding.top + chartHeight - 2}
                  width={barWidth}
                  height={day.percentage > 0 ? barHeight : 2}
                  rx={Math.min(barWidth / 2, 3)}
                  fill={getBarColor(day.percentage)}
                  opacity={isHovered ? 1 : 0.85}
                  className="transition-opacity duration-150"
                />

                {/* Подпись даты (каждый 5-й день или при наведении) */}
                {(i % 5 === 0 || i === chartData.length - 1 || isHovered) && (
                  <text
                    x={x + barWidth / 2}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    fontSize={9}
                    fill={isHovered ? '#212121' : '#9ca3af'}
                    fontWeight={isHovered ? 600 : 400}
                  >
                    {formatShortDate(day.date)}
                  </text>
                )}

                {/* Тултип при наведении */}
                {isHovered && (
                  <g>
                    <rect
                      x={Math.min(x - 30, svgWidth - padding.right - 80)}
                      y={Math.max(padding.top - 2, y - 36)}
                      width={76}
                      height={30}
                      rx={6}
                      fill="#1f2937"
                      opacity={0.9}
                    />
                    <text
                      x={Math.min(x + barWidth / 2 - 2, svgWidth - padding.right - 42)}
                      y={Math.max(padding.top + 12, y - 18)}
                      textAnchor="middle"
                      fontSize={11}
                      fontWeight={600}
                      fill="white"
                    >
                      {day.percentage}%
                    </text>
                    <text
                      x={Math.min(x + barWidth / 2 - 2, svgWidth - padding.right - 42)}
                      y={Math.max(padding.top + 25, y - 5)}
                      textAnchor="middle"
                      fontSize={9}
                      fill="#d1d5db"
                    >
                      {day.taken}/{day.total}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Легенда */}
      <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> 90-100%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" /> 70-89%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> {'<'}70%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-slate-200 inline-block" /> нет приёмов
        </span>
      </div>
    </div>
  );
}
