/**
 * @file page.tsx
 * @description Главная страница админ-панели: ключевые метрики платформы
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';

export const metadata: Metadata = {
  title: 'Администратор — MemoMed AI',
};

export default async function AdminPage() {
  const isDev = process.env.NODE_ENV === 'development';

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
    { label: 'Пользователей', value: userCount, icon: '👥', href: '/admin/users' },
    {
      label: 'Лекарств (активных)',
      value: medicationCount,
      icon: '💊',
      href: '/admin/medications',
    },
    { label: 'Приёмов лекарств', value: logCount, icon: '✅', href: null },
    { label: 'Сообщений AI-чату', value: chatCount, icon: '🤖', href: '/admin/stats' },
    { label: 'Отзывов о лекарствах', value: feedbackCount, icon: '📝', href: null },
  ];

  const roleLabels: Record<string, string> = {
    patient: '👤 Пациент',
    relative: '👨‍👩‍👧 Родственник',
    doctor: '👨‍⚕️ Врач',
    admin: '🛡️ Администратор',
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#212121]">Обзор платформы</h1>
        {isDev && (
          <Link
            href="/dev-login"
            className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-300
              text-yellow-800 rounded-xl text-sm font-medium hover:bg-yellow-100 transition-colors"
          >
            🔧 Dev Login
          </Link>
        )}
      </div>

      {/* Метрики */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card) => {
          const content = (
            <div
              className="bg-white rounded-2xl border border-gray-100 p-5 space-y-1
                hover:border-[#1565C0] hover:shadow-sm transition-all"
            >
              <p className="text-3xl">{card.icon}</p>
              <p className="text-2xl font-bold text-[#212121]">{card.value.toLocaleString('ru')}</p>
              <p className="text-sm text-[#9e9e9e]">{card.label}</p>
            </div>
          );
          return card.href ? (
            <Link key={card.label} href={card.href}>
              {content}
            </Link>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}
      </div>

      {/* Быстрые ссылки */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { href: '/admin/medications', icon: '💊', label: 'Все лекарства', sub: 'По пациентам' },
          { href: '/admin/connections', icon: '🔗', label: 'Связи', sub: 'Пациент-родственник' },
          { href: '/admin/audit', icon: '🔒', label: 'Аудит', sub: 'Лог действий' },
          { href: '/admin/prompts', icon: '🤖', label: 'Промпты AI', sub: 'Управление шаблонами' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-[#1565C0]
              hover:shadow-sm transition-all group"
          >
            <p className="text-2xl mb-2">{item.icon}</p>
            <p
              className="text-sm font-semibold text-[#212121] group-hover:text-[#1565C0]
              transition-colors"
            >
              {item.label}
            </p>
            <p className="text-xs text-[#9e9e9e] mt-0.5">{item.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Роли */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="text-base font-semibold text-[#424242]">Распределение по ролям</h2>
          <ul className="space-y-3">
            {roleBreakdown.map((r) => (
              <li key={r.role} className="flex items-center justify-between">
                <span className="text-sm text-[#424242]">{roleLabels[r.role] ?? r.role}</span>
                <span className="text-sm font-bold text-[#1565C0]">{r._count.id}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Последние регистрации */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="text-base font-semibold text-[#424242]">Последние регистрации</h2>
          <ul className="space-y-3">
            {recentUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between text-sm">
                <span className="text-[#424242] truncate max-w-[200px]">{u.email}</span>
                <div className="text-right">
                  <span className="text-xs text-[#9e9e9e]">{roleLabels[u.role] ?? u.role}</span>
                  <br />
                  <span className="text-xs text-[#bdbdbd]">
                    {u.createdAt.toLocaleDateString('ru')}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/admin/users" className="text-sm text-[#1565C0] hover:underline">
            Все пользователи →
          </Link>
        </div>
      </div>
    </div>
  );
}
