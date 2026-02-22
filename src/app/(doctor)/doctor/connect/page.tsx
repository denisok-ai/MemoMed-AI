/**
 * @file page.tsx
 * @description Страница подключения к пациенту для врача — ввод инвайт-кода.
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { ConnectForm } from '@/components/relative/connect-form';
import { UsersIcon } from '@/components/shared/nav-icons';

export const metadata: Metadata = {
  title: 'Подключиться к пациенту — MemoMed AI',
};

export default async function DoctorConnectPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'doctor' && session.user.role !== 'admin') redirect('/dashboard');

  const connections = await prisma.connection.findMany({
    where: { relativeId: session.user.id, status: 'active' },
    include: {
      patient: {
        select: {
          email: true,
          profile: { select: { fullName: true } },
          medications: { where: { isActive: true }, select: { id: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="med-page med-animate">
      <Link
        href="/doctor/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#1565C0]
          transition-colors mb-4 min-h-[auto]"
      >
        ← Список пациентов
      </Link>

      <h1 className="text-2xl font-black text-[#0D1B2A] mb-2">Подключиться к пациенту</h1>
      <p className="text-slate-500 text-sm mb-6">
        Введите код приглашения, который пациент скопировал в разделе «Мой код»
      </p>

      {/* Форма подключения */}
      <div className="med-card p-6 mb-6 space-y-6">
        <ConnectForm />

        <div className="bg-blue-50 rounded-2xl p-4 space-y-2">
          <p className="text-sm font-semibold text-[#1565C0]">💡 Как получить код?</p>
          <ol className="text-sm text-slate-500 space-y-1 list-decimal list-inside">
            <li>Попросите пациента открыть приложение MemoMed AI</li>
            <li>Пациент переходит в раздел «Мой код» (вкладка Настройки)</li>
            <li>Нажимает «Копировать» и передаёт код вам</li>
            <li>Вы вводите код выше и нажимаете «Подключиться»</li>
          </ol>
        </div>
      </div>

      {/* Список уже подключённых */}
      {connections.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#0D1B2A]">Мои пациенты</h2>
            <span className="text-sm text-slate-400">{connections.length}</span>
          </div>
          <ul className="space-y-2">
            {connections.map((conn) => {
              const name = conn.patient.profile?.fullName ?? conn.patient.email;
              const medCount = conn.patient.medications.length;
              return (
                <li key={conn.id}>
                  <Link
                    href={`/doctor/patients/${conn.patientId}`}
                    className="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl
                      border border-slate-100 hover:border-[#1565C0] transition-all"
                  >
                    <div
                      className="w-10 h-10 rounded-xl bg-blue-50 flex items-center
                      justify-center text-sm font-bold text-[#1565C0] flex-shrink-0"
                    >
                      {(name?.[0] ?? '?').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0D1B2A] text-sm truncate">{name}</p>
                      <p className="text-sm text-slate-400">
                        💊 {medCount} препарат{medCount !== 1 ? 'ов' : ''} · с{' '}
                        {new Date(conn.createdAt).toLocaleDateString('ru')}
                      </p>
                    </div>
                    <span className="text-sm text-slate-300">→</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {connections.length === 0 && (
        <div className="flex flex-col items-center py-10 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
            <UsersIcon className="w-7 h-7 text-slate-300" />
          </div>
          <p className="text-slate-400 text-sm">У вас пока нет подключённых пациентов</p>
        </div>
      )}
    </div>
  );
}
