/**
 * @file request.ts
 * @description Конфигурация next-intl для серверной стороны.
 * Определяет локаль из cookie NEXT_LOCALE (по умолчанию 'ru').
 * @dependencies next-intl
 * @created 2026-02-22
 */

import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export const SUPPORTED_LOCALES = ['ru', 'en'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export function isValidLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  const locale: SupportedLocale = isValidLocale(cookieLocale ?? '')
    ? (cookieLocale as SupportedLocale)
    : 'ru';

  const messages = (await import(`../../messages/${locale}.json`)) as {
    default: Record<string, unknown>;
  };

  return {
    locale,
    messages: messages.default,
  };
});
