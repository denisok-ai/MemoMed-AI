/**
 * @file page.tsx
 * @description Страница редактирования лекарства с предзаполненной формой
 * @dependencies MedicationForm, prisma
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { MedicationForm } from '@/components/patient/medication-form';

export const metadata: Metadata = {
  title: 'Редактировать лекарство — MemoMed AI',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMedicationPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id } = await params;

  const medication = await prisma.medication.findFirst({
    where: {
      id,
      patientId: session.user.id,
      isActive: true,
    },
  });

  if (!medication) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/medications"
          className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors
            min-h-[48px] min-w-[48px] flex items-center justify-center text-xl"
          aria-label="Назад к списку"
        >
          ←
        </Link>
        <h1 className="text-2xl font-bold text-[#212121]">Редактировать лекарство</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <MedicationForm
          medicationId={medication.id}
          defaultValues={{
            name: medication.name,
            dosage: medication.dosage,
            instruction: medication.instruction ?? undefined,
            scheduledTime: medication.scheduledTime,
          }}
        />
      </div>
    </div>
  );
}
