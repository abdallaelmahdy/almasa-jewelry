import { test, expect } from '@playwright/test';

/**
 * Phase C Auth Tests
 *
 * Employee auth:  The "دخول الموظفين" link is a discreet footer link → navigate
 *                 to /login directly.
 *
 * Customer auth:  A CustomerAuthModal is triggered from the LuxuryHeader by
 *                 clicking "تسجيل الدخول". Tests for the modal are in
 *                 storefront.spec.ts for clarity.
 */
test.describe('Employee Authentication', () => {
  // Ensure we start with a completely clean state for every test in this suite.
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Invalid employee login shows Arabic error message', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // The login form should be present immediately on the /login page.
    await expect(page.locator('input[name="username"]')).toBeVisible();

    await page.fill('input[name="username"]', 'wrong@test.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Expect the Arabic "invalid credentials" error from the login page (login/page.tsx line 68)
    await expect(
      page.locator('text=اسم المستخدم أو كلمة المرور غير صحيحة')
    ).toBeVisible({ timeout: 8000 });

    // URL should NOT have changed to /dashboard
    await expect(page).not.toHaveURL(/\/dashboard/);
  });

  test('Valid employee login redirects to /dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input[name="username"]', 'employee@test.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test('Valid admin login redirects to /dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input[name="username"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });
});
