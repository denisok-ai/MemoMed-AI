/**
 * @file page.tsx
 * @description Список пользователей в админ-панели с фильтрацией по роли
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import type { Role } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { DownloadReportButton } from '@/components/shared/download-report-button';

export const metadata: Metadata = {
  title: 'Пользователи — Админ — MemoMed AI',
};

const roleLabels: Record<string, string> = {
  patient: 'Пациент',
  relative: 'Родственник',
  doctor: 'Врач',
  admin: 'Администратор',
};

const roleColors: Record<string, string> = {
  patient: 'bg-blue-50 text-blue-700',
  relative: 'bg-green-50 text-green-700',
  doctor: 'bg-blue-50 text-blue-700',
  admin: 'bg-red-50 text-red-700',
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; page?: string }>;
}) {
  const { role: roleFilter, page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1'));
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const where = roleFilter ? { role: roleFilter as Role } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      take: pageSize,
      skip,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        consentGiven: true,
        createdAt: true,
        profile: { select: { fullName: true } },
        _count: {
          select: {
            medications: true,
            patientConnections: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);
  const roles = ['patient', 'relative', 'doctor', 'admin'];

  return (
    <div className="space-y-6 med-animate">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-black text-[#0D1B2A]">Пользователи</h1>
        <span className="text-sm font-semibold text-slate-500">Всего: {total}</span>
      </div>

      {/* Фильтр по роли */}
      <div className="flex gap-2 flex-wrap">
        <a
          href="/admin/users"
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[48px] flex items-center
            ${!roleFilter ? 'med-btn-primary' : 'med-btn-secondary'}`}
        >
          Все
        </a>
        {roles.map((r) => (
          <a
            key={r}
            href={`/admin/users?role=${r}`}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[48px] flex items-center
              ${roleFilter === r ? 'med-btn-primary' : 'med-btn-secondary'}`}
          >
            {roleLabels[r]}
          </a>
        ))}
      </div>

      {/* Таблица */}
      <div className="med-card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-center px-3 py-3 text-slate-400 font-medium w-10">#</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">Имя / Email</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">Роль</th>
              <th className="text-center px-4 py-3 text-slate-500 font-medium">Лекарств</th>
              <th className="text-center px-4 py-3 text-slate-500 font-medium">Связей</th>
              <th className="text-center px-4 py-3 text-slate-500 font-medium">PDF</th>
              <th className="text-right px-4 py-3 text-slate-500 font-medium">Дата регистрации</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u, idx) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-3 py-3 text-center text-sm text-slate-400 font-mono">
                  {skip + idx + 1}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-[#0D1B2A] truncate max-w-[220px]">
                    {u.profile?.fullName ?? '—'}
                  </p>
                  <p className="text-sm text-slate-500 truncate max-w-[220px]">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-lg text-sm font-medium ${roleColors[u.role] ?? ''}`}
                  >
                    {roleLabels[u.role] ?? u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-slate-600">{u._count.medications}</td>
                <td className="px-4 py-3 text-center text-slate-600">
                  {u._count.patientConnections}
                </td>
                <td className="px-4 py-3 text-center">
                  {u.role === 'patient' ? (
                    <DownloadReportButton patientId={u.id} period="30d" label="30 дн" compact />
                  ) : (
                    <span className="text-slate-400 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-slate-500">
                  {u.createdAt.toLocaleDateString('ru')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminPagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        buildHref={(p) => `/admin/users?${roleFilter ? `role=${roleFilter}&` : ''}page=${p}`}
      />
    </div>
  );
}
