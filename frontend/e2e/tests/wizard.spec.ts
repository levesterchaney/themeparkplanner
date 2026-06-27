import { test, expect } from '@playwright/test';

test.describe('Itinerary Wizard', () => {
  let tripUrl: string;

  test.beforeAll(async ({ browser }) => {
    // Find the first available trip to test the wizard against
    const page = await browser.newPage();
    await page.goto('/trips');

    const firstTripLink = page.locator('a[href^="/trips/"]').first();
    await firstTripLink.waitFor({ timeout: 8000 });
    tripUrl = (await firstTripLink.getAttribute('href'))!;
    await page.close();
  });

  test('Generate Itinerary button opens the wizard', async ({ page }) => {
    await page.goto(tripUrl);
    await page.getByRole('button', { name: 'Generate Itinerary' }).click();

    // Wizard modal should appear with Step 1 content
    await expect(page.getByRole('heading', { name: 'Experience Style' })).toBeVisible();
    await expect(page.getByText('Step 1 of 5')).toBeVisible();
  });

  test('wizard step content is scrollable within the modal', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 500 }); // short viewport
    await page.goto(tripUrl);
    await page.getByRole('button', { name: 'Generate Itinerary' }).click();

    await expect(page.getByRole('heading', { name: 'Experience Style' })).toBeVisible();

    // Find the scrollable content area and verify it can scroll
    const scrollArea = page.locator('.overflow-y-auto').first();
    await expect(scrollArea).toBeVisible();

    const scrollHeightBefore = await scrollArea.evaluate(
      (el) => el.scrollHeight
    );
    const clientHeight = await scrollArea.evaluate((el) => el.clientHeight);

    // Content should be taller than the visible area (scroll is needed)
    expect(scrollHeightBefore).toBeGreaterThan(clientHeight);
  });

  test('Next button advances through wizard steps', async ({ page }) => {
    await page.goto(tripUrl);
    await page.getByRole('button', { name: 'Generate Itinerary' }).click();

    await expect(page.getByText('Step 1 of 5')).toBeVisible();

    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText('Step 2 of 5')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Attraction Preferences' })).toBeVisible();

    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText('Step 3 of 5')).toBeVisible();
  });

  test('Back button returns to the previous step', async ({ page }) => {
    await page.goto(tripUrl);
    await page.getByRole('button', { name: 'Generate Itinerary' }).click();

    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText('Step 2 of 5')).toBeVisible();

    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await expect(page.getByText('Step 1 of 5')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Experience Style' })).toBeVisible();
  });

  test('Cancel button closes the wizard', async ({ page }) => {
    await page.goto(tripUrl);
    await page.getByRole('button', { name: 'Generate Itinerary' }).click();

    await expect(page.getByText('Step 1 of 5')).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();

    // Wizard modal should be gone
    await expect(page.getByText('Step 1 of 5')).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Generate Itinerary' })).toBeVisible();
  });

  test('can navigate all 5 steps sequentially', async ({ page }) => {
    await page.goto(tripUrl);
    await page.getByRole('button', { name: 'Generate Itinerary' }).click();

    for (let step = 1; step <= 4; step++) {
      await expect(page.getByText(`Step ${step} of 5`)).toBeVisible();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
    }

    await expect(page.getByText('Step 5 of 5')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Review & Generate' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Generate Itinerary' }).last()).toBeVisible();
  });
});
