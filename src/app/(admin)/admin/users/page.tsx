/**
 * @file page.tsx
 * @description Список пользователей в админ-панели с фильтрацией по роли
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import type { Role } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { AdminPagination } from '@/components/admin/admin-pagination';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#212121]">Пользователи</h1>
        <span className="text-sm text-[#9e9e9e]">Всего: {total}</span>
      </div>

      {/* Фильтр по роли */}
      <div className="flex gap-2 flex-wrap">
        <a
          href="/admin/users"
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
            ${!roleFilter ? 'bg-[#1565C0] text-white' : 'bg-white border border-gray-200 text-[#424242] hover:border-[#1565C0]'}`}
        >
          Все
        </a>
        {roles.map((r) => (
          <a
            key={r}
            href={`/admin/users?role=${r}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
              ${roleFilter === r ? 'bg-[#1565C0] text-white' : 'bg-white border border-gray-200 text-[#424242] hover:border-[#1565C0]'}`}
          >
            {roleLabels[r]}
          </a>
        ))}
      </div>

      {/* Таблица */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-center px-3 py-3 text-[#bdbdbd] font-medium w-10">#</th>
              <th className="text-left px-4 py-3 text-[#757575] font-medium">Имя / Email</th>
              <th className="text-left px-4 py-3 text-[#757575] font-medium">Роль</th>
              <th className="text-center px-4 py-3 text-[#757575] font-medium">Лекарств</th>
              <th className="text-center px-4 py-3 text-[#757575] font-medium">Связей</th>
              <th className="text-right px-4 py-3 text-[#757575] font-medium">Дата регистрации</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u, idx) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-3 text-center text-xs text-[#bdbdbd] font-mono">
                  {skip + idx + 1}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-[#212121] truncate max-w-[220px]">
                    {u.profile?.fullName ?? '—'}
                  </p>
                  <p className="text-xs text-[#9e9e9e] truncate max-w-[220px]">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-medium ${roleColors[u.role] ?? ''}`}
                  >
                    {roleLabels[u.role] ?? u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-[#424242]">{u._count.medications}</td>
                <td className="px-4 py-3 text-center text-[#424242]">
                  {u._count.patientConnections}
                </td>
                <td className="px-4 py-3 text-right text-[#9e9e9e]">
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
