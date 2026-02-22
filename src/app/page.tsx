/**
 * @file page.tsx
 * @description Landing page for MemoMed AI
 * @dependencies layout.tsx
 * @created 2026-02-22
 */

import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-6 py-12">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#7e57c2] font-[family-name:var(--font-montserrat)]">
            MemoMed AI
          </h1>
          <p className="text-xl text-[#212121] leading-relaxed">
            Заботливый помощник для контроля приёма лекарств
          </p>
          <p className="text-lg text-[#757575]">
            Никогда не пропускайте приём. Родственники всегда будут знать, что всё хорошо.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-[#4caf50] rounded-2xl hover:bg-[#43a047] transition-colors min-h-[56px]"
          >
            Начать бесплатно
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-[#7e57c2] border-2 border-[#7e57c2] rounded-2xl hover:bg-[#7e57c2] hover:text-white transition-colors min-h-[56px]"
          >
            Войти
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 text-left">
          {[
            {
              icon: '💊',
              title: 'Напоминания',
              desc: 'Настойчивые уведомления в нужное время',
            },
            {
              icon: '👨‍👩‍👦',
              title: 'Контроль близких',
              desc: 'Родственники видят приёмы в реальном времени',
            },
            {
              icon: '🤖',
              title: 'AI-помощник',
              desc: 'Ответы на вопросы о лекарствах простым языком',
            },
          ].map((feature) => (
            <div key={feature.title} className="bg-[#f8f6ff] rounded-2xl p-6 space-y-2">
              <span className="text-3xl">{feature.icon}</span>
              <h3 className="text-lg font-semibold text-[#212121]">{feature.title}</h3>
              <p className="text-[#757575]">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
