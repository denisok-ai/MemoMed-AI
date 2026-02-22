/**
 * @file page.tsx
 * @description Просмотр аудит-логов системы в реальном времени
 * @dependencies prisma
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import { prisma } from '@/lib/db/prisma';
import { AdminPagination } from '@/components/admin/admin-pagination';

export const metadata: Metadata = {
  title: 'Аудит — Админ — MemoMed AI',
};

const ACTION_COLORS: Record<string, string> = {
  login: 'bg-green-50 text-green-700',
  logout: 'bg-gray-100 text-gray-600',
  register: 'bg-blue-50 text-blue-700',
  update: 'bg-yellow-50 text-yellow-700',
  delete: 'bg-red-50 text-red-700',
  read: 'bg-purple-50 text-purple-700',
  export: 'bg-orange-50 text-orange-700',
  admin: 'bg-red-100 text-red-800',
};

function getActionColor(action: string): string {
  const key = Object.keys(ACTION_COLORS).find((k) => action.toLowerCase().includes(k));
  return key ? ACTION_COLORS[key] : 'bg-gray-50 text-gray-600';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#212121]">Аудит-логи</h1>
        <span className="text-sm text-[#9e9e9e]">Записей: {total.toLocaleString('ru')}</span>
      </div>

      {/* Статистика действий */}
      {actionStats.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-[#424242]">Частые действия</h2>
          <div className="flex flex-wrap gap-2">
            {actionStats.map((s) => (
              <a
                key={s.action}
                href={`/admin/audit?action=${encodeURIComponent(s.action)}`}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium
                  transition-colors hover:opacity-80 ${getActionColor(s.action)}`}
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
            <a href="/admin/audit" className="text-[#9e9e9e] hover:text-red-500 ml-1">
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
            <a href="/admin/audit" className="text-[#9e9e9e] hover:text-red-500 ml-1">
              ×
            </a>
          </div>
        )}
        {!actionFilter && !userIdFilter && (
          <p className="text-sm text-[#9e9e9e]">Нажмите на действие выше для фильтрации</p>
        )}
      </div>

      {/* Таблица */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-center px-3 py-3 text-[#bdbdbd] font-medium w-10">#</th>
              <th className="text-left px-4 py-3 text-[#757575] font-medium">Время</th>
              <th className="text-left px-4 py-3 text-[#757575] font-medium">Пользователь</th>
              <th className="text-left px-4 py-3 text-[#757575] font-medium">Действие</th>
              <th className="text-left px-4 py-3 text-[#757575] font-medium">Ресурс</th>
              <th className="text-left px-4 py-3 text-[#757575] font-medium">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {logs.map((log, idx) => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-3 text-center text-xs text-[#bdbdbd] font-mono">
                  {skip + idx + 1}
                </td>
                <td className="px-4 py-3 text-[#9e9e9e] text-xs font-mono whitespace-nowrap">
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
                      <p className="text-[#424242] font-medium truncate max-w-[160px]">
                        {log.user.profile?.fullName ?? log.user.email}
                      </p>
                      <p className="text-xs text-[#9e9e9e]">
                        {roleLabels[log.user.role] ?? log.user.role}
                      </p>
                    </>
                  ) : (
                    <span className="text-xs text-[#bdbdbd]">Анонимно</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-medium ${getActionColor(log.action)}`}
                  >
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#424242] font-mono text-xs max-w-[200px] truncate">
                  {log.resource}
                </td>
                <td className="px-4 py-3 text-[#9e9e9e] font-mono text-xs">
                  {log.ipAddress ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <div className="text-center py-12 text-[#9e9e9e]">
            <p className="text-4xl mb-3">🔒</p>
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
