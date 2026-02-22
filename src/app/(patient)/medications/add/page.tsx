/**
 * @file page.tsx
 * @description Страница добавления нового лекарства
 * @dependencies MedicationForm
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { MedicationForm } from '@/components/patient/medication-form';

export const metadata: Metadata = {
  title: 'Добавить лекарство — MemoMed AI',
};

export default function AddMedicationPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/medications"
          className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors
            min-h-[48px] min-w-[48px] flex items-center justify-center text-xl"
          aria-label="Назад к списку"
        >
          ←
        </Link>
        <h1 className="text-2xl font-bold text-[#212121]">Добавить лекарство</h1>
      </div>

      <div className="med-card p-8">
        <MedicationForm />
      </div>
    </div>
  );
}
