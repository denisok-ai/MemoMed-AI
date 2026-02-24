/**
 * @file guest.spec.ts
 * @description E2E тесты публичных страниц (без авторизации)
 * @created 2026-02-22
 */

import { test, expect } from '@playwright/test';

test.describe('Публичные страницы', () => {
  test('главная страница загружается', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/MemoMed|Контроль приёма/);
  });

  test('страница входа загружается', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Вход|Login/);
    await expect(
      page.getByRole('heading', { name: /Добро пожаловать|Welcome|Войдите/i })
    ).toBeVisible();
  });

  test('страница регистрации загружается', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveTitle(/Регистрация|Register/);
  });

  test('политика конфиденциальности загружается', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page).toHaveTitle(/Политика конфиденциальности|Privacy/);
    await expect(page.getByRole('heading', { name: /политика конфиденциальности/i })).toBeVisible();
  });
});
