/**
 * @file page.tsx
 * @description Страница быстрого входа для разработчиков.
 * Только для NODE_ENV=development. Отображает карточки для входа по ролям.
 * @dependencies devLoginAction, next/navigation
 * @created 2026-02-22
 */

import { redirect } from 'next/navigation';
import { devLoginAction } from '@/lib/auth/dev-actions';
import type { Metadata } from 'next';
import { AdminShieldIcon, AdminUsersIcon } from '@/components/admin/admin-icons';
import { UserIcon, HeartPulseIcon } from '@/components/shared/nav-icons';

// Проверка в Server Component — env доступны в runtime (в middleware — только при сборке)
const isDevLoginEnabled =
  process.env.NODE_ENV === 'development' || process.env.ENABLE_DEV_LOGIN === 'true';

export const metadata: Metadata = {
  title: 'Dev Login — MemoMed AI',
};

interface DevAccount {
  email: string;
  label: string;
  role: string;
  description: string;
  Icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  gradient: string;
  bg: string;
}

const DEV_ACCOUNTS: DevAccount[] = [
  {
    email: 'admin@memomed.dev',
    label: 'Администратор',
    role: 'admin',
    description: 'Полный доступ: пользователи, лекарства, промпты, статистика AI, аудит',
    Icon: AdminShieldIcon,
    gradient: 'from-slate-500 to-slate-600',
    bg: 'bg-slate-50',
  },
  {
    email: 'doctor1@memomed.dev',
    label: 'Врач (Кардиолог)',
    role: 'doctor',
    description: 'Просмотр пациентов, статистика дисциплины, отчёты',
    Icon: HeartPulseIcon,
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
  },
  {
    email: 'doctor2@memomed.dev',
    label: 'Врач (Терапевт)',
    role: 'doctor',
    description: 'Другой врач для тестирования нескольких докторов',
    Icon: HeartPulseIcon,
    gradient: 'from-cyan-500 to-cyan-600',
    bg: 'bg-cyan-50',
  },
  {
    email: 'relative1@memomed.dev',
    label: 'Родственник 1',
    role: 'relative',
    description: 'Живая лента приёмов, уведомления, календарь пациента',
    Icon: AdminUsersIcon,
    gradient: 'from-emerald-500 to-green-600',
    bg: 'bg-emerald-50',
  },
  {
    email: 'relative2@memomed.dev',
    label: 'Родственник 2',
    role: 'relative',
    description: 'Второй родственник: другие связанные пациенты',
    Icon: AdminUsersIcon,
    gradient: 'from-teal-500 to-teal-600',
    bg: 'bg-teal-50',
  },
  {
    email: 'relative10@memomed.dev',
    label: 'Родственник 10',
    role: 'relative',
    description: 'Родственник с пациентами patient10, patient35',
    Icon: AdminUsersIcon,
    gradient: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    email: 'patient1@memomed.dev',
    label: 'Пациент 1',
    role: 'patient',
    description: 'Иванов Александр · 5–10 лекарств · связан с родственником',
    Icon: UserIcon,
    gradient: 'from-indigo-500 to-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    email: 'patient2@memomed.dev',
    label: 'Пациент 2',
    role: 'patient',
    description: 'Смирнова Елена · другой набор лекарств',
    Icon: UserIcon,
    gradient: 'from-violet-500 to-violet-600',
    bg: 'bg-violet-50',
  },
  {
    email: 'patient10@memomed.dev',
    label: 'Пациент 10',
    role: 'patient',
    description: 'Кузнецов Сергей · без родственника · для изолированного теста',
    Icon: UserIcon,
    gradient: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-50',
  },
];

export default function DevLoginPage() {
  if (!isDevLoginEnabled) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-[#F0F4F8] p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8 lg:space-y-10 med-animate">
        {/* Шапка */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div
              className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200
                text-yellow-800 px-4 py-2 rounded-xl text-sm font-semibold mb-3"
            >
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              Режим разработки
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0D1B2A] tracking-tight">
              Быстрый вход
            </h1>
            <p className="text-slate-500 mt-1 max-w-lg">
              Выберите роль для мгновенного входа. Доступно при{' '}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-sm">
                ENABLE_DEV_LOGIN=true
              </code>
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Пароль всех аккаунтов: <span className="font-mono text-[#0D1B2A]">Test1234!</span>
            </p>
          </div>
          <a href="/login" className="med-btn-secondary shrink-0 w-fit">
            Обычный вход
          </a>
        </div>

        {/* Сетка аккаунтов — стиль как admin QUICK_LINKS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {DEV_ACCOUNTS.map((account) => {
            const Icon = account.Icon;
            return (
              <form
                key={account.email}
                action={devLoginAction.bind(null, account.email, account.role)}
              >
                <button
                  type="submit"
                  className={`w-full text-left group flex flex-col gap-3 p-5 sm:p-6 rounded-2xl
                    ${account.bg} border-2 border-transparent
                    hover:border-slate-200 hover:shadow-xl hover:-translate-y-1
                    active:scale-[0.98] transition-all duration-200
                    min-h-[140px] sm:min-h-[160px]`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${account.gradient}
                      flex items-center justify-center text-white shadow-lg
                      group-hover:shadow-xl group-hover:scale-110 transition-all duration-200`}
                  >
                    <Icon className="w-7 h-7" aria-hidden />
                  </div>
                  <div>
                    <p className="font-bold text-[#0D1B2A] text-base group-hover:text-[#1565C0] transition-colors">
                      {account.label}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5 truncate font-mono">
                      {account.email}
                    </p>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                      {account.description}
                    </p>
                  </div>
                </button>
              </form>
            );
          })}
        </div>

        {/* Все родственники — med-card */}
        <div className="med-card p-5 sm:p-6 space-y-4">
          <h2 className="text-lg font-bold text-[#0D1B2A]">
            Все тестовые родственники (relative1 — relative25)
          </h2>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
              <form
                key={n}
                action={devLoginAction.bind(null, `relative${n}@memomed.dev`, 'relative')}
              >
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200
                    text-emerald-700 text-sm font-medium rounded-xl
                    transition-all hover:shadow-md active:scale-95 min-h-[44px]"
                >
                  #{n}
                </button>
              </form>
            ))}
          </div>
        </div>

        {/* Все пациенты — med-card */}
        <div className="med-card p-5 sm:p-6 space-y-4">
          <h2 className="text-lg font-bold text-[#0D1B2A]">
            Все тестовые пациенты (patient1 — patient50)
          </h2>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 50 }, (_, i) => i + 1).map((n) => (
              <form
                key={n}
                action={devLoginAction.bind(null, `patient${n}@memomed.dev`, 'patient')}
              >
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200
                    text-indigo-700 text-sm font-medium rounded-xl
                    transition-all hover:shadow-md active:scale-95 min-h-[44px]"
                >
                  #{n}
                </button>
              </form>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
