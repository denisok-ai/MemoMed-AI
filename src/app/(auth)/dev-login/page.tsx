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

// Проверка в Server Component — env доступны в runtime (в middleware — только при сборке)
const isDevLoginEnabled =
  process.env.NODE_ENV === 'development' || process.env.ENABLE_DEV_LOGIN === 'true';

export const metadata: Metadata = {
  title: '🔧 Dev Login — MemoMed AI',
};

interface DevAccount {
  email: string;
  label: string;
  role: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  avatarBg: string;
}

const DEV_ACCOUNTS: DevAccount[] = [
  {
    email: 'admin@memomed.dev',
    label: 'Администратор',
    role: 'admin',
    description: 'Полный доступ: пользователи, лекарства, промпты, статистика AI, аудит',
    icon: '🛡️',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200 hover:border-red-400',
    avatarBg: 'bg-red-100',
  },
  {
    email: 'doctor1@memomed.dev',
    label: 'Врач (Кардиолог)',
    role: 'doctor',
    description: 'Просмотр пациентов, статистика дисциплины, отчёты',
    icon: '👨‍⚕️',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200 hover:border-blue-400',
    avatarBg: 'bg-blue-100',
  },
  {
    email: 'doctor2@memomed.dev',
    label: 'Врач (Терапевт)',
    role: 'doctor',
    description: 'Другой врач для тестирования нескольких докторов',
    icon: '👩‍⚕️',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200 hover:border-blue-400',
    avatarBg: 'bg-blue-100',
  },
  {
    email: 'relative1@memomed.dev',
    label: 'Родственник 1',
    role: 'relative',
    description: 'Живая лента приёмов, уведомления, календарь пациента',
    icon: '👨‍👩‍👧',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200 hover:border-green-400',
    avatarBg: 'bg-green-100',
  },
  {
    email: 'relative2@memomed.dev',
    label: 'Родственник 2',
    role: 'relative',
    description: 'Второй родственник: другие связанные пациенты',
    icon: '👩‍👦',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200 hover:border-green-400',
    avatarBg: 'bg-green-100',
  },
  {
    email: 'patient1@memomed.dev',
    label: 'Пациент 1',
    role: 'patient',
    description: 'Иванов Александр · 5–10 лекарств · связан с родственником',
    icon: '👤',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200 hover:border-purple-400',
    avatarBg: 'bg-purple-100',
  },
  {
    email: 'patient2@memomed.dev',
    label: 'Пациент 2',
    role: 'patient',
    description: 'Смирнова Елена · другой набор лекарств',
    icon: '👵',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200 hover:border-purple-400',
    avatarBg: 'bg-purple-100',
  },
  {
    email: 'patient10@memomed.dev',
    label: 'Пациент 10',
    role: 'patient',
    description: 'Кузнецов Сергей · без родственника · для изолированного теста',
    icon: '👴',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200 hover:border-purple-400',
    avatarBg: 'bg-purple-100',
  },
];

export default function DevLoginPage() {
  if (!isDevLoginEnabled) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Шапка */}
        <div className="text-center space-y-3 pt-6">
          <div
            className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/40
            text-yellow-300 px-4 py-2 rounded-full text-sm font-mono font-bold tracking-wide"
          >
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            РЕЖИМ РАЗРАБОТКИ
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">🔧 Быстрый вход</h1>
          <p className="text-slate-400 text-lg max-w-md mx-auto">
            Выберите роль для мгновенного входа в систему. Доступна в режиме разработки или при{' '}
            <code className="text-yellow-300 font-mono">ENABLE_DEV_LOGIN=true</code>.
          </p>
          <p className="text-slate-500 text-sm font-mono">
            Пароль всех аккаунтов:{' '}
            <span className="text-slate-300 bg-slate-700 px-2 py-0.5 rounded">Test1234!</span>
          </p>
        </div>

        {/* Сетка аккаунтов */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DEV_ACCOUNTS.map((account) => (
            <form
              key={account.email}
              action={devLoginAction.bind(null, account.email, account.role)}
            >
              <button
                type="submit"
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200
                  ${account.bgColor} ${account.borderColor}
                  hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl ${account.avatarBg} flex items-center
                    justify-center text-2xl flex-shrink-0`}
                  >
                    {account.icon}
                  </div>
                  <div className="min-w-0">
                    <p className={`font-bold text-base leading-tight ${account.color}`}>
                      {account.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono truncate">
                      {account.email}
                    </p>
                    <p className="text-xs text-slate-600 mt-1.5 leading-snug">
                      {account.description}
                    </p>
                  </div>
                </div>
              </button>
            </form>
          ))}
        </div>

        {/* Все пациенты */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-5 space-y-4">
          <h2 className="text-slate-200 font-semibold text-base">
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
                  className="px-3 py-1.5 bg-purple-900/40 hover:bg-purple-800/60
                    border border-purple-700/50 hover:border-purple-500
                    text-purple-200 text-xs font-mono rounded-lg
                    transition-all hover:scale-105 active:scale-95"
                >
                  #{n}
                </button>
              </form>
            ))}
          </div>
        </div>

        {/* Ссылка на обычный вход */}
        <div className="text-center pb-8">
          <a
            href="/login"
            className="text-slate-500 hover:text-slate-300 text-sm transition-colors
              hover:underline"
          >
            ← Обычная страница входа
          </a>
        </div>
      </div>
    </main>
  );
}
