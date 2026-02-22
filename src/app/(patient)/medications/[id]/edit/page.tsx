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
import { PhotoUpload } from '@/components/patient/photo-upload';
import { FeedbackModal } from '@/components/patient/feedback-modal';
import { PlusIcon, StarIcon, ArrowLeftIcon } from '@/components/shared/nav-icons';

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
    <div className="med-page max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/medications"
          className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0D1B2A] transition-colors
            min-h-[48px] min-w-[48px] flex items-center justify-center"
          aria-label="Назад к списку"
        >
          <ArrowLeftIcon className="w-5 h-5" aria-hidden />
        </Link>
        <h1 className="text-2xl font-bold text-[#0D1B2A]">Редактировать лекарство</h1>
      </div>

      <div className="med-card p-8 space-y-8">
        <MedicationForm
          medicationId={medication.id}
          defaultValues={{
            name: medication.name,
            dosage: medication.dosage,
            instruction: medication.instruction ?? undefined,
            scheduledTime: medication.scheduledTime,
          }}
        />

        <div>
          <h2 className="text-lg font-semibold text-[#0D1B2A] mb-4 flex items-center gap-2">
            <PlusIcon className="w-5 h-5 text-[#1565C0]" aria-hidden />
            Фото упаковки
          </h2>
          <PhotoUpload
            medicationId={medication.id}
            currentPhotoUrl={medication.photoUrl}
            medicationName={medication.name}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[#0D1B2A] mb-4 flex items-center gap-2">
            <StarIcon className="w-5 h-5 text-[#1565C0]" aria-hidden />
            Отзыв
          </h2>
          <FeedbackModal
            medicationId={medication.id}
            medicationName={medication.name}
            dosage={medication.dosage}
          />
        </div>
      </div>
    </div>
  );
}
