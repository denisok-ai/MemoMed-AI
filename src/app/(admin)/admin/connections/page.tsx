/**
 * @file page.tsx
 * @description Управление связями пациент-родственник в админ-панели
 * @dependencies prisma
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import { prisma } from '@/lib/db/prisma';
import { AdminPagination } from '@/components/admin/admin-pagination';

export const metadata: Metadata = {
  title: 'Связи — Админ — MemoMed AI',
};

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-50 text-green-700',
  pending: 'bg-yellow-50 text-yellow-700',
  inactive: 'bg-gray-100 text-gray-500',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Активна',
  pending: 'Ожидает',
  inactive: 'Неактивна',
};

export default async function AdminConnectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status: statusFilter, page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1'));
  const pageSize = 25;
  const skip = (page - 1) * pageSize;

  const where = statusFilter ? { status: statusFilter as 'active' | 'pending' | 'inactive' } : {};

  const [connections, total, activeCount, pendingCount, inactiveCount] = await Promise.all([
    prisma.connection.findMany({
      where,
      take: pageSize,
      skip,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          select: {
            email: true,
            profile: { select: { fullName: true } },
          },
        },
        relative: {
          select: {
            email: true,
            profile: { select: { fullName: true } },
          },
        },
      },
    }),
    prisma.connection.count({ where }),
    prisma.connection.count({ where: { status: 'active' } }),
    prisma.connection.count({ where: { status: 'pending' } }),
    prisma.connection.count({ where: { status: 'inactive' } }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#212121]">Связи пациент — родственник</h1>
        <span className="text-sm text-[#9e9e9e]">Всего: {total}</span>
      </div>

      {/* Счётчики */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Активных', value: activeCount, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Ожидают', value: pendingCount, color: 'text-yellow-700', bg: 'bg-yellow-50' },
          { label: 'Неактивных', value: inactiveCount, color: 'text-gray-500', bg: 'bg-gray-50' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-[#9e9e9e] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Фильтры статуса */}
      <div className="flex gap-2">
        {[
          { value: '', label: 'Все' },
          { value: 'active', label: '✅ Активные' },
          { value: 'pending', label: '⏳ Ожидают' },
          { value: 'inactive', label: '⛔ Неактивные' },
        ].map((f) => (
          <a
            key={f.value}
            href={`/admin/connections${f.value ? `?status=${f.value}` : ''}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
              ${
                statusFilter === f.value || (!statusFilter && !f.value)
                  ? 'bg-[#1565C0] text-white'
                  : 'bg-white border border-gray-200 text-[#424242] hover:border-[#1565C0]'
              }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      {/* Таблица */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-center px-3 py-3 text-[#bdbdbd] font-medium w-10">#</th>
              <th className="text-left px-4 py-3 text-[#757575] font-medium">Пациент</th>
              <th className="text-center px-4 py-3 text-[#757575] font-medium">→</th>
              <th className="text-left px-4 py-3 text-[#757575] font-medium">Родственник</th>
              <th className="text-center px-4 py-3 text-[#757575] font-medium">Статус</th>
              <th className="text-right px-4 py-3 text-[#757575] font-medium">Создана</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {connections.map((conn, idx) => (
              <tr key={conn.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-3 text-center text-xs text-[#bdbdbd] font-mono">
                  {skip + idx + 1}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-[#212121] truncate max-w-[200px]">
                    {conn.patient.profile?.fullName ?? '—'}
                  </p>
                  <p className="text-xs text-[#9e9e9e] truncate max-w-[200px]">
                    {conn.patient.email}
                  </p>
                </td>
                <td className="px-4 py-3 text-center text-[#bdbdbd]">🔗</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-[#212121] truncate max-w-[200px]">
                    {conn.relative.profile?.fullName ?? '—'}
                  </p>
                  <p className="text-xs text-[#9e9e9e] truncate max-w-[200px]">
                    {conn.relative.email}
                  </p>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-medium
                    ${STATUS_STYLES[conn.status] ?? 'bg-gray-50 text-gray-600'}`}
                  >
                    {STATUS_LABELS[conn.status] ?? conn.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-[#9e9e9e] text-xs">
                  {conn.createdAt.toLocaleDateString('ru')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {connections.length === 0 && (
          <div className="text-center py-12 text-[#9e9e9e]">
            <p className="text-4xl mb-3">🔗</p>
            <p>Связей не найдено</p>
          </div>
        )}
      </div>

      <AdminPagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        buildHref={(p) =>
          `/admin/connections?${statusFilter ? `status=${statusFilter}&` : ''}page=${p}`
        }
      />
    </div>
  );
}
