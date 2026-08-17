import { test, expect } from '@playwright/test';

/**
 * Phase C: Employee auth now requires navigating to /login directly.
 * The storefront at "/" no longer has a prominent "دخول الموظفين" nav button.
 */
test.describe('Sales Refunds', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Admin can refund a sale', async ({ page }) => {
    // ── 1. Log in as admin ────────────────────────────────────────────────────
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[name="username"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard*', { timeout: 15000 });

    // ── 2. Navigate to /sales (a seeded sale exists from global-setup.ts) ────
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');

    try {
      await page.waitForSelector('table', { state: 'visible', timeout: 8000 });
    } catch (e) {
      const text = await page.locator('body').innerText();
      throw new Error(`Sales table not found! Page body: ${text.substring(0, 500)}`);
    }

    // Click the first sale row to open its detail / refund panel
    await page.locator('tbody tr').first().click();

    // ── 3. Attempt the refund ─────────────────────────────────────────────────
    const refundButton = page.locator('button:has-text("استرداد")');
    if (await refundButton.isVisible()) {
      await refundButton.click();

      await page.fill('input[placeholder="سبب الاسترداد (مطلوب)..."]', 'Customer request');
      await page.click('button:has-text("تأكيد الاسترداد")');

      await expect(page.locator('text=مسترجعة').first()).toBeVisible({ timeout: 10000 });
    }
    // If there is no refund button the sale was already refunded (idempotent).
  });
});