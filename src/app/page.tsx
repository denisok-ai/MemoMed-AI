/**
 * @file page.tsx
 * @description Landing page — WOW MedTech 2025/2026:
 * animated gradient hero, floating particles, glassmorphism,
 * animated counters, feature bento, social proof, compelling CTA
 * @created 2026-02-22
 */

import Link from 'next/link';
import {
  MedCrossIcon,
  PillIcon,
  HeartPulseIcon,
  UsersIcon,
  BotIcon,
  BarChartIcon,
  ClipboardIcon,
  CheckIcon,
  ChevronRightIcon,
  LockIcon,
  UserIcon,
} from '@/components/shared/nav-icons';

const FEATURES = [
  {
    Icon: PillIcon,
    title: 'Умные напоминания',
    desc: 'Настойчивые push-уведомления и голосовые напоминания точно в нужное время',
    gradient: 'from-blue-500 to-blue-600',
    span: '',
  },
  {
    Icon: UsersIcon,
    title: 'Контроль близких',
    desc: 'Родственники видят приёмы лекарств в реальном времени через live-ленту',
    gradient: 'from-emerald-500 to-green-600',
    span: '',
  },
  {
    Icon: BotIcon,
    title: 'AI-помощник',
    desc: 'Отвечает на вопросы о лекарствах простым языком. Анализирует корреляции',
    gradient: 'from-cyan-500 to-blue-600',
    span: 'sm:col-span-2 lg:col-span-1',
  },
  {
    Icon: BarChartIcon,
    title: 'Статистика и тренды',
    desc: 'Дисциплина приёма, стрики, детальная аналитика за 30/90/180 дней',
    gradient: 'from-teal-500 to-teal-600',
    span: '',
  },
  {
    Icon: ClipboardIcon,
    title: 'PDF-отчёты для врача',
    desc: 'Сгенерированные отчёты с графиками — покажите врачу на приёме',
    gradient: 'from-indigo-500 to-indigo-600',
    span: '',
  },
  {
    Icon: HeartPulseIcon,
    title: 'Дневник самочувствия',
    desc: 'Отмечайте настроение, боли, побочные эффекты — AI найдёт паттерны',
    gradient: 'from-rose-500 to-pink-600',
    span: 'sm:col-span-2 lg:col-span-1',
  },
] as const;

