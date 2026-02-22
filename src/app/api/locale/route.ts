/**
 * @file route.ts
 * @description POST /api/locale — переключение языка интерфейса.
 * Записывает выбранную локаль в cookie NEXT_LOCALE.
 * @created 2026-02-22
 */

import { NextRequest, NextResponse } from 'next/server';
import { isValidLocale } from '@/i18n/request';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as { locale?: string };
  const locale = body.locale;

  if (!locale || !isValidLocale(locale)) {
    return NextResponse.json({ error: 'Неверная локаль' }, { status: 400 });
  }

  const response = NextResponse.json({ success: true, locale });
  response.cookies.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 365 * 24 * 60 * 60,
    sameSite: 'lax',
  });
  return response;
}
