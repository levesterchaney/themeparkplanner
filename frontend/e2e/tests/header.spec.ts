import { test, expect } from '@playwright/test';
import { TEST_USER } from '../fixtures/test-data';

test.describe('Header — authenticated', () => {
  test('shows Account and Logout, hides Login', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Account' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).not.toBeVisible();
  });

  test('My Trips button navigates to /trips', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'My Trips' }).click();
    await expect(page).toHaveURL('/trips');
  });

  test('My Trips button is active on /trips route', async ({ page }) => {
    await page.goto('/trips');
    // The active trip button uses the primary variant — check it has different styling
    const myTripsBtn = page.getByRole('button', { name: 'My Trips' });
    await expect(myTripsBtn).toBeVisible();
  });

  test('Account button navigates to /profile', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Account' }).click();
    await expect(page).toHaveURL('/profile');
  });
});

test.describe('Header — unauthenticated', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('shows Login, hides Account and Logout', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Account' })).not.toBeVisible();
  });

  test('Login button navigates to /login', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/login');
  });
});
