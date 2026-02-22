/**
 * @file page.tsx
 * @description Страница редактирования записи дневника за конкретную дату.
 * Если запись уже есть — предзаполняет форму.
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { JournalForm } from '@/components/patient/journal-form';

interface PageProps {
  params: Promise<{ date: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { date } = await params;
  return { title: `Дневник ${date} — MemoMed AI` };
}

/** Проверяет формат даты YYYY-MM-DD */
function isValidDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr + 'T00:00:00');
  return !isNaN(d.getTime());
}

export default async function JournalEntryPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { date } = await params;

  if (!isValidDate(date)) notFound();

  // Не показываем записи будущего
  const today = new Date().toISOString().split('T')[0];
  if (date > today) notFound();

  const entry = await prisma.healthJournal.findUnique({
    where: {
      patientId_logDate: {
        patientId: session.user.id,
        logDate: new Date(date + 'T00:00:00'),
      },
    },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Навигация */}
      <div className="flex items-center gap-4">
        <Link
          href="/journal"
          className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors
            min-h-[48px] min-w-[48px] flex items-center justify-center text-xl"
          aria-label="Назад к дневнику"
        >
          ←
        </Link>
        <h1 className="text-2xl font-bold text-[#212121]">
          {entry ? 'Редактировать запись' : 'Новая запись'}
        </h1>
      </div>

      {/* Форма */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <JournalForm
          date={date}
          initialData={
            entry
              ? {
                  moodScore: entry.moodScore,
                  painLevel: entry.painLevel,
                  sleepQuality: entry.sleepQuality,
                  energyLevel: entry.energyLevel,
                  freeText: entry.freeText,
                }
              : undefined
          }
        />
      </div>

      {/* Подсказка */}
      <div className="bg-[#e3f2fd] rounded-2xl p-4">
        <p className="text-sm text-[#1565c0]">
          💡 <strong>Совет:</strong> Регулярные записи помогают врачу выявить закономерности между
          вашим самочувствием и приёмом лекарств.
        </p>
      </div>
    </div>
  );
}
