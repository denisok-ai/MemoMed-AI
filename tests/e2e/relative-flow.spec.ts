/**
 * @file relative-flow.spec.ts
 * @description E2E критический путь родственника: dev-login → лента → профиль пациента
 * Требует NODE_ENV=development и seeded БД (relative1@memomed.dev)
 * @created 2026-02-24
 */

import { test, expect } from '@playwright/test';

async function devLoginAsRelative1(page: import('@playwright/test').Page) {
  await page.goto('/dev-login');
  const isDevLogin = await page
    .getByText('Быстрый вход')
    .isVisible()
    .catch(() => false);
  if (!isDevLogin) {
    return false;
  }
  await page.getByRole('button').filter({ hasText: 'Родственник 1' }).first().click();
  await page.waitForURL(/\/feed|\/onboarding/);
  if (page.url().includes('/onboarding')) {
    await page.getByRole('button', { name: 'Пропустить' }).click();
    await page.waitForURL(/\/feed/);
  }
  return true;
}

test.describe('Критический путь родственника', () => {
  test('dev-login → лента событий', async ({ page }) => {
    const ok = await devLoginAsRelative1(page);
    if (!ok) {
      test.skip(true, 'dev-login недоступен (NODE_ENV !== development)');
      return;
    }
    await expect(page).toHaveURL(/\/feed/);
    await expect(page.getByRole('heading', { name: /Лента событий|Feed/i })).toBeVisible();
  });

  test('лента → страница подключения', async ({ page }) => {
    const ok = await devLoginAsRelative1(page);
    if (!ok) {
      test.skip(true, 'dev-login недоступен');
      return;
    }
    await page
      .getByRole('link', { name: /Пациент|Подключиться/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/connect/);
  });

  test('лента → профиль пациента', async ({ page }) => {
    const ok = await devLoginAsRelative1(page);
    if (!ok) {
      test.skip(true, 'dev-login недоступен');
      return;
    }
    const patientLink = page.locator('a[href^="/patients/"]').first();
    const isVisible = await patientLink.isVisible().catch(() => false);
    if (!isVisible) {
      test.skip(true, 'Нет событий в ленте (зависит от seed)');
      return;
    }
    await patientLink.click();
    await expect(page).toHaveURL(/\/patients\/[a-f0-9-]+/);
  });
});
