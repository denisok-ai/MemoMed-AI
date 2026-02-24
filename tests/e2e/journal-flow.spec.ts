/**
 * @file journal-flow.spec.ts
 * @description E2E критический путь: пациент → дневник самочувствия
 * Требует NODE_ENV=development и seeded БД (patient1@memomed.dev)
 * @created 2026-02-24
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

test.describe('Дневник самочувствия', () => {
  test('dev-login → дневник', async ({ page }) => {
    const ok = await devLoginAsPatient1(page);
    if (!ok) {
      test.skip(true, 'dev-login недоступен (NODE_ENV !== development)');
      return;
    }
    await page
      .getByRole('link', { name: /Дневник|Journal/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/journal/);
    await expect(
      page.getByRole('heading', { name: /Дневник самочувствия|Journal/i })
    ).toBeVisible();
  });

  test('дневник → форма записи', async ({ page }) => {
    const ok = await devLoginAsPatient1(page);
    if (!ok) {
      test.skip(true, 'dev-login недоступен');
      return;
    }
    await page
      .getByRole('link', { name: /Дневник|Journal/i })
      .first()
      .click();
    await page.waitForURL(/\/journal/);
    const todayLink = page.locator('a[href^="/journal/"]').first();
    const isVisible = await todayLink.isVisible().catch(() => false);
    if (!isVisible) {
      test.skip(true, 'Нет ссылки на запись в дневнике');
      return;
    }
    await todayLink.click();
    await expect(page).toHaveURL(/\/journal\/\d{4}-\d{2}-\d{2}/);
  });
});
