import { test, expect } from '@playwright/test';

/**
 * Phase C: Employee auth now requires navigating to /login directly.
 * The "دخول الموظفين" link is a discreet footer link on the storefront — not a
 * prominent nav button. All tests use goto('/login') for reliability.
 */
test.describe('POS Checkout and Locking', () => {
  // No stored auth — each test logs in manually to exercise the full flow.
  test.use({ storageState: { cookies: [], origins: [] } });

  /**
   * Helper: log in as admin through the /login page and navigate to /pos.
   */
  async function loginAsAdminAndGoToPOS(page: any) {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[name="username"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard*', { timeout: 15000 });
    await page.goto('/pos');
    await page.waitForLoadState('networkidle');
  }

  test('Add to cart and normal checkout', async ({ page }) => {
    await loginAsAdminAndGoToPOS(page);

    // Search for the seeded inventory item
    await page.fill('input[placeholder="ابحث برقم القطعة (SKU) لإضافتها للسلة..."]', 'TEST-001');

    // Wait for the result to appear in the inventory selector
    await page.waitForSelector('text=TEST-001', { state: 'visible', timeout: 10000 });

    // Add item to cart
    await page.click('button:has-text("إضافة")');
    await expect(page.locator('text=TEST-001').first()).toBeVisible();

    // Enter payment amount
    await page.fill('input[placeholder="أدخل المبلغ..."]', '2050');
    await page.click('button[title="إضافة دفعة"]');

    // Complete the sale
    await page.click('button:has-text("إصدار الفاتورة")');

    // The InvoiceModal should appear on success
    await expect(page.locator('text=تمت عملية البيع بنجاح')).toBeVisible({ timeout: 10000 });

    // Close the modal
    await page.click('button:has-text("إغلاق")');
  });

  test('Cart removal releases lock', async ({ page }) => {
    await loginAsAdminAndGoToPOS(page);

    // Search for the lock-test item
    await page.fill('input[placeholder="ابحث برقم القطعة (SKU) لإضافتها للسلة..."]', 'TEST-003');

    try {
      await page.waitForSelector('text=TEST-003', { state: 'visible', timeout: 8000 });
    } catch (e) {
      const text = await page.locator('body').innerText();
      throw new Error(`TEST-003 not found! Page body: ${text.substring(0, 1000)}`);
    }

    // Add to cart
    await page.click('button:has-text("إضافة")');
    await expect(page.locator('text=TEST-003').first()).toBeVisible();

    // Remove from cart using the trash/remove button
    await page.click('button[title="إزالة من السلة"]');

    // Confirm the item is gone from the cart
    await expect(page.locator('text=TEST-003')).toHaveCount(0, { timeout: 10000 });

    // Verify the item is back to "متاح" status in the inventory table
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=TEST-003', { state: 'visible', timeout: 8000 });
    await expect(page.locator('tr:has-text("TEST-003")')).toContainText('متاح');
  });
});
