/**
 * @file page.tsx
 * @description Политика конфиденциальности — обязательна для Google Play и ФЗ-152
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { LockIcon } from '@/components/shared/nav-icons';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности — MemoMed AI',
  description: 'Политика обработки персональных данных MemoMed AI',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#F0F4F8] py-12 px-4">
      <div className="max-w-2xl mx-auto med-card p-8 md:p-10">
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600
              flex items-center justify-center shadow-lg"
          >
            <LockIcon className="w-6 h-6 text-white" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0D1B2A]">Политика конфиденциальности</h1>
            <p className="text-sm text-slate-500">MemoMed AI | Обновлено: 2026-02-22</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none space-y-6 text-[#334155]">
          <section>
            <h2 className="text-lg font-semibold text-[#0D1B2A]">1. Какие данные мы собираем</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Email и пароль (при регистрации)</li>
              <li>Имя, дата рождения, часовой пояс (профиль)</li>
              <li>Список лекарств, время приёма, дозировки</li>
              <li>Логи приёмов (время, статус: принято/пропущено)</li>
              <li>Записи дневника самочувствия (настроение, боль, сон, энергия)</li>
              <li>Push-подписки (для напоминаний)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0D1B2A]">2. Цели обработки</h2>
            <p>
              Данные используются для работы сервиса: напоминания о приёме лекарств, живая лента для
              родственников, статистика дисциплины, AI-помощник, экспорт отчётов для врача.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0D1B2A]">3. Хранение и безопасность</h2>
            <p>
              Данные хранятся на защищённых серверах. Передача по HTTPS. Пароли хэшируются.
              Медицинские данные не передаются третьим лицам в идентифицируемом виде.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0D1B2A]">4. Ваши права</h2>
            <p>
              Вы можете запросить доступ к данным, исправление или удаление. Для этого обратитесь по
              контактам, указанным в приложении.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0D1B2A]">5. Контакты</h2>
            <p>
              По вопросам обработки персональных данных: admin@memomed.app (или укажите ваш
              контактный email).
            </p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-[#1565C0] font-semibold hover:underline"
          >
            ← Вернуться к входу
          </Link>
        </div>
      </div>
    </main>
  );
}
