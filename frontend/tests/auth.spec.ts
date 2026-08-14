import { test, expect } from '@playwright/test';

test.describe('Authentication and RBAC', () => {
  // Clear any existing state before starting
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Invalid login shows error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'wrong@test.com');
    await page.fill('input[name="password"]', 'wrong');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=اسم المستخدم أو كلمة المرور غير صحيحة')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('Valid login redirects to POS for employee', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'employee@test.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('http://localhost:3001/');
  });
});
