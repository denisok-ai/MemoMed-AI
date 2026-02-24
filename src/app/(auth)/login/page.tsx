/**
 * @file page.tsx
 * @description Страница входа в стиле MedTech: двухколоночная верстка на десктопе,
 * медицинский брендинг, профессиональная форма
 * @dependencies LoginForm
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/components/shared/login-form';
import { Logo } from '@/components/shared/logo';
import {
  MedCrossIcon,
  HeartPulseIcon,
  PillIcon,
  ClipboardIcon,
} from '@/components/shared/nav-icons';

export const metadata: Metadata = {
  title: 'Вход — MemoMed AI',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex">
      {/* Левая панель — брендинг (только на десктопе) */}
      <div
        className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-[#0D47A1] via-[#1565C0] to-[#1976D2]
          flex-col justify-between p-10 relative overflow-hidden"
        aria-hidden="true"
      >
        {/* Декоративные круги */}
        <div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full
          bg-white/5 blur-3xl"
        />
        <div
          className="absolute bottom-0 -left-20 w-60 h-60 rounded-full
          bg-white/5 blur-2xl"
        />

        {/* Логотип */}
        <div className="relative z-10">
          <Logo variant="auth-dark" showIcon />
          <p className="text-blue-200 text-sm font-medium mt-1">Контроль приёма лекарств</p>
        </div>

        {/* Преимущества */}
        <div className="space-y-5 relative z-10">
          {[
            { Icon: PillIcon, text: 'Напоминания о каждом приёме лекарства' },
            { Icon: HeartPulseIcon, text: 'Дневник самочувствия и AI-анализ корреляций' },
            { Icon: ClipboardIcon, text: 'Отчёты для врача в формате PDF' },
          ].map(({ Icon, text }) => (
            <div key={text} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-white/90 text-base leading-snug">{text}</p>
            </div>
          ))}
        </div>

        {/* Нижний текст */}
        <p className="text-blue-200/70 text-sm relative z-10">
          Соответствует требованиям GDPR и 152-ФЗ
        </p>
      </div>

      {/* Правая панель — форма */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#F0F4F8]">
        <div className="w-full max-w-md space-y-8">
          {/* Мобильный логотип */}
          <div className="lg:hidden flex justify-center">
            <Logo variant="auth" showIcon />
          </div>

          {/* Заголовок */}
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold text-[#0D1B2A]">Добро пожаловать</h1>
            <p className="text-[#475569] mt-1 text-lg">Войдите в свой аккаунт</p>
          </div>

          {/* Форма */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 space-y-6">
            <LoginForm />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-400 font-medium">или</span>
              </div>
            </div>

            <p className="text-center text-base text-slate-500">
              Нет аккаунта?{' '}
              <Link
                href="/register"
                className="text-[#1565C0] font-semibold hover:text-[#0D47A1]
                  hover:underline transition-colors"
              >
                Зарегистрируйтесь
              </Link>
            </p>
          </div>

          {/* Dev-режим подсказка */}
          {(process.env.NODE_ENV === 'development' || process.env.ENABLE_DEV_LOGIN === 'true') && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-center space-y-1">
              <p className="text-yellow-700 text-xs font-mono font-bold tracking-wide">
                РЕЖИМ РАЗРАБОТКИ
              </p>
              <Link
                href="/dev-login"
                className="text-yellow-800 text-sm font-semibold hover:underline block"
              >
                Быстрый вход по роли →
              </Link>
            </div>
          )}

          {/* Дисклеймер */}
          <p className="text-center text-xs text-slate-400 px-4">
            Используя MemoMed AI, вы соглашаетесь с обработкой персональных данных согласно 152-ФЗ.
          </p>
        </div>
      </div>
    </main>
  );
}
