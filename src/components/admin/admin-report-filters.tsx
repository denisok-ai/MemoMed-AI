/**
 * @file admin-report-filters.tsx
 * @description Форма отчётности с поиском пациента и групповыми фильтрами.
 * Пациенты скрыты — выбор только через поиск.
 * @created 2026-02-22
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DownloadReportButton } from '@/components/shared/download-report-button';
import { ClipboardIcon, SearchIcon, ChevronRightIcon } from '@/components/shared/nav-icons';

interface PatientOption {
  id: string;
  fullName: string | null;
  email: string;
  label: string;
}

const PERIOD_OPTIONS = [
  { value: '30d', label: '30 дней' },
  { value: '90d', label: '90 дней' },
  { value: '180d', label: '180 дней' },
] as const;

const DISCIPLINE_FILTERS = [
  { value: 'all', label: 'Все' },
  { value: 'high', label: 'Высокая (90%+)' },
  { value: 'medium', label: 'Средняя (70–90%)' },
  { value: 'low', label: 'Низкая (<70%)' },
] as const;

export function AdminReportFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [period, setPeriod] = useState<'30d' | '90d' | '180d'>('30d');
  const disciplineFilter = searchParams.get('discipline') ?? 'all';
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchPatients = useCallback(async (q: string) => {
    if (q.length < 2) {
      setPatients([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/admin/patients/search?q=${encodeURIComponent(q)}&limit=20`);
      const data = (await res.json()) as { patients: PatientOption[] };
      setPatients(data.patients ?? []);
      setIsOpen(true);
    } catch {
      setPatients([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.length < 2) {
      setPatients([]);
      setIsOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => fetchPatients(searchQuery), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, fetchPatients]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="med-card p-5 space-y-5" ref={containerRef}>
      <div className="flex items-center gap-2">
        <ClipboardIcon className="w-5 h-5 text-[#1565C0]" aria-hidden />
        <h2 className="text-base font-bold text-[#0D1B2A]">PDF-отчёт по пациенту</h2>
      </div>
      <p className="text-sm text-slate-500">
        Выберите пациента через поиск по имени или email. Данные отображаются только после выбора.
      </p>

      {/* ── Группа: Поиск пациента ───────────────────────────────────────────── */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-[#0D1B2A]">Пациент</label>
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                aria-hidden
              />
              <input
                type="text"
                value={selectedPatient ? selectedPatient.label : searchQuery}
                onChange={(e) => {
                  setSelectedPatient(null);
                  setSearchQuery(e.target.value);
                }}
                onFocus={() => searchQuery.length >= 2 && setIsOpen(true)}
                placeholder="Поиск по имени или email (мин. 2 символа)"
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl
                  focus:border-[#1565C0] focus:outline-none transition-colors
                  placeholder:text-slate-400"
                aria-label="Поиск пациента"
              />
              {selectedPatient && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPatient(null);
                    setSearchQuery('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
                  aria-label="Сбросить выбор"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {isOpen && patients.length > 0 && (
            <ul
              className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto bg-white border-2
                border-slate-200 rounded-xl shadow-lg py-2"
              role="listbox"
            >
              {patients.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPatient(p);
                      setSearchQuery('');
                      setPatients([]);
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-2
                      text-sm text-[#0D1B2A]"
                    role="option"
                    aria-selected={selectedPatient?.id === p.id}
                  >
                    <ChevronRightIcon className="w-4 h-4 text-slate-400 -rotate-90" />
                    {p.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {isSearching && (
            <p className="absolute left-4 top-full mt-1 text-xs text-slate-500">Поиск...</p>
          )}
        </div>
      </div>

      {/* ── Группа: Период отчёта ───────────────────────────────────────────── */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-[#0D1B2A]">Период отчёта</label>
        <div className="flex flex-wrap gap-2">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPeriod(opt.value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${period === opt.value ? 'med-btn-primary' : 'med-btn-secondary'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Группа: Фильтр по дисциплине (для справки, не влияет на PDF) ─────── */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-[#0D1B2A]">Фильтр по дисциплине</label>
        <p className="text-xs text-slate-500">
          Используется для отображения сводной статистики ниже. PDF содержит полные данные.
        </p>
        <div className="flex flex-wrap gap-2">
          {DISCIPLINE_FILTERS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                if (opt.value === 'all') params.delete('discipline');
                else params.set('discipline', opt.value);
                router.push(`/admin/reports?${params.toString()}`);
              }}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${disciplineFilter === opt.value ? 'bg-[#1565C0] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Скачать PDF (только при выборе пациента) ─────────────────────────── */}
      {selectedPatient ? (
        <div className="pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-500 mb-3">
            Выбран: <span className="font-semibold text-[#0D1B2A]">{selectedPatient.label}</span>
          </p>
          <DownloadReportButton
            patientId={selectedPatient.id}
            period={period}
            label={`Скачать PDF за ${PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? period}`}
          />
        </div>
      ) : (
        <p className="text-sm text-slate-400 italic">
          Выберите пациента в поиске, чтобы скачать PDF-отчёт
        </p>
      )}
    </div>
  );
}
