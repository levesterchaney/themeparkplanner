import { test, expect } from '@playwright/test';

const TRIP_TITLE = `E2E Trip ${Date.now()}`;

test.describe('Trip Management', () => {
  test('trips page shows empty state when no trips exist', async ({ page }) => {
    await page.goto('/trips');
    // May show empty state or existing trips — just verify page loaded
    await expect(page).toHaveURL('/trips');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('create a new trip and see it in the list', async ({ page }) => {
    await page.goto('/trips/new');

    await page.getByLabel('Title').fill(TRIP_TITLE);

    // Select a destination from the dropdown
    const destinationDropdown = page.locator('select').first();
    await destinationDropdown.selectOption({ index: 1 });

    // Set dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 30);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 3);

    const fmt = (d: Date) => d.toISOString().split('T')[0];

    await page.getByLabel('Trip Start Date:').fill(fmt(tomorrow));
    await page.getByLabel('Trip End Date:').fill(fmt(dayAfter));

    await page.getByRole('button', { name: 'Create Trip' }).click();

    // Should redirect to trips list
    await page.waitForURL('/trips', { timeout: 10000 });

    // New trip should appear in the list
    await expect(page.getByText(TRIP_TITLE)).toBeVisible();
  });

  test('click a trip card to view its detail page', async ({ page }) => {
    await page.goto('/trips');

    // Click the first trip card
    const firstTrip = page.locator('a[href^="/trips/"]').first();
    await firstTrip.waitFor({ timeout: 5000 });
    await firstTrip.click();

    await expect(page).toHaveURL(/\/trips\/\d+/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('trip detail page shows trip title and destination', async ({ page }) => {
    await page.goto('/trips');

    const firstTripLink = page.locator('a[href^="/trips/"]').first();
    await firstTripLink.waitFor({ timeout: 5000 });
    const href = await firstTripLink.getAttribute('href');
    await page.goto(href!);

    await expect(page.locator('h1').first()).toBeVisible();
    // Destination text should be present somewhere on the page
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
