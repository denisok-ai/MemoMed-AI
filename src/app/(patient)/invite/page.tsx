/**
 * @file page.tsx
 * @description Инвайт-код пациента: передача кода родственнику/врачу, список подключённых.
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { CopyInviteCode } from '@/components/patient/copy-invite-code';
import {
  UsersIcon,
  LockIcon,
  UserIcon,
  HeartPulseIcon,
  InfoIcon,
} from '@/components/shared/nav-icons';

export const metadata: Metadata = {
  title: 'Мой код — MemoMed AI',
};

export default async function InvitePage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const [user, connections] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { inviteCode: true, profile: { select: { fullName: true } } },
    }),
    prisma.connection.findMany({
      where: { patientId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        relative: {
          select: {
            email: true,
            role: true,
            profile: { select: { fullName: true } },
          },
        },
      },
    }),
  ]);

  if (!user) redirect('/login');

  const ROLE_LABELS: Record<string, string> = {
    doctor: 'Врач',
    relative: 'Родственник',
    admin: 'Администратор',
  };

  const active = connections.filter((c) => c.status === 'active');
  const pending = connections.filter((c) => c.status === 'pending');

  return (
    <div className="med-page med-animate">
      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-[#0D1B2A]">Мой код доступа</h1>
        <p className="text-slate-500 text-base mt-0.5">
          Поделитесь кодом, чтобы подключить врача или родственника
        </p>
      </div>

      {/* Карточка с кодом */}
      <div
        className="med-card p-6 space-y-5 mb-6 bg-gradient-to-br from-blue-50 to-indigo-50
        border-blue-100"
      >
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-[#1565C0]">Ваш персональный код</p>
          <p className="text-sm text-slate-400">
            Покажите этот код врачу или родственнику — они введут его в приложении
          </p>
        </div>
        <CopyInviteCode code={user.inviteCode} />
        <div className="bg-blue-50/80 rounded-xl p-3 text-sm text-[#1565C0] flex items-center justify-center gap-2">
          <LockIcon className="w-4 h-4 shrink-0" aria-hidden />
          Код постоянный и уникальный для вашего аккаунта
        </div>
      </div>

      {/* Инструкция */}
      <div className="med-card p-4 mb-6 space-y-3">
        <h2 className="text-sm font-bold text-[#0D1B2A]">Как это работает?</h2>
        <div className="space-y-2">
          {[
            { step: '1', text: 'Скопируйте ваш код выше' },
            { step: '2', text: 'Передайте код врачу или родственнику' },
            { step: '3', text: 'Они вводят код в разделе «Подключиться к пациенту»' },
            { step: '4', text: 'После подтверждения они видят ваши данные' },
          ].map((s) => (
            <div key={s.step} className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-lg bg-[#1565C0]/10 flex items-center justify-center
                text-sm font-bold text-[#1565C0] flex-shrink-0"
              >
                {s.step}
              </div>
              <p className="text-sm text-slate-600">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Подключённые */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0D1B2A]">Подключённые</h2>
          <span className="text-sm font-semibold text-slate-500">{active.length} активных</span>
        </div>

        {connections.length === 0 ? (
          <div className="med-card flex flex-col items-center py-12 text-center space-y-4">
            <div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-500
                flex items-center justify-center shadow-md"
            >
              <UsersIcon className="w-8 h-8 text-white" />
            </div>
            <p className="font-bold text-[#0D1B2A] text-lg">Никто пока не подключён</p>
            <p className="text-slate-500 text-base">Передайте код врачу или родственнику</p>
          </div>
        ) : (
          <ul className="space-y-3 med-stagger">
            {active.map((conn) => {
              const name = conn.relative.profile?.fullName ?? conn.relative.email ?? 'Пользователь';
              const role = ROLE_LABELS[conn.relative.role] ?? conn.relative.role;
              return (
                <li key={conn.id}>
                  <div className="med-card-accent flex items-center gap-3 px-4 py-4 hover:translate-x-1 transition-all">
                    <div
                      className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600
                        flex items-center justify-center flex-shrink-0 shadow-md"
                    >
                      {conn.relative.role === 'doctor' ? (
                        <HeartPulseIcon className="w-6 h-6 text-white" aria-hidden />
                      ) : (
                        <UserIcon className="w-6 h-6 text-white" aria-hidden />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#0D1B2A] text-base truncate">{name}</p>
                      <p className="text-sm text-slate-500">
                        {role} · с{' '}
                        {new Date(conn.createdAt).toLocaleDateString('ru', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <span className="med-badge-success flex-shrink-0">Активен</span>
                  </div>
                </li>
              );
            })}
            {pending.map((conn) => {
              const name = conn.relative.profile?.fullName ?? conn.relative.email ?? 'Пользователь';
              const role = ROLE_LABELS[conn.relative.role] ?? conn.relative.role;
              return (
                <li key={conn.id}>
                  <div className="med-card flex items-center gap-3 px-4 py-4 border-l-4 border-amber-400">
                    <div
                      className="w-12 h-12 rounded-xl bg-amber-100 flex items-center
                      justify-center flex-shrink-0"
                    >
                      <InfoIcon className="w-6 h-6 text-amber-600" aria-hidden />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#0D1B2A] text-base truncate">{name}</p>
                      <p className="text-sm text-slate-500">{role} · Ожидает подтверждения</p>
                    </div>
                    <span className="med-badge-warning flex-shrink-0">Ожидает</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
