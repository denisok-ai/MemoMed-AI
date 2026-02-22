/**
 * @file layout.tsx
 * @description Layout для страниц администратора: проверка роли admin
 * @created 2026-02-22
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { SignOutButton } from '@/components/shared/sign-out-button';

const NAV_GROUPS = [
  {
    label: null,
    items: [
      { href: '/admin', label: '📊 Обзор' },
      { href: '/admin/reports', label: '📋 Отчёты' },
    ],
  },
  {
    label: 'Данные',
    items: [
      { href: '/admin/users', label: '👥 Пользователи' },
      { href: '/admin/medications', label: '💊 Лекарства' },
      { href: '/admin/connections', label: '🔗 Связи' },
    ],
  },
  {
    label: 'AI',
    items: [
      { href: '/admin/llm', label: '🧠 LLM Провайдеры' },
      { href: '/admin/prompts', label: '🤖 Промпты' },
      { href: '/admin/stats', label: '📈 Статистика AI' },
    ],
  },
  {
    label: 'Система',
    items: [{ href: '/admin/audit', label: '🔒 Аудит' }],
  },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect('/login');
  if (session.user.role !== 'admin') redirect('/dashboard');

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Боковая навигация */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col p-4 fixed h-full overflow-y-auto">
        {/* Логотип */}
        <Link href="/admin" className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[#1565C0] flex items-center justify-center text-white text-sm">
            🛡️
          </div>
          <span className="text-base font-bold text-[#1565C0] font-[family-name:var(--font-montserrat)]">
            MemoMed Admin
          </span>
        </Link>

        {/* Навигационные группы */}
        <nav className="flex-1 space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label ?? 'main'}>
              {group.label && (
                <p
                  className="text-[10px] font-bold text-[#bdbdbd] uppercase tracking-widest
                  px-3 mb-1"
                >
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center px-3 py-2 rounded-xl text-[#424242]
                      hover:bg-blue-50 hover:text-[#1565C0] transition-colors text-sm font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Низ панели */}
        <div className="space-y-2 pt-4 border-t border-gray-100">
          {isDev && (
            <Link
              href="/dev-login"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-yellow-700
                bg-yellow-50 hover:bg-yellow-100 transition-colors text-xs font-medium"
            >
              🔧 Dev Login
            </Link>
          )}
          <SignOutButton />
        </div>
      </aside>

      {/* Основной контент */}
      <main className="ml-60 flex-1 p-8 max-w-[calc(100vw-240px)]">{children}</main>
    </div>
  );
}
