/**
 * @file page.tsx
 * @description Просмотр аудит-логов системы в реальном времени
 * @dependencies prisma
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import { prisma } from '@/lib/db/prisma';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { AdminShieldIcon } from '@/components/admin/admin-icons';

export const metadata: Metadata = {
  title: 'Аудит — Админ — MemoMed AI',
};

const ACTION_COLORS: Record<string, string> = {
  login: 'bg-green-50 text-green-700',
  logout: 'bg-slate-100 text-slate-600',
  register: 'bg-blue-50 text-blue-700',
  update: 'bg-yellow-50 text-yellow-700',
  delete: 'bg-red-50 text-red-700',
  read: 'bg-purple-50 text-purple-700',
  export: 'bg-orange-50 text-orange-700',
  admin: 'bg-red-100 text-red-800',
};

function getActionColor(action: string): string {
  const key = Object.keys(ACTION_COLORS).find((k) => action.toLowerCase().includes(k));
  return key ? ACTION_COLORS[key] : 'bg-slate-100 text-slate-600';
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string; userId?: string }>;
}) {
  const { page: pageStr, action: actionFilter, userId: userIdFilter } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1'));
  const pageSize = 30;
  const skip = (page - 1) * pageSize;

  const where = {
    ...(actionFilter ? { action: { contains: actionFilter, mode: 'insensitive' as const } } : {}),
    ...(userIdFilter ? { userId: userIdFilter } : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      take: pageSize,
      skip,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            role: true,
            profile: { select: { fullName: true } },
          },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  // Статистика действий
  const actionStats = await prisma.auditLog.groupBy({
    by: ['action'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 8,
  });

  const totalPages = Math.ceil(total / pageSize);

  const roleLabels: Record<string, string> = {
    patient: 'Пациент',
    relative: 'Родственник',
    doctor: 'Врач',
    admin: 'Администратор',
  };

  return (
    <div className="space-y-6 med-animate">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-black text-[#0D1B2A]">Аудит-логи</h1>
        <span className="text-sm font-semibold text-slate-500">
          Записей: {total.toLocaleString('ru')}
        </span>
      </div>

      {/* Статистика действий */}
      {actionStats.length > 0 && (
        <div className="med-card p-5 space-y-3">
          <h2 className="med-section-title">Частые действия</h2>
          <div className="flex flex-wrap gap-2">
            {actionStats.map((s) => (
              <a
                key={s.action}
                href={`/admin/audit?action=${encodeURIComponent(s.action)}`}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                  transition-colors hover:opacity-80 min-h-[48px] ${getActionColor(s.action)}`}
              >
                {s.action}
                <span className="opacity-70">{s._count.id}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Фильтры */}
      <div className="flex flex-wrap gap-3 items-center">
        {actionFilter && (
          <div
            className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200
            rounded-xl text-sm text-[#1565C0]"
          >
            Действие: <strong>{actionFilter}</strong>
            <a href="/admin/audit" className="text-slate-500 hover:text-red-500 ml-1">
              ×
            </a>
          </div>
        )}
        {userIdFilter && (
          <div
            className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200
            rounded-xl text-sm text-[#1565C0]"
          >
            Пользователь: <strong className="font-mono text-xs">{userIdFilter.slice(0, 8)}…</strong>
            <a href="/admin/audit" className="text-slate-500 hover:text-red-500 ml-1">
              ×
            </a>
          </div>
        )}
        {!actionFilter && !userIdFilter && (
          <p className="text-sm text-slate-500">Нажмите на действие выше для фильтрации</p>
        )}
      </div>

      {/* Таблица */}
      <div className="med-card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-center px-3 py-3 text-slate-400 font-medium w-10">#</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">Время</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">Пользователь</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">Действие</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">Ресурс</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log, idx) => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-3 py-3 text-center text-sm text-slate-400 font-mono">
                  {skip + idx + 1}
                </td>
                <td className="px-4 py-3 text-slate-500 text-sm font-mono whitespace-nowrap">
                  {log.createdAt.toLocaleString('ru', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </td>
                <td className="px-4 py-3">
                  {log.user ? (
                    <>
                      <p className="text-slate-600 font-medium truncate max-w-[160px]">
                        {log.user.profile?.fullName ?? log.user.email}
                      </p>
                      <p className="text-sm text-slate-500">
                        {roleLabels[log.user.role] ?? log.user.role}
                      </p>
                    </>
                  ) : (
                    <span className="text-sm text-slate-400">Анонимно</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-lg text-sm font-medium ${getActionColor(log.action)}`}
                  >
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 font-mono text-sm max-w-[200px] truncate">
                  {log.resource}
                </td>
                <td className="px-4 py-3 text-slate-500 font-mono text-sm">
                  {log.ipAddress ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center">
              <AdminShieldIcon className="w-8 h-8 text-white" aria-hidden />
            </div>
            <p>Аудит-записей не найдено</p>
            <p className="text-sm mt-2">Записи появятся по мере использования системы</p>
          </div>
        )}
      </div>

      <AdminPagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        buildHref={(p) =>
          `/admin/audit?${actionFilter ? `action=${actionFilter}&` : ''}${userIdFilter ? `userId=${userIdFilter}&` : ''}page=${p}`
        }
      />
    </div>
  );
}
