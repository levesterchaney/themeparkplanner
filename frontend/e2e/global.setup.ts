import { test as setup, expect } from '@playwright/test';
import { TEST_USER, API_URL } from './fixtures/test-data';
import * as fs from 'fs';
import * as path from 'path';

const AUTH_FILE = 'e2e/.auth/user.json';

setup('seed test user and authenticate', async ({ page, request }) => {
  // Seed fixture destinations/attractions (idempotent, no-op if already seeded).
  // Without this, pages like "new trip" have no destinations to select and
  // dependent tests time out.
  await request.post(`${API_URL}/parks/seed-test-data`);

  // Register test user (ignore 422 if already exists)
  await request.post(`${API_URL}/auth/register`, {
    data: {
      email: TEST_USER.email,
      password: TEST_USER.password,
      first_name: TEST_USER.firstName,
      last_name: TEST_USER.lastName,
    },
  });

  // Log in via the UI so cookies are set correctly on localhost:3000
  await page.goto('/login');
  await page.getByPlaceholder('Email address').fill(TEST_USER.email);
  await page.getByPlaceholder('Password').fill(TEST_USER.password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Wait for redirect to home page after login
  await page.waitForURL('/', { timeout: 10000 });

  // Save storage state (cookies + localStorage)
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  await page.context().storageState({ path: AUTH_FILE });
});
