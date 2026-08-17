import { test, expect } from '@playwright/test';

test.describe('Authentication and RBAC', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Invalid login shows error', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.click('text=دخول الموظفين');

    await expect(page).toHaveURL(/.*\/login/);

    await page.fill('input[name="username"]', 'wrong@test.com');
    await page.fill('input[name="password"]', 'wrong');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=اسم المستخدم أو كلمة المرور غير صحيحة')).toBeVisible();
  });

  test('Valid login redirects to dashboard for employee', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.click('text=دخول الموظفين');
    await expect(page).toHaveURL(/.*\/login/);

    await page.fill('input[name="username"]', 'employee@test.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/dashboard/);
  });
});
