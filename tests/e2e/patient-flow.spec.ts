/**
 * @file patient-flow.spec.ts
 * @description E2E критический путь: dev-login → дашборд → лекарства → добавление → приём
 * Требует NODE_ENV=development и seeded БД (patient1@memomed.dev)
 * @created 2026-02-22
 */

import { test, expect } from '@playwright/test';

async function devLoginAsPatient1(page: import('@playwright/test').Page) {
  await page.goto('/dev-login');
  const isDevLogin = await page
    .getByText('Быстрый вход')
    .isVisible()
    .catch(() => false);
  if (!isDevLogin) {
    return false;
  }
  await page.getByRole('button').filter({ hasText: 'Пациент 1' }).first().click();
  await page.waitForURL(/\/dashboard|\/onboarding/);
  if (page.url().includes('/onboarding')) {
    await page.getByRole('button', { name: 'Пропустить' }).click();
    await page.waitForURL(/\/dashboard/);
  }
  return true;
}

test.describe('Критический путь пациента', () => {
  test('dev-login → дашборд пациента', async ({ page }) => {
    const ok = await devLoginAsPatient1(page);
    if (!ok) {
      test.skip(true, 'dev-login недоступен (NODE_ENV !== development)');
      return;
    }
    await expect(page).toHaveURL(/\/(dashboard|onboarding)/);
    await expect(page.getByText('Быстрый доступ').first()).toBeVisible();
  });

  test('дашборд → список лекарств', async ({ page }) => {
    const ok = await devLoginAsPatient1(page);
    if (!ok) {
      test.skip(true, 'dev-login недоступен');
      return;
    }
    await page
      .getByRole('link', { name: /Лекарства/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/medications/);
  });

  test('добавление лекарства', async ({ page }) => {
    const ok = await devLoginAsPatient1(page);
    if (!ok) {
      test.skip(true, 'dev-login недоступен');
      return;
    }
    await page
      .getByRole('link', { name: /Лекарства/i })
      .first()
      .click();
    await page.waitForURL(/\/medications/);
    await page
      .getByRole('link', { name: /Добавить/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/medications\/add/);

    await page.getByLabel(/Название лекарства/i).fill('E2E Тест');
    await page.getByLabel(/Дозировка/i).fill('1 таблетка');
    await page.getByLabel(/Время приёма/i).fill('23:00');
    await page.getByRole('button', { name: /Добавить лекарство/i }).click();

    await expect(page).toHaveURL(/\/medications/);
  });

  test('подтверждение приёма лекарства', async ({ page }) => {
    const ok = await devLoginAsPatient1(page);
    if (!ok) {
      test.skip(true, 'dev-login недоступен');
      return;
    }
    const takeButton = page.getByRole('button', { name: /Принял\(а\) лекарство/i });
    const isVisible = await takeButton.isVisible().catch(() => false);
    if (!isVisible) {
      test.skip(true, 'Нет лекарства для приёма на дашборде (зависит от seed)');
      return;
    }
    await takeButton.click();
    await expect(page.getByText(/Записано|Сохранено/i)).toBeVisible({ timeout: 5000 });
  });
});
