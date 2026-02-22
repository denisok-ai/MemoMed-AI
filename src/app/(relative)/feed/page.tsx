/**
 * @file page.tsx
 * @description Главная страница родственника — лента событий подключённых пациентов
 * @dependencies prisma, next-auth
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export const metadata: Metadata = {
  title: 'Лента событий — MemoMed AI',
};

export default async function FeedPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  // Получаем пациентов, которых отслеживает родственник
  const connections = await prisma.connection.findMany({
    where: {
      relativeId: session.user.id,
      status: 'active',
    },
    include: {
      patient: {
        include: {
          profile: { select: { fullName: true } },
          medications: {
            where: { isActive: true },
            orderBy: { scheduledTime: 'asc' },
            include: {
              logs: {
                orderBy: { actualAt: 'desc' },
                take: 5,
              },
            },
          },
        },
      },
    },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-[#212121]">Лента событий</h1>

      {connections.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <p className="text-5xl" aria-hidden="true">👤</p>
          <p className="text-xl text-[#757575]">Нет подключённых пациентов</p>
          <p className="text-base text-[#9e9e9e]">
            Попросите пациента поделиться кодом приглашения
          </p>
        </div>
      ) : (
        <ul className="space-y-6" role="list">
          {connections.map((conn) => {
            const patientName = conn.patient.profile?.fullName ?? 'Пациент';
            const medications = conn.patient.medications;

            return (
              <li key={conn.id}>
                <article className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <header className="px-6 py-4 bg-[#ede7f6] flex items-center gap-3">
                    <span className="text-2xl" aria-hidden="true">👤</span>
                    <div>
                      <p className="text-lg font-semibold text-[#7e57c2]">{patientName}</p>
                      <p className="text-sm text-[#9e9e9e]">
                        {medications.length} лекарств
                      </p>
                    </div>
                  </header>

                  {medications.length === 0 ? (
                    <p className="px-6 py-4 text-base text-[#757575]">
                      Лекарства не добавлены
                    </p>
                  ) : (
                    <ul className="divide-y divide-gray-50">
                      {medications.map((med) => {
                        const lastLog = med.logs[0];
                        const takenToday = lastLog && new Date(lastLog.actualAt ?? 0).toDateString() === new Date().toDateString();

                        return (
                          <li key={med.id} className="px-6 py-4 flex items-center gap-4">
                            <span className="text-xl" aria-hidden="true">💊</span>
                            <div className="flex-1">
                              <p className="text-base font-medium text-[#212121]">{med.name}</p>
                              <p className="text-sm text-[#757575]">{med.dosage} · {med.scheduledTime}</p>
                            </div>
                            <span
                              className={`text-sm font-medium px-3 py-1 rounded-full ${
                                takenToday
                                  ? 'bg-[#e8f5e9] text-[#4caf50]'
                                  : 'bg-[#fff3e0] text-[#ff9800]'
                              }`}
                              aria-label={takenToday ? 'Принято сегодня' : 'Не принято'}
                            >
                              {takenToday ? '✅ Принято' : '⏳ Ожидает'}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
