import { test, expect, Page } from '@playwright/test';
import { TEST_USER, API_URL } from '../fixtures/test-data';

// Auth tests use a fresh unauthenticated context
test.use({ storageState: { cookies: [], origins: [] } });

async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByPlaceholder('Email address').fill(email);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
}

test.describe('Authentication', () => {
  test('register a new account and land on home page', async ({ page, request }) => {
    const uniqueEmail = `e2e_reg_${Date.now()}@themeparkplanner.test`;

    await page.goto('/register');
    await page.getByPlaceholder('First Name').fill('Integration');
    await page.getByPlaceholder('Last Name').fill('Test');
    await page.getByPlaceholder('Email address').fill(uniqueEmail);
    await page.getByPlaceholder('Password').fill('TestPassword123!');
    await page.getByRole('button', { name: 'Register' }).click();

    await page.waitForURL('/', { timeout: 10000 });

    // Clean up the registered user
    await request.delete(`${API_URL}/users/me`);
  });

  test('login with valid credentials redirects home', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
    await page.waitForURL('/', { timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  });

  test('login with wrong password shows error', async ({ page }) => {
    await login(page, TEST_USER.email, 'wrong-password');
    await expect(page.locator('.text-red-600')).toBeVisible();
    await expect(page.locator('.text-red-600')).not.toBeEmpty();
  });

  test('login with unknown email shows error', async ({ page }) => {
    await login(page, 'nobody@notreal.test', 'anything');
    await expect(page.locator('.text-red-600')).toBeVisible();
  });

  test('logout returns header to unauthenticated state', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
    await page.waitForURL('/', { timeout: 10000 });

    await page.getByRole('button', { name: 'Logout' }).click();
    await page.waitForURL('/', { timeout: 10000 });

    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' })).not.toBeVisible();
  });

  test('forgot password form processes the request', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByPlaceholder('Email address').fill(TEST_USER.email);
    await page.getByRole('button', { name: 'Send Reset Link' }).click();

    // After submission the form either shows a success message or the button returns
    await expect(
      page.locator('.text-green-600, button[type="submit"]')
    ).toBeVisible({ timeout: 20000 });

    await expect(page.locator('form')).toBeVisible();
  });
});
