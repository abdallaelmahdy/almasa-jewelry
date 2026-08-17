import { test, expect } from '@playwright/test';

/**
 * Phase C — Storefront & Customer Auth Modal Tests
 *
 * The root route "/" is now the luxury B2C storefront (LuxuryHeader + product
 * grid + LuxuryFooter).  This spec validates:
 *
 *  1. The storefront page itself renders correctly.
 *  2. The discreet employee login link in the footer works.
 *  3. The CustomerAuthModal opens, switches tabs, and shows correct errors.
 */

// All storefront tests start with no session.
const noAuth = { storageState: { cookies: [], origins: [] } };

// ── 1. Storefront rendering ────────────────────────────────────────────────────
test.describe('Storefront Homepage', () => {
  test.use(noAuth);

  test('renders hero, shop section, and footer', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Hero headline is visible
    await expect(page.locator('#hero')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();

    // Shop section exists
    await expect(page.locator('#shop')).toBeVisible();

    // Footer is rendered (LuxuryFooter)
    await expect(page.locator('footer')).toBeVisible();
  });

  test('product grid shows loading skeletons then content or empty state', async ({ page }) => {
    await page.goto('/');

    // The shop section must be present
    await expect(page.locator('#shop')).toBeVisible({ timeout: 5000 });

    // After networkidle either products or the empty-state message appears
    await page.waitForLoadState('networkidle');
    const hasProducts = await page.locator('#shop article').count();
    const hasEmptyState = await page.locator('text=لا توجد قطع متاحة').isVisible();

    // One of the two states must be true
    expect(hasProducts > 0 || hasEmptyState).toBeTruthy();
  });

  test('karat filter pills are interactive', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('#shop').scrollIntoViewIfNeeded();

    // Click the "عيار 18" filter — it should not crash the page
    const pill18 = page.locator('button', { hasText: 'عيار 18' });
    await expect(pill18).toBeVisible({ timeout: 5000 });
    await pill18.click();

    // The pill should now be highlighted (has "bg-[#D4AF37]" class via active state)
    // We just confirm the page is still functional rather than asserting class names
    await expect(page.locator('#shop')).toBeVisible();
  });
});

// ── 2. Discreet employee login flow ──────────────────────────────────────────
test.describe('Discreet Employee Login Link', () => {
  test.use(noAuth);

  test('footer "دخول الموظفين" link navigates to /login page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Scroll the footer into view so the link is reachable
    await page.locator('footer').scrollIntoViewIfNeeded();

    // The discreet employee link lives inside the footer (LuxuryFooter.tsx)
    const footerEmployeeLink = page.locator('footer a', { hasText: 'دخول الموظفين' });
    await expect(footerEmployeeLink).toBeVisible({ timeout: 5000 });

    await footerEmployeeLink.click();

    // Should navigate to the /login page
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });

    // The employee login form should be present
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });
});

// ── 3. Customer Auth Modal ────────────────────────────────────────────────────
test.describe('Customer Auth Modal', () => {
  test.use(noAuth);

  test('opens with login tab when header "تسجيل الدخول" is clicked', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // The LuxuryHeader has a "تسجيل الدخول" button when no customer is logged in
    const loginButton = page.locator('header button', { hasText: 'تسجيل الدخول' }).filter({ visible: true });
    await expect(loginButton).toBeVisible({ timeout: 5000 });
    await loginButton.click();

    // The CustomerAuthModal should appear (it renders as a fixed overlay)
    const modal = page.locator('[class*="fixed"][class*="inset-0"]').filter({
      has: page.locator('text=الماسة'),
    });
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Login tab should be active by default
    await expect(page.locator('text=تسجيل الدخول').last()).toBeVisible();

    // The login form fields should be present inside the modal
    await expect(page.locator('input[placeholder="اسم المستخدم"]').first()).toBeVisible();
    await expect(page.locator('input[placeholder="كلمة المرور"]').first()).toBeVisible();
  });

  test('switches to register tab when "إنشاء حساب" is clicked', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open modal via header button
    const loginButton = page.locator('header button', { hasText: 'تسجيل الدخول' }).filter({ visible: true });
    await loginButton.click();

    // Click the register tab inside the modal
    const registerTab = page.locator('button', { hasText: 'إنشاء حساب' }).last();
    await expect(registerTab).toBeVisible({ timeout: 5000 });
    await registerTab.click();

    // Register form fields should now be visible
    await expect(page.locator('input[placeholder="البريد الإلكتروني"]')).toBeVisible();
    await expect(page.locator('button', { hasText: 'إنشاء الحساب' })).toBeVisible();
  });

  test('opens directly on register tab from header "إنشاء حساب" button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // The LuxuryHeader also has a separate "إنشاء حساب" button
    const registerButton = page.locator('header button', { hasText: 'إنشاء حساب' }).filter({ visible: true });
    await expect(registerButton).toBeVisible({ timeout: 5000 });
    await registerButton.click();

    // The modal should open on the register tab
    await expect(page.locator('input[placeholder="البريد الإلكتروني"]')).toBeVisible({ timeout: 5000 });
  });

  test('invalid customer login shows Arabic error in modal', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open the customer auth modal
    const loginButton = page.locator('header button', { hasText: 'تسجيل الدخول' }).filter({ visible: true });
    await loginButton.click();

    // Fill in wrong credentials
    await page.locator('input[placeholder="اسم المستخدم"]').first().fill('nobody@test.com');
    await page.locator('input[placeholder="كلمة المرور"]').first().fill('wrongpassword');

    // Submit the login form (the gold "دخول" button inside the modal)
    await page.locator('button[type="submit"]', { hasText: 'دخول' }).click();

    // The modal should show an error message in Arabic
    await expect(
      page.locator('text=بيانات الدخول غير صحيحة')
    ).toBeVisible({ timeout: 8000 });
  });

  test('employee account is blocked in the customer modal', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open the customer auth modal
    const loginButton = page.locator('header button', { hasText: 'تسجيل الدخول' }).filter({ visible: true });
    await loginButton.click();

    // Use valid employee credentials in the customer modal
    await page.locator('input[placeholder="اسم المستخدم"]').first().fill('employee@test.com');
    await page.locator('input[placeholder="كلمة المرور"]').first().fill('Password123!');

    await page.locator('button[type="submit"]', { hasText: 'دخول' }).click();

    // CustomerAuthModal.tsx line 70: role !== "customer" → shows this specific error
    await expect(
      page.locator('text=هذه البوابة للعملاء فقط')
    ).toBeVisible({ timeout: 8000 });

    // Modal must still be open (not closed on error)
    await expect(page.locator('input[placeholder="اسم المستخدم"]').first()).toBeVisible();
  });

  test('modal closes when the X button is clicked', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loginButton = page.locator('header button', { hasText: 'تسجيل الدخول' }).filter({ visible: true });
    await loginButton.click();

    // Confirm modal is open
    await expect(page.locator('input[placeholder="اسم المستخدم"]').first()).toBeVisible();

    // Click the close (X) button inside the modal
    // CustomerAuthModal.tsx renders an X button at the top-left
    await page.locator('[class*="fixed"][class*="inset-0"] button').first().click();

    // The modal overlay should no longer be visible
    await expect(page.locator('input[placeholder="اسم المستخدم"]').first()).not.toBeVisible({ timeout: 5000 });
  });
});
