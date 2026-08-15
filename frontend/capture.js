const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

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

async function capture() {
  const browser = await chromium.launch();
  
  // Desktop
  const desktopContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const desktopPage = await desktopContext.newPage();
  
  console.log('Logging in...');
  await desktopPage.goto('http://localhost:3000/login');
  await desktopPage.fill('input[name="username"]', 'admin@test.com');
  await desktopPage.fill('input[name="password"]', 'Password123!');
  await desktopPage.click('button[type="submit"]');
  await desktopPage.waitForURL('**/dashboard*');
  
  const authState = await desktopContext.storageState();
  fs.writeFileSync('C:\\Users\\ELHUSSEIN-STORE\\.gemini\\antigravity\\brain\\9d43e174-6b38-4e62-8c06-b4b118fb76d9\\scratch\\auth.json', JSON.stringify(authState));

  for (const route of ROUTES) {
    console.log('Capturing Desktop: ' + route.name);
    await desktopPage.goto('http://localhost:3000' + route.path);
    await desktopPage.waitForLoadState('networkidle');
    await desktopPage.waitForTimeout(2000);
    await desktopPage.screenshot({ path: path.join(OUT_DIR, 'desktop_' + route.name + '.png'), fullPage: true });
  }

  // Mobile
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    storageState: 'C:\\Users\\ELHUSSEIN-STORE\\.gemini\\antigravity\\brain\\9d43e174-6b38-4e62-8c06-b4b118fb76d9\\scratch\\auth.json'
  });
  const mobilePage = await mobileContext.newPage();

  for (const route of ROUTES) {
    console.log('Capturing Mobile: ' + route.name);
    await mobilePage.goto('http://localhost:3000' + route.path);
    await mobilePage.waitForLoadState('networkidle');
    await mobilePage.waitForTimeout(2000);
    await mobilePage.screenshot({ path: path.join(OUT_DIR, 'mobile_' + route.name + '.png'), fullPage: true });
  }

  await browser.close();
  console.log('Done!');
}

capture().catch(console.error);
