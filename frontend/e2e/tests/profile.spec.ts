import { test, expect } from '@playwright/test';
import { TEST_USER } from '../fixtures/test-data';

test.describe('Account Settings', () => {
  test('profile page loads with user data pre-populated', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.getByLabel('First Name')).toHaveValue(TEST_USER.firstName);
    await expect(page.getByLabel('Last Name')).toHaveValue(TEST_USER.lastName);
    await expect(page.getByLabel('Email')).toHaveValue(TEST_USER.email);
  });

  test('email field is disabled (cannot be edited)', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.getByLabel('Email')).toBeDisabled();
  });

  test('update first name and verify it persists after reload', async ({ page }) => {
    await page.goto('/profile');

    const firstNameInput = page.getByLabel('First Name');
    await firstNameInput.clear();
    await firstNameInput.fill('Updated');

    await page.getByRole('button', { name: 'Save Profile' }).click();

    // Wait for confirmation (alert or UI update)
    await page.waitForTimeout(1000);
    await page.reload();

    await expect(page.getByLabel('First Name')).toHaveValue('Updated');

    // Restore original name
    await page.getByLabel('First Name').clear();
    await page.getByLabel('First Name').fill(TEST_USER.firstName);
    await page.getByRole('button', { name: 'Save Profile' }).click();
  });

  test('update thrill level preference and verify it persists', async ({ page }) => {
    await page.goto('/profile');

    await page.getByLabel('Preferred Thrill Level').selectOption('high');
    await page.getByRole('button', { name: 'Save Preferences' }).click();

    await page.waitForTimeout(1000);
    await page.reload();

    await expect(page.getByLabel('Preferred Thrill Level')).toHaveValue('high');

    // Restore
    await page.getByLabel('Preferred Thrill Level').selectOption('moderate');
    await page.getByRole('button', { name: 'Save Preferences' }).click();
  });

  test('update party size and verify it persists', async ({ page }) => {
    await page.goto('/profile');

    const partySizeInput = page.getByLabel('Party Size');
    await partySizeInput.clear();
    await partySizeInput.fill('4');

    await page.getByRole('button', { name: 'Save Preferences' }).click();

    await page.waitForTimeout(1000);
    await page.reload();

    await expect(page.getByLabel('Party Size')).toHaveValue('4');

    // Restore
    await partySizeInput.clear();
    await partySizeInput.fill('1');
    await page.getByRole('button', { name: 'Save Preferences' }).click();
  });
});
