/**
 * @file push-notifications-toggle.tsx
 * @description Переключатель push-уведомлений — запрашивает разрешение и регистрирует подписку.
 * @dependencies usePushNotifications
 * @created 2026-02-22
 */

'use client';

import { usePushNotifications } from '@/hooks/use-push-notifications';
import { AlertTriangleIcon, BellIcon } from '@/components/shared/nav-icons';

export function PushNotificationsToggle() {
  const { isSupported, permission, isSubscribed, isLoading, subscribe, unsubscribe } =
    usePushNotifications();

  if (!isSupported) {
    return (
      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl text-slate-500">
        <BellIcon className="w-6 h-6 shrink-0 opacity-50" aria-hidden />
        <p className="text-sm">Уведомления не поддерживаются в этом браузере</p>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-3 p-4 bg-[#fff3e0] rounded-2xl">
        <AlertTriangleIcon className="w-5 h-5 shrink-0 text-[#e65100]" aria-hidden />
        <p className="text-sm text-[#e65100]">
          Уведомления заблокированы. Разрешите их в настройках браузера.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center gap-3">
        <BellIcon
          className={`text-2xl ${isSubscribed ? 'text-[#1565C0]' : 'text-slate-400'}`}
          aria-hidden
        />
        <div>
          <p className="text-base font-medium text-[#212121]">Напоминания о лекарствах</p>
          <p className="text-sm text-slate-500">
            {isSubscribed ? 'Уведомления включены' : 'Получайте напоминания на это устройство'}
          </p>
        </div>
      </div>

      <button
        onClick={isSubscribed ? unsubscribe : subscribe}
        disabled={isLoading}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors
          focus:outline-none focus:ring-2 focus:ring-[#1565C0] focus:ring-offset-2
          ${isSubscribed ? 'bg-[#4caf50]' : 'bg-slate-300'}
          disabled:opacity-50`}
        role="switch"
        aria-checked={isSubscribed}
        aria-label={isSubscribed ? 'Выключить уведомления' : 'Включить уведомления'}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform
            ${isSubscribed ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );
}
