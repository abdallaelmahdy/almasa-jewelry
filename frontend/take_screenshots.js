const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\ELHUSSEIN-STORE\\.gemini\\antigravity\\brain\\9d43e174-6b38-4e62-8c06-b4b118fb76d9';

async function takeScreenshots() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  
  // Desktop
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopContext.newPage();
  
  // Mobile
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileContext.newPage();

  async function snap(name, url, page, prefix) {
    try {
      console.log(`Navigating to ${url} for ${prefix}_${name}`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      // wait a bit for animations
      await page.waitForTimeout(2000);
      const outPath = path.join(ARTIFACT_DIR, `${prefix}_${name}.png`);
      await page.screenshot({ path: outPath, fullPage: true });
      console.log(`Saved: ${outPath}`);
    } catch (e) {
      console.error(`Failed to snapshot ${url}: ${e}`);
    }
  }

  // 1. Storefront (Public)
  await snap('public', 'http://localhost:3000/', desktopPage, 'desktop');
  await snap('public', 'http://localhost:3000/', mobilePage, 'mobile');

  // 2. Login
  await snap('login', 'http://localhost:3000/login', desktopPage, 'desktop');
  
  // Login to Admin
  console.log('Logging in...');
  await desktopPage.goto('http://localhost:3000/login');
  await desktopPage.fill('input[name="username"]', 'admin@test.com');
  await desktopPage.fill('input[name="password"]', 'Password123!');
  await desktopPage.click('button[type="submit"]');
  await desktopPage.waitForURL('**/dashboard');
  
  // Share cookies with mobile
  const cookies = await desktopContext.cookies();
  await mobileContext.addCookies(cookies);

  // 3. Authenticated routes
  const routes = [
    { name: 'dashboard', url: 'http://localhost:3000/dashboard' },
    { name: 'pos', url: 'http://localhost:3000/pos' },
    { name: 'inventory', url: 'http://localhost:3000/inventory' },
    { name: 'sales', url: 'http://localhost:3000/sales' },
    { name: 'customers', url: 'http://localhost:3000/customers' },
    { name: 'reports', url: 'http://localhost:3000/reports' },
    { name: 'audit', url: 'http://localhost:3000/audit' }
  ];

  for (const route of routes) {
    await snap(route.name, route.url, desktopPage, 'desktop');
    await snap(route.name, route.url, mobilePage, 'mobile');
  }

  await browser.close();
  console.log('Screenshots complete.');
}

takeScreenshots().catch(console.error);
