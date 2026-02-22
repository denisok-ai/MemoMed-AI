/**
 * @file page.tsx
 * @description Страница инвайт-кода пациента — показывает код для передачи родственнику
 * @dependencies prisma, next-auth
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { CopyInviteCode } from '@/components/patient/copy-invite-code';

export const metadata: Metadata = {
  title: 'Мой код — MemoMed AI',
};

export default async function InvitePage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { inviteCode: true, profile: { select: { fullName: true } } },
  });

  const connections = await prisma.connection.findMany({
    where: { patientId: session.user.id, status: 'active' },
    include: {
      relative: { include: { profile: { select: { fullName: true } } } },
    },
  });

  if (!user) redirect('/login');

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-[#212121]">Мой код для родственника</h1>

      <div className="bg-[#ede7f6] rounded-3xl p-8 space-y-4 text-center">
        <p className="text-base text-[#7e57c2]">
          Передайте этот код родственнику, чтобы он мог следить за вашими приёмами
        </p>
        <CopyInviteCode code={user.inviteCode} />
        <p className="text-sm text-[#9e9e9e]">
          Код постоянный и уникальный для вашего аккаунта
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[#212121]">
          Подключённые родственники{' '}
          <span className="text-[#9e9e9e] font-normal">({connections.length})</span>
        </h2>

        {connections.length === 0 ? (
          <p className="text-base text-[#757575] py-4">Никто ещё не подключился</p>
        ) : (
          <ul className="space-y-3" role="list">
            {connections.map((conn) => (
              <li key={conn.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl
                border border-gray-100 shadow-sm">
                <span className="text-2xl" aria-hidden="true">👥</span>
                <div className="flex-1">
                  <p className="text-base font-semibold text-[#212121]">
                    {conn.relative.profile?.fullName ?? conn.relative.email ?? 'Родственник'}
                  </p>
                  <p className="text-sm text-[#9e9e9e]">
                    Подключён {new Date(conn.createdAt).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
