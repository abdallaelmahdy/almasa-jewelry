import { test as setup, expect } from '@playwright/test';
import path from 'path';

const adminFile = path.join(__dirname, '../playwright/.auth/admin.json');
const employeeFile = path.join(__dirname, '../playwright/.auth/employee.json');

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="username"]', 'admin@test.com');
  await page.fill('input[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  // Wait until the page receives the cookies and redirects to dashboard.
  await page.waitForURL('http://localhost:3001/');
  // End of authentication steps.
  await page.context().storageState({ path: adminFile });
});

setup('authenticate as employee', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="username"]', 'employee@test.com');
  await page.fill('input[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  // Wait until the page receives the cookies and redirects to dashboard.
  await page.waitForURL('http://localhost:3001/');
  // End of authentication steps.
  await page.context().storageState({ path: employeeFile });
});
