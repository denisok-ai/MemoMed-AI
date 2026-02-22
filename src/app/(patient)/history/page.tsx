/**
 * @file page.tsx
 * @description Страница истории приёма лекарств — отображает последние 30 записей
 * @dependencies prisma, next-auth
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export const metadata: Metadata = {
  title: 'История приёма — MemoMed AI',
};

const statusLabels: Record<string, { label: string; color: string }> = {
  taken: { label: '✅ Принято', color: 'bg-[#e8f5e9] text-[#4caf50]' },
  missed: { label: '❌ Пропущено', color: 'bg-[#ffebee] text-[#f44336]' },
  pending: { label: '⏳ Ожидает', color: 'bg-[#fff3e0] text-[#ff9800]' },
};

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const logs = await prisma.medicationLog.findMany({
    where: {
      medication: {
        patientId: session.user.id,
      },
    },
    orderBy: { scheduledAt: 'desc' },
    take: 30,
    include: {
      medication: {
        select: { name: true, dosage: true },
      },
    },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-[#212121]">История приёма</h1>

      {logs.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <p className="text-5xl" aria-hidden="true">📋</p>
          <p className="text-xl text-[#757575]">История пуста</p>
          <p className="text-base text-[#9e9e9e]">Записи появятся после приёма лекарств</p>
        </div>
      ) : (
        <ul className="space-y-3" role="list" aria-label="История приёма лекарств">
          {logs.map((log) => {
            const statusInfo = statusLabels[log.status] ?? statusLabels.pending;
            const date = new Date(log.scheduledAt);
            const dateStr = date.toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
            });
            const timeStr = date.toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <li key={log.id}>
                <article
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl
                    border border-gray-100 shadow-sm"
                >
                  <span className="text-xl flex-shrink-0" aria-hidden="true">💊</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-[#212121] truncate">
                      {log.medication.name}
                    </p>
                    <p className="text-sm text-[#757575]">
                      {log.medication.dosage} · {dateStr} в {timeStr}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-medium px-3 py-1 rounded-full flex-shrink-0 ${statusInfo.color}`}
                    aria-label={statusInfo.label}
                  >
                    {statusInfo.label}
                  </span>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
