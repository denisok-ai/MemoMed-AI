/**
 * @file page.tsx
 * @description Статистика использования AI (токены, чаты) в админ-панели
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import { prisma } from '@/lib/db/prisma';
import { AdminAiIcon, AdminChartIcon } from '@/components/admin/admin-icons';
import { ClipboardIcon } from '@/components/shared/nav-icons';

export const metadata: Metadata = {
  title: 'Статистика AI — Админ — MemoMed AI',
};

export default async function AdminStatsPage() {
  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);

  // Текущий месяц в формате YYYY-MM для фильтрации monthKey
  const monthKey = currentMonth.toISOString().slice(0, 7);

  const [allStats, topUsers] = await Promise.all([
    prisma.aiUsageStat.findMany({
      select: { totalTokens: true, messageCount: true, monthKey: true, userId: true },
    }),
    prisma.aiUsageStat.groupBy({
      by: ['userId'],
      _sum: { totalTokens: true, messageCount: true },
      orderBy: { _sum: { totalTokens: 'desc' } },
      take: 10,
    }),
  ]);

  const topUserIds = topUsers.map((u) => u.userId);
  const topUserProfiles = await prisma.user.findMany({
    where: { id: { in: topUserIds } },
    select: { id: true, email: true, profile: { select: { fullName: true } } },
  });
  const userMap = new Map(topUserProfiles.map((u) => [u.id, u]));

  const totalTokens = allStats.reduce((s, r) => s + r.totalTokens, 0);
  const totalRequests = allStats.reduce((s, r) => s + r.messageCount, 0);
  const monthStats = allStats.filter((r) => r.monthKey === monthKey);
  const monthTokens = monthStats.reduce((s, r) => s + r.totalTokens, 0);
  const monthRequests = monthStats.reduce((s, r) => s + r.messageCount, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#212121]">Статистика AI</h1>

      {/* Сводка */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Токенов всего', Icon: AdminAiIcon, gradient: 'from-cyan-500 to-cyan-600' },
          {
            label: 'Токенов в этом месяце',
            Icon: ClipboardIcon,
            gradient: 'from-blue-500 to-blue-600',
          },
          {
            label: 'Запросов всего',
            Icon: AdminChartIcon,
            gradient: 'from-indigo-500 to-indigo-600',
          },
          {
            label: 'Запросов в этом месяце',
            Icon: AdminChartIcon,
            gradient: 'from-violet-500 to-violet-600',
          },
        ].map((card, i) => {
          const values = [
            totalTokens.toLocaleString('ru'),
            monthTokens.toLocaleString('ru'),
            totalRequests.toLocaleString('ru'),
            monthRequests.toLocaleString('ru'),
          ];
          const Icon = card.Icon;
          return (
            <div key={card.label} className="med-stat p-5">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white mb-3`}
              >
                <Icon className="w-6 h-6" aria-hidden />
              </div>
              <p className="text-2xl font-bold text-[#0D1B2A]">{values[i]}</p>
              <p className="text-xs text-slate-500">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Топ пользователей */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
        <h2 className="text-base font-semibold text-[#0D1B2A]">Топ-10 по использованию токенов</h2>
        {topUsers.length === 0 ? (
          <p className="text-sm text-slate-500">Нет данных</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100">
              <tr>
                <th className="text-left pb-2 text-slate-500 font-medium">#</th>
                <th className="text-left pb-2 text-slate-500 font-medium">Пользователь</th>
                <th className="text-right pb-2 text-slate-500 font-medium">Токены</th>
                <th className="text-right pb-2 text-slate-500 font-medium">Запросов</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topUsers.map((u, i) => {
                const user = userMap.get(u.userId);
                return (
                  <tr key={u.userId}>
                    <td className="py-2 text-slate-500">{i + 1}</td>
                    <td className="py-2">
                      <p className="font-medium text-[#212121] truncate max-w-[200px]">
                        {user?.profile?.fullName ?? user?.email ?? u.userId.slice(0, 8)}
                      </p>
                    </td>
                    <td className="py-2 text-right text-[#1565C0] font-medium">
                      {(u._sum?.totalTokens ?? 0).toLocaleString('ru')}
                    </td>
                    <td className="py-2 text-right text-[#0D1B2A]">{u._sum?.messageCount ?? 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
