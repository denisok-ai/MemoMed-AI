/**
 * @file calendar-view.tsx
 * @description Визуальный календарь дисциплины: месячная сетка с цветными ячейками.
 * Зелёный — 100% дисциплина, жёлтый — 1-2 пропуска, красный — 3+ пропуска.
 * Клик по дню открывает детализацию.
 * @created 2026-02-22
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

type DayColor = 'green' | 'yellow' | 'red' | 'empty';

interface DayData {
  date: string;
  color: DayColor;
  takenCount: number;
  totalCount: number;
  missedCount: number;
  disciplinePercent: number;
}

interface CalendarData {
  days: Record<string, DayData>;
  stats: {
    disciplinePercent: number;
    totalDays: number;
    perfectDays: number;
    missedDays: number;
    longestStreak: number;
    currentStreak: number;
  };
}

interface CalendarViewProps {
  patientId: string;
}

const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const MONTH_NAMES = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

const colorStyles: Record<DayColor, string> = {
  green: 'bg-[#4caf50] text-white',
  yellow: 'bg-[#ff9800] text-white',
  red: 'bg-[#f44336] text-white',
  empty: 'bg-slate-100 text-slate-500',
};

export function CalendarView({ patientId }: CalendarViewProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [data, setData] = useState<CalendarData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

  const loadCalendar = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/calendar/${patientId}?month=${monthKey}`);
      if (!res.ok) return;
      const json = (await res.json()) as { data: CalendarData };
      setData(json.data);
    } finally {
      setIsLoading(false);
    }
  }, [patientId, monthKey]);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  // Вычисляем первый день недели (пн=0, вт=1, ...)
  const firstDay = new Date(year, month, 1).getDay();
  const firstDayMon = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prevMonth() {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else setMonth((m) => m - 1);
    setSelectedDay(null);
  }

  function nextMonth() {
    const today = new Date();
    if (year > today.getFullYear() || (year === today.getFullYear() && month >= today.getMonth()))
      return;
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else setMonth((m) => m + 1);
    setSelectedDay(null);
  }

  return (
    <div className="space-y-4">
      {/* Навигация по месяцам */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-3 rounded-xl hover:bg-slate-100 transition-colors min-h-[48px] min-w-[48px]
            text-xl text-[#1565C0]"
          aria-label="Предыдущий месяц"
        >
          ←
        </button>
        <h3 className="text-lg font-semibold text-[#212121]">
          {MONTH_NAMES[month]} {year}
        </h3>
        <button
          onClick={nextMonth}
          className="p-3 rounded-xl hover:bg-slate-100 transition-colors min-h-[48px] min-w-[48px]
            text-xl text-[#1565C0]"
          aria-label="Следующий месяц"
        >
          →
        </button>
      </div>

      {/* Заголовки дней недели */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_NAMES.map((name) => (
          <div key={name} className="text-center text-sm font-medium text-slate-500 py-1">
            {name}
          </div>
        ))}
      </div>

      {/* Сетка дней */}
      {isLoading ? (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div
          className="grid grid-cols-7 gap-1"
          role="grid"
          aria-label={`Календарь ${MONTH_NAMES[month]} ${year}`}
        >
          {/* Пустые ячейки в начале */}
          {Array.from({ length: firstDayMon }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Дни месяца */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayData = data?.days[dateKey];
            const color = dayData?.color ?? 'empty';
            const isToday = dateKey === new Date().toISOString().slice(0, 10);
            const isSelected = selectedDay?.date === dateKey;

            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDay(isSelected ? null : (dayData ?? null))}
                className={`aspect-square rounded-xl text-sm font-medium transition-all
                  ${colorStyles[color]}
                  ${isToday ? 'ring-2 ring-[#1565C0] ring-offset-1' : ''}
                  ${isSelected ? 'ring-2 ring-white ring-offset-2 scale-110' : ''}
                  ${dayData && dayData.color !== 'empty' ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}
                `}
                disabled={!dayData || dayData.color === 'empty'}
                aria-label={
                  dayData
                    ? `${day}: ${dayData.takenCount} из ${dayData.totalCount} принято`
                    : String(day)
                }
              >
                {day}
              </button>
            );
          })}
        </div>
      )}

      {/* Детализация выбранного дня */}
      {selectedDay && (
        <div className="bg-[#f5f5f5] rounded-2xl p-4 space-y-2 animate-in fade-in">
          <p className="text-base font-semibold text-[#212121]">
            {new Date(selectedDay.date + 'T12:00:00').toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
            })}
          </p>
          <div className="flex gap-4 text-sm">
            <span className="text-[#4caf50]">Принято: {selectedDay.takenCount}</span>
            <span className="text-[#f44336]">Пропущено: {selectedDay.missedCount}</span>
            <span className="text-[#1565C0]">{selectedDay.disciplinePercent}%</span>
          </div>
        </div>
      )}

      {/* Статистика за месяц */}
      {data && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#e8f5e9] rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-[#2e7d32]">{data.stats.disciplinePercent}%</p>
            <p className="text-sm text-[#4caf50]">Дисциплина</p>
          </div>
          <div className="bg-[#E3F2FD] rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-[#1565C0]">{data.stats.currentStreak}</p>
            <p className="text-sm text-[#42A5F5]">Дней подряд</p>
          </div>
          <div className="bg-[#e3f2fd] rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-[#1976d2]">{data.stats.perfectDays}</p>
            <p className="text-sm text-[#42a5f5]">Идеальных дней</p>
          </div>
          <div className="bg-[#ffebee] rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-[#c62828]">{data.stats.missedDays}</p>
            <p className="text-sm text-[#ef5350]">Дней с пропусками</p>
          </div>
        </div>
      )}

      {/* Легенда цветов */}
      <div className="flex flex-wrap gap-3 text-sm">
        {[
          { color: 'bg-[#4caf50]', label: '100% принято' },
          { color: 'bg-[#ff9800]', label: '1-2 пропуска' },
          { color: 'bg-[#f44336]', label: '3+ пропуска' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`w-4 h-4 rounded ${color}`} aria-hidden="true" />
            <span className="text-slate-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
