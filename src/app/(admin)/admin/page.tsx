/**
 * @file page.tsx
 * @description Главная страница админ-панели — смелый MedTech, цветовые акценты
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import {
  AdminPillIcon,
  AdminLinkIcon,
  AdminShieldIcon,
  AdminAiIcon,
  AdminUsersIcon,
  AdminCheckIcon,
  AdminFeedbackIcon,
  AdminChartIcon,
} from '@/components/admin/admin-icons';

export const metadata: Metadata = {
  title: 'Администратор — MemoMed AI',
};

const QUICK_LINKS = [
  {
    href: '/admin/medications',
    Icon: AdminPillIcon,
    label: 'Все лекарства',
    sub: 'По пациентам',
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
  },
  {
    href: '/admin/connections',
    Icon: AdminLinkIcon,
    label: 'Связи',
    sub: 'Пациент-родственник',
    gradient: 'from-emerald-500 to-green-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
  },
  {
    href: '/admin/audit',
    Icon: AdminShieldIcon,
    label: 'Аудит',
    sub: 'Лог действий',
    gradient: 'from-slate-500 to-slate-600',
    bg: 'bg-slate-50 dark:bg-slate-900/50',
  },
  {
    href: '/admin/prompts',
    Icon: AdminAiIcon,
    label: 'Промпты AI',
    sub: 'Управление шаблонами',
    gradient: 'from-cyan-500 to-cyan-600',
    bg: 'bg-cyan-50 dark:bg-cyan-950/40',
  },
] as const;

export default async function AdminPage() {
  const isDev = process.env.NODE_ENV === 'development' || process.env.ENABLE_DEV_LOGIN === 'true';

  const [userCount, medicationCount, logCount, chatCount, feedbackCount] = await Promise.all([
    prisma.user.count(),
    prisma.medication.count({ where: { isActive: true } }),
    prisma.medicationLog.count(),
    prisma.chatMessage.count(),
    prisma.medicationFeedback.count(),
  ]);

  const roleBreakdown = await prisma.user.groupBy({
    by: ['role'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  });

  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  const cards = [
    {
      label: 'Пользователей',
      value: userCount,
      Icon: AdminUsersIcon,
      gradient: 'from-blue-500 to-blue-600',
      href: '/admin/users',
    },
    {
      label: 'Лекарств (активных)',
      value: medicationCount,
      Icon: AdminPillIcon,
      gradient: 'from-emerald-500 to-teal-600',
      href: '/admin/medications',
    },
    {
      label: 'Приёмов лекарств',
      value: logCount,
      Icon: AdminCheckIcon,
      gradient: 'from-slate-500 to-slate-600',
      href: null,
    },
    {
      label: 'Сообщений AI-чату',
      value: chatCount,
      Icon: AdminChartIcon,
      gradient: 'from-cyan-500 to-cyan-600',
      href: '/admin/stats',
    },
    {
      label: 'Отзывов о лекарствах',
      value: feedbackCount,
      Icon: AdminFeedbackIcon,
      gradient: 'from-amber-500 to-amber-600',
      href: null,
    },
  ];

  const roleLabels: Record<string, string> = {
    patient: 'Пациент',
    relative: 'Родственник',
    doctor: 'Врач',
    admin: 'Администратор',
  };

  return (
    <div className="space-y-8 lg:space-y-10 med-animate max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0D1B2A] dark:text-white tracking-tight">
          Обзор платформы
        </h1>
        {isDev && (
          <Link
            href="/dev-login"
            className="flex items-center gap-2 px-5 py-3 bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800
              text-yellow-800 dark:text-yellow-200 rounded-xl text-base font-semibold hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition-colors
              min-h-[52px] w-fit"
          >
            Dev Login
          </Link>
        )}
      </div>

      {/* Метрики — одинаковые карточки, единые отступы */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5 med-stagger">
        {cards.map((card) => {
          const { Icon } = card;
          const content = (
            <div className="med-stat med-stat-admin group h-full min-h-[160px] lg:min-h-[180px] flex flex-col">
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${card.gradient}
                  flex items-center justify-center text-white shadow-lg shrink-0
                  group-hover:shadow-xl group-hover:scale-105 transition-all duration-200 mb-3`}
              >
                <Icon className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden />
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0D1B2A] dark:text-white">
                {card.value.toLocaleString('ru')}
              </p>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-0.5">
                {card.label}
              </p>
            </div>
          );
          return card.href ? (
            <Link key={card.label} href={card.href} className="block h-full">
              {content}
            </Link>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}
      </div>

      {/* Быстрые ссылки — одинаковые карточки */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 med-stagger">
        {QUICK_LINKS.map(({ href, Icon, label, sub, gradient, bg }) => (
          <Link
            key={href}
            href={href}
            className={`group flex flex-col gap-3 sm:gap-4 p-5 sm:p-6 rounded-2xl ${bg} border-2 border-transparent
              hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-xl hover:-translate-y-1
              active:scale-[0.98] transition-all duration-200
              min-h-[140px] sm:min-h-[160px] lg:min-h-[180px]`}
          >
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${gradient}
                flex items-center justify-center text-white shadow-lg
                group-hover:shadow-xl group-hover:scale-110 transition-all duration-200`}
            >
              <Icon className="w-7 h-7 sm:w-8 sm:h-8" aria-hidden />
            </div>
            <div>
              <p className="font-bold text-[#0D1B2A] dark:text-white text-base sm:text-lg group-hover:text-[#1565C0] dark:group-hover:text-blue-400 transition-colors">
                {label}
              </p>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-0.5">
                {sub}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Роли — med-card с акцентом */}
        <div className="med-card p-5 sm:p-6 space-y-4 sm:space-y-5">
          <h2 className="text-lg sm:text-xl font-bold text-[#0D1B2A] dark:text-white">
            Распределение по ролям
          </h2>
          <ul className="space-y-3 sm:space-y-4">
            {roleBreakdown.map((r) => (
              <li key={r.role} className="flex items-center justify-between py-1">
                <span className="text-base text-[#475569] dark:text-slate-300">
                  {roleLabels[r.role] ?? r.role}
                </span>
                <span className="text-base sm:text-lg font-bold text-[#1565C0] dark:text-blue-400">
                  {r._count.id}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Последние регистрации */}
        <div className="med-card p-5 sm:p-6 space-y-4 sm:space-y-5">
          <h2 className="text-lg sm:text-xl font-bold text-[#0D1B2A] dark:text-white">
            Последние регистрации
          </h2>
          <ul className="space-y-3 sm:space-y-4">
            {recentUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between text-base py-2">
                <span className="text-[#0D1B2A] dark:text-white truncate max-w-[220px] font-medium">
                  {u.email}
                </span>
                <div className="text-right shrink-0">
                  <span className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
                    {roleLabels[u.role] ?? u.role}
                  </span>
                  <br />
                  <span className="text-sm sm:text-base text-slate-400 dark:text-slate-500">
                    {u.createdAt.toLocaleDateString('ru')}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/admin/users"
            className="inline-block text-base sm:text-lg font-semibold text-[#1565C0] dark:text-blue-400 hover:text-[#0D47A1] dark:hover:text-blue-300 hover:underline transition-colors mt-2"
          >
            Все пользователи →
          </Link>
        </div>
      </div>
    </div>
  );
}