const STEPS = [
  { num: '01', title: 'Зарегистрируйтесь', desc: 'Укажите имя, email и роль — за 30 секунд' },
  { num: '02', title: 'Добавьте лекарства', desc: 'Название, дозировку и время приёма' },
  { num: '03', title: 'Нажимайте «Принял»', desc: 'Большая кнопка на главном экране' },
  { num: '04', title: 'Всё под контролем', desc: 'Статистика, анализ и спокойствие близких' },
] as const;

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      {/* ═══════════ HERO ═══════════ */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center
        px-6 py-20 overflow-hidden"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 landing-gradient" aria-hidden="true" />

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          aria-hidden="true"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Floating orbs */}
        <div
          className="absolute top-1/4 left-[10%] w-72 h-72 rounded-full
          bg-white/[0.04] blur-3xl landing-float-slow"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-1/4 right-[15%] w-56 h-56 rounded-full
          bg-cyan-400/[0.06] blur-3xl landing-float-medium"
          aria-hidden="true"
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[600px] h-[600px] rounded-full bg-blue-400/[0.03] blur-3xl"
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative z-10 max-w-4xl w-full text-center space-y-8">
          {/* Logo */}
          <div
            className="flex items-center justify-center gap-4 landing-reveal"
            style={{ animationDelay: '0ms' }}
          >
            <div
              className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md
              flex items-center justify-center border border-white/20
              shadow-2xl shadow-black/10"
            >
              <MedCrossIcon className="w-9 h-9 text-white" />
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="landing-reveal" style={{ animationDelay: '100ms' }}>
              <span
                className="block text-5xl md:text-7xl font-black text-white
                tracking-tight leading-[1.1]
                font-[family-name:var(--font-montserrat)]
                drop-shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
              >
                MemoMed AI
              </span>
            </h1>
            <p
              className="text-xl md:text-2xl text-white/80 font-medium max-w-2xl mx-auto
              leading-relaxed landing-reveal"
              style={{ animationDelay: '200ms' }}
            >
              Заботливый AI-помощник для контроля приёма лекарств.
              <br className="hidden sm:block" />
              Никогда не пропускайте приём. Близкие всегда спокойны.
            </p>
          </div>

          {/* CTA buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center
            landing-reveal"
            style={{ animationDelay: '350ms' }}
          >
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-3
                px-10 py-5 text-lg font-black text-[#0D47A1]
                bg-white rounded-2xl
                hover:bg-white/95 hover:shadow-2xl hover:shadow-white/20
                hover:-translate-y-0.5
                active:scale-[0.97]
                transition-all duration-200 min-h-[56px]"
            >
              Начать бесплатно
              <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center
                px-10 py-5 text-lg font-bold text-white/90
                border-2 border-white/25 rounded-2xl backdrop-blur-sm
                hover:bg-white/10 hover:border-white/40
                hover:-translate-y-0.5
                active:scale-[0.97]
                transition-all duration-200 min-h-[56px]"
            >
              Войти в аккаунт
            </Link>
          </div>

          {/* Trust badges */}
          <div
            className="flex flex-wrap items-center justify-center gap-6 pt-4
            landing-reveal"
            style={{ animationDelay: '500ms' }}
          >
            {[
              { icon: <LockIcon className="w-4 h-4" />, text: 'GDPR & 152-ФЗ' },
              { icon: <CheckIcon className="w-4 h-4" />, text: 'Бесплатно' },
              { icon: <PillIcon className="w-4 h-4" />, text: 'Для пожилых 60+' },
            ].map(({ icon, text }) => (
              <span
                key={text}
                className="flex items-center gap-2 text-sm text-white/50 font-medium"
              >
                {icon}
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 landing-reveal"
          style={{ animationDelay: '700ms' }}
          aria-hidden="true"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
            <div className="w-1.5 h-3 rounded-full bg-white/40 landing-scroll-dot" />
          </div>
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section className="relative py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: '60+', label: 'Целевой возраст', sub: 'Крупные кнопки' },
              { value: '48px', label: 'Зоны нажатия', sub: 'WCAG 2.1 AAA' },
              { value: '24/7', label: 'AI-помощник', sub: 'Всегда на связи' },
              { value: 'PDF', label: 'Отчёты', sub: 'Для лечащего врача' },
            ].map(({ value, label, sub }) => (
              <div key={label} className="text-center space-y-2 group">
                <p
                  className="text-4xl md:text-5xl font-black bg-gradient-to-r
                  from-[#1565C0] to-[#00838F] bg-clip-text text-transparent
                  font-[family-name:var(--font-montserrat)]
                  group-hover:scale-105 transition-transform"
                >
                  {value}
                </p>
                <p className="text-base font-bold text-[#0D1B2A]">{label}</p>
                <p className="text-sm text-slate-400">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES — BENTO GRID ═══════════ */}
      <section className="relative py-24 px-6 bg-[#F0F4F8] med-dots">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <p className="text-sm font-black uppercase tracking-[0.15em] text-[#1565C0]">
              Возможности
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-[#0D1B2A]">
              Всё для контроля здоровья
            </h2>
            <p className="text-lg text-slate-500 max-w-lg mx-auto">
              Технологии на службе вашего здоровья — просто, понятно, надёжно
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ Icon, title, desc, gradient, span }) => (
              <div
                key={title}
                className={`group med-card p-6 space-y-4
                  hover:shadow-xl hover:-translate-y-1 transition-all duration-300
                  ${span}`}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient}
                  flex items-center justify-center shadow-lg
                  group-hover:scale-110 group-hover:rotate-3
                  transition-transform duration-300`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[#0D1B2A]">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="relative py-24 px-6 bg-white overflow-hidden">
        {/* Subtle gradient accent */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full
          bg-blue-50 blur-3xl -translate-y-1/2 translate-x-1/2"
          aria-hidden="true"
        />

        <div className="max-w-5xl mx-auto space-y-12 relative z-10">
          <div className="text-center space-y-4">
            <p className="text-sm font-black uppercase tracking-[0.15em] text-[#1565C0]">
              Как это работает
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-[#0D1B2A]">4 простых шага</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ num, title, desc }, i) => (
              <div key={num} className="group relative text-center space-y-4 p-6">
                {/* Connector line (desktop) */}
                {i < STEPS.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-12 left-[60%] w-[calc(100%-20%)]
                    h-0.5 bg-gradient-to-r from-blue-200 to-transparent"
                    aria-hidden="true"
                  />
                )}

                <div
                  className="w-16 h-16 rounded-2xl mx-auto
                  bg-gradient-to-br from-[#1565C0] to-[#1976D2]
                  flex items-center justify-center shadow-lg shadow-blue-200/40
                  group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-blue-200/50
                  transition-all duration-300"
                >
                  <span
                    className="text-2xl font-black text-white
                    font-[family-name:var(--font-montserrat)]"
                  >
                    {num}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#0D1B2A]">{title}</h3>
                <p className="text-sm text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SOCIAL PROOF ═══════════ */}
      <section className="relative py-24 px-6 bg-[#F0F4F8]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <p className="text-sm font-black uppercase tracking-[0.15em] text-[#1565C0]">
              Кому подходит
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-[#0D1B2A]">
              MemoMed AI для каждого
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                Icon: UserIcon,
                role: 'Пациент',
                quote: 'Крупные кнопки, понятный интерфейс — даже мне всё ясно с первого раза.',
                gradient: 'from-blue-500 to-blue-600',
              },
              {
                Icon: UsersIcon,
                role: 'Родственник',
                quote:
                  'Вижу в ленте, что мама приняла лекарство. Не нужно звонить по 5 раз в день.',
                gradient: 'from-emerald-500 to-green-600',
              },
              {
                Icon: HeartPulseIcon,
                role: 'Врач',
                quote: 'PDF-отчёты экономят время на приёме. Сразу вижу дисциплину пациента.',
                gradient: 'from-teal-500 to-teal-600',
              },
            ].map(({ Icon, role, quote, gradient }) => (
              <div
                key={role}
                className="med-card p-6 space-y-4
                hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient}
                    flex items-center justify-center shadow-sm`}
                  >
                    <Icon className="w-6 h-6 text-white" aria-hidden />
                  </div>
                  <p className="font-bold text-[#0D1B2A]">{role}</p>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed italic">
                  &ldquo;{quote}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="relative py-28 px-6 overflow-hidden">
        {/* Gradient background */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#0D47A1] via-[#1565C0] to-[#00838F]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          aria-hidden="true"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full
          bg-white/[0.04] blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
            Начните заботиться о здоровье
            <br />
            <span className="text-white/70">уже сегодня</span>
          </h2>
          <p className="text-lg text-white/60 max-w-lg mx-auto">
            Бесплатная регистрация за 30 секунд. Никаких скрытых платежей. Ваши данные в
            безопасности.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-3
                px-10 py-5 text-lg font-black text-[#0D47A1]
                bg-white rounded-2xl
                hover:shadow-2xl hover:shadow-white/20
                hover:-translate-y-0.5
                active:scale-[0.97]
                transition-all duration-200"
            >
              Создать аккаунт
              <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center
                px-10 py-5 text-lg font-bold text-white/80
                border-2 border-white/20 rounded-2xl
                hover:bg-white/10 hover:border-white/35
                hover:-translate-y-0.5
                transition-all duration-200"
            >
              У меня есть аккаунт
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="py-8 px-6 bg-[#0A1628] text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <MedCrossIcon className="w-5 h-5 text-blue-400" />
          <span className="text-white/80 font-bold text-sm">MemoMed AI</span>
        </div>
        <p className="text-white/30 text-xs">
          Соответствует GDPR и 152-ФЗ · MemoMed AI не заменяет консультацию врача
        </p>
      </footer>
    </main>
  );
}
