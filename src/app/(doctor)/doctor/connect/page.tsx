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
import { UsersIcon, InfoIcon } from '@/components/shared/nav-icons';

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
        className="inline-flex items-center gap-2 text-base text-slate-500 hover:text-[#1565C0]
          transition-colors mb-4 py-2 min-h-[48px] items-center"
      >
        ← Список пациентов
      </Link>

      <h1 className="text-2xl md:text-3xl font-black text-[#0D1B2A] mb-2">
        Подключиться к пациенту
      </h1>
      <p className="text-slate-500 text-base mb-6">
        Введите код приглашения, который пациент скопировал в разделе «Мой код»
      </p>

      {/* Форма подключения */}
      <div className="med-card p-6 mb-6 space-y-6">
        <ConnectForm />

        <div className="med-card-accent p-4 space-y-2">
          <p className="text-sm font-bold text-[#1565C0] flex items-center gap-2">
            <InfoIcon className="w-4 h-4 shrink-0" aria-hidden />
            Как получить код?
          </p>
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#0D1B2A]">Мои пациенты</h2>
            <span className="text-sm font-semibold text-slate-500">{connections.length}</span>
          </div>
          <ul className="space-y-3 med-stagger">
            {connections.map((conn) => {
              const name = conn.patient.profile?.fullName ?? conn.patient.email;
              const medCount = conn.patient.medications.length;
              return (
                <li key={conn.id}>
                  <Link
                    href={`/doctor/patients/${conn.patientId}`}
                    className="med-card-accent flex items-center gap-3 px-4 py-4
                      hover:translate-x-1 transition-all group"
                  >
                    <div
                      className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600
                        flex items-center justify-center text-lg font-bold text-white flex-shrink-0
                        shadow-md group-hover:shadow-lg transition-shadow"
                    >
                      {(name?.[0] ?? '?').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#0D1B2A] text-base truncate group-hover:text-[#1565C0] transition-colors">
                        {name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {medCount} препарат{medCount !== 1 ? 'ов' : ''} · с{' '}
                        {new Date(conn.createdAt).toLocaleDateString('ru')}
                      </p>
                    </div>
                    <span className="text-slate-300 group-hover:text-[#1565C0] transition-colors">
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {connections.length === 0 && (
        <div className="med-card flex flex-col items-center py-12 text-center space-y-4">
          <div
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-500
              flex items-center justify-center shadow-md"
          >
            <UsersIcon className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-500 text-base">У вас пока нет подключённых пациентов</p>
        </div>
      )}
    </div>
  );
}
