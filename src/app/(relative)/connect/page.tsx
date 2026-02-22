/**
 * @file page.tsx
 * @description Страница ввода инвайт-кода для родственника
 * @dependencies ConnectForm
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import { ConnectForm } from '@/components/relative/connect-form';

export const metadata: Metadata = {
  title: 'Подключиться к пациенту — MemoMed AI',
};

export default function ConnectPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-[#212121]">Подключиться к пациенту</h1>
        <p className="text-base text-[#757575]">
          Введите код, который вам передал пациент
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
        <ConnectForm />
      </div>

      <div className="bg-[#e8f5e9] rounded-2xl p-5 space-y-2">
        <p className="text-base font-semibold text-[#2e7d32]">💡 Как получить код?</p>
        <p className="text-base text-[#388e3c]">
          Попросите пациента открыть раздел «Мой код» в приложении и продиктовать или
          отправить вам код.
        </p>
      </div>
    </div>
  );
}
