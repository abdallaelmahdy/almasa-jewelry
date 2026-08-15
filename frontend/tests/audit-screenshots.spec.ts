import { test, expect } from '@playwright/test';
import * as path from 'path';

const ROUTES = [
  { name: 'public', path: '/' },
  { name: 'login', path: '/login' },
  { name: 'dashboard', path: '/dashboard' },
  { name: 'inventory', path: '/inventory' },
  { name: 'pos', path: '/pos' },
  { name: 'sales', path: '/sales' },
  { name: 'customers', path: '/customers' },
  { name: 'reports', path: '/reports' },
  { name: 'audit', path: '/audit' }
];

const OUT_DIR = 'C:\\Users\\ELHUSSEIN-STORE\\.gemini\\antigravity\\brain\\9d43e174-6b38-4e62-8c06-b4b118fb76d9';

test.describe('Audit Screenshots', () => {
  // Mobile test
  test('Mobile Screenshots', async ({ browser }) => {
    test.setTimeout(120000);
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
      isMobile: true
    });
    const page = await context.newPage();
    
    // Login
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[name="username"]', 'admin@admin.com');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard*');

    for (const route of ROUTES) {
      await page.goto(`http://localhost:3000${route.path}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(OUT_DIR, `mobile_audit_${route.name}.png`), fullPage: true });
    }
    await context.close();
  });

  // Desktop test
  test('Desktop Screenshots', async ({ browser }) => {
    test.setTimeout(120000);
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    // Login
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[name="username"]', 'admin@admin.com');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard*');

    for (const route of ROUTES) {
      await page.goto(`http://localhost:3000${route.path}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(OUT_DIR, `desktop_audit_${route.name}.png`), fullPage: true });
    }
    await context.close();
  });
});
