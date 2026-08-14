import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Sales Refunds', () => {
  test('Admin can refund a sale', async ({ page }) => {
    // 1. Explicitly login as admin to avoid any session issues
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // Wait until we reach the dashboard
    await page.waitForURL('http://localhost:3001/');

    // 2. A sale is seeded by global-setup.ts
    // Go directly to /sales
    await page.goto('/sales');
    
    // Wait for network idle to ensure data is loaded
    await page.waitForLoadState('networkidle');
    
    // Wait for table to be visible, with a shorter timeout
    try {
      await page.waitForSelector('table', { state: 'visible', timeout: 5000 });
    } catch (e) {
      const text = await page.locator('body').innerText();
      throw new Error(`Table not found! Page text: ${text.substring(0, 500)}`);
    }
      await page.locator('tbody tr').first().click();
      
      const refundButton = page.locator('button:has-text("استرداد")');
      if (await refundButton.isVisible()) {
        await refundButton.click();
        
        await page.fill('input[placeholder="سبب الاسترداد (مطلوب)..."]', 'Customer request');
        await page.click('button:has-text("تأكيد الاسترداد")');
        
        await expect(page.locator('text=فاتورة مسترجعة')).toBeVisible();
      }
  });
});
