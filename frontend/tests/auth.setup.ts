import { test as setup, expect } from '@playwright/test';
import path from 'path';

const adminFile = path.join(__dirname, '../playwright/.auth/admin.json');
const employeeFile = path.join(__dirname, '../playwright/.auth/employee.json');

/**
 * Phase C: The employee login page is at /login (a discreet link in the footer).
 * We navigate directly instead of relying on a DOM click from the storefront homepage.
 */
setup('authenticate as admin', async ({ page }) => {
  // Navigate directly to the employee login page
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  await page.fill('input[name="username"]', 'admin@test.com');
  await page.fill('input[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');

  // Wait until the page receives cookies and redirects to the dashboard.
  try {
    await page.waitForURL('**/dashboard*', { timeout: 10000 });
  } catch (e) {
    const text = await page.locator('body').innerText();
    console.log('PAGE TEXT (ADMIN SETUP):', text.substring(0, 500));
    throw e;
  }

  await page.context().storageState({ path: adminFile });
});

setup('authenticate as employee', async ({ page }) => {
  // Navigate directly to the employee login page
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  await page.fill('input[name="username"]', 'employee@test.com');
  await page.fill('input[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');

  try {
    await page.waitForURL('**/dashboard*', { timeout: 10000 });
  } catch (e) {
    const text = await page.locator('body').innerText();
    console.log('PAGE TEXT (EMPLOYEE SETUP):', text.substring(0, 500));
    throw e;
  }

  await page.context().storageState({ path: employeeFile });
});
