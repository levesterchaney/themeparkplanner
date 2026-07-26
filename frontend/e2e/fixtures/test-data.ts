export const TEST_USER = {
  email: 'e2e_test@themeparkplanner.test',
  password: 'E2eTestPassword123!',
  firstName: 'E2E',
  lastName: 'Tester',
};

export const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
export const BACKEND_URL = process.env.PLAYWRIGHT_BACKEND_URL || 'http://localhost:8000';
export const API_URL = `${BACKEND_URL}/api/v1`;
