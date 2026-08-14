import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Employee RBAC Protection', () => {
  test.use({ storageState: path.join(__dirname, '../playwright/.auth/employee.json') });

  test('Employee cannot access /reports', async ({ page }) => {
    await page.goto('/reports');
    // Should be redirected or show an error
    // Our RBAC redirects unauthorized users to their dashboard/POS
    await expect(page).not.toHaveURL(/\/reports/);
  });

  test('Employee cannot access /audit', async ({ page }) => {
    await page.goto('/audit');
    await expect(page).not.toHaveURL(/\/audit/);
  });

  test('Employee can access /pos', async ({ page }) => {
    await page.goto('/pos');
    await expect(page).toHaveURL(/\/pos/);
  });
});

test.describe('Admin RBAC Access', () => {
  test.use({ storageState: path.join(__dirname, '../playwright/.auth/admin.json') });

  test('Admin can access /reports', async ({ page }) => {
    await page.goto('/reports');
    await expect(page).toHaveURL(/\/reports/);
  });

  test('Admin can access /audit', async ({ page }) => {
    await page.goto('/audit');
    await expect(page).toHaveURL(/\/audit/);
  });
});
