import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('POS Checkout and Locking', () => {
  // Clear any existing state before starting
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Add to cart and normal checkout', async ({ page }) => {
    // Explicitly login as admin
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[name="username"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard*');

    await page.goto('/pos');
    await page.waitForLoadState('networkidle');
    
    // Search for inventory item
    await page.fill('input[placeholder="ابحث برقم القطعة (SKU) لإضافتها للسلة..."]', 'TEST-001');
    
    // Wait for inventory selector to be ready
    await page.waitForSelector('text=TEST-001', { state: 'visible', timeout: 10000 });
    
    // Add item to cart (the button text is "إضافة")
    await page.click('button:has-text("إضافة")');
    await expect(page.locator('text=TEST-001').first()).toBeVisible();

    // Proceed to checkout
    // Payment amount
    await page.fill('input[placeholder="أدخل المبلغ..."]', '2050'); 
    await page.click('button[title="إضافة دفعة"]');
    
    // Complete Sale
    await page.click('button:has-text("تأكيد وإصدار الفاتورة")');

    // Should see success or the modal
    // The InvoiceModal is rendered upon success. We wait for it.
    await expect(page.locator('text=تمت عملية البيع بنجاح')).toBeVisible({ timeout: 10000 });
    
    // We can close the modal
    await page.click('button:has-text("إغلاق")');
  });

  test('Cart removal releases lock', async ({ page }) => {
    // Explicitly login as admin
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[name="username"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard*');

    await page.goto('/pos');
    await page.waitForLoadState('networkidle');
    // Search for item 3
    await page.fill('input[placeholder="ابحث برقم القطعة (SKU) لإضافتها للسلة..."]', 'TEST-003');

    try {
      await page.waitForSelector('text=TEST-003', { state: 'visible', timeout: 5000 });
    } catch (e) {
      const text = await page.locator('body').innerText();
      throw new Error(`TEST-003 not found! Page text: ${text.substring(0, 1000)}`);
    }
    
    // Add item to cart
    await page.click('button:has-text("إضافة")');
    await expect(page.locator('text=TEST-003').first()).toBeVisible();

    // Remove from cart. POSCart.tsx probably uses an X button or trash icon. 
    // Let's assume it has an aria-label="Remove" or we can just find the button in the cart row.
    // I will click the trash button within the cart.
    await page.click('button[title="إزالة من السلة"]');
    
    // Ensure it's removed
    await expect(page.locator('text=TEST-003')).toHaveCount(0, { timeout: 10000 });

    // Verify it becomes available again in inventory
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=TEST-003', { state: 'visible', timeout: 5000 });
    await expect(page.locator('tr:has-text("TEST-003")')).toContainText('متاح');
  });
});
