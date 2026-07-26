import { test as base, Page } from '@playwright/test';

type AuthFixtures = {
  authenticatedPage: Page;
};

// Extends base test with a page that already has the stored auth session.
// The storage state is loaded at the project level in playwright.config.ts,
// so this fixture is just a typed alias — useful for making intent explicit.
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await use(page);
  },
});

export { expect } from '@playwright/test';
