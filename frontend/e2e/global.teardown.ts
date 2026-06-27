import { test as teardown } from '@playwright/test';
import { API_URL } from './fixtures/test-data';
import * as fs from 'fs';

teardown('delete test user and clean up', async ({ request }) => {
  // Delete the test user account via API
  await request.delete(`${API_URL}/users/me`);

  // Remove saved auth state
  try {
    fs.unlinkSync('e2e/.auth/user.json');
  } catch {
    // File may not exist if setup failed
  }
});
