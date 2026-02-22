/**
 * @file page.tsx
 * @description Управление связями пациент-родственник в админ-панели
 * @dependencies prisma
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import { prisma } from '@/lib/db/prisma';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { AdminLinkIcon } from '@/components/admin/admin-icons';

export const metadata: Metadata = {
  title: 'Связи — Админ — MemoMed AI',
};

const STATUS_STYLES: Record<string, string> = {
  active: 'med-badge-success',
  pending: 'med-badge-warning',
  inactive: 'bg-slate-100 text-slate-600',
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
    <div className="space-y-6 med-animate">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-black text-[#0D1B2A]">
          Связи пациент — родственник
        </h1>
        <span className="text-sm font-semibold text-slate-500">Всего: {total}</span>
      </div>

      {/* Счётчики */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Активных', value: activeCount, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Ожидают', value: pendingCount, color: 'text-amber-700', bg: 'bg-amber-50' },
          {
            label: 'Неактивных',
            value: inactiveCount,
            color: 'text-slate-600',
            bg: 'bg-slate-100',
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`${s.bg} rounded-2xl p-4 text-center border border-slate-100`}
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Фильтры статуса */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: '', label: 'Все' },
          { value: 'active', label: 'Активные' },
          { value: 'pending', label: 'Ожидают' },
          { value: 'inactive', label: 'Неактивные' },
        ].map((f) => (
          <a
            key={f.value}
            href={`/admin/connections${f.value ? `?status=${f.value}` : ''}`}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold min-h-[48px] flex items-center
              ${statusFilter === f.value || (!statusFilter && !f.value) ? 'med-btn-primary' : 'med-btn-secondary'}`}
          >
            {f.label}
          </a>
        ))}
      </div>

      {/* Таблица */}
      <div className="med-card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-center px-3 py-3 text-slate-400 font-medium w-10">#</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">Пациент</th>
              <th className="text-center px-4 py-3 text-slate-500 font-medium">→</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">Родственник</th>
              <th className="text-center px-4 py-3 text-slate-500 font-medium">Статус</th>
              <th className="text-right px-4 py-3 text-slate-500 font-medium">Создана</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {connections.map((conn, idx) => (
              <tr key={conn.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-3 py-3 text-center text-sm text-slate-400 font-mono">
                  {skip + idx + 1}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-[#0D1B2A] truncate max-w-[200px]">
                    {conn.patient.profile?.fullName ?? '—'}
                  </p>
                  <p className="text-sm text-slate-500 truncate max-w-[200px]">
                    {conn.patient.email}
                  </p>
                </td>
                <td className="px-4 py-3 text-center text-slate-400">
                  <AdminLinkIcon className="w-5 h-5 inline-block" aria-hidden />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-[#0D1B2A] truncate max-w-[200px]">
                    {conn.relative.profile?.fullName ?? '—'}
                  </p>
                  <p className="text-sm text-slate-500 truncate max-w-[200px]">
                    {conn.relative.email}
                  </p>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-2 py-1 rounded-lg text-sm font-medium
                    ${STATUS_STYLES[conn.status] ?? 'bg-slate-100 text-slate-600'}`}
                  >
                    {STATUS_LABELS[conn.status] ?? conn.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-slate-500 text-sm">
                  {conn.createdAt.toLocaleDateString('ru')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {connections.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <AdminLinkIcon className="w-8 h-8 text-white" aria-hidden />
            </div>
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
