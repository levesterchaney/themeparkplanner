import { authService } from '@/services';
import { apiClient } from '@/lib/api-client';

jest.mock('@/lib/api-client', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

const mockGet = apiClient.get as jest.Mock;

describe('authService.validateSession', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls GET /api/v1/users/me', async () => {
    mockGet.mockResolvedValue({ email: 'user@example.com' });
    await authService.validateSession();
    expect(mockGet).toHaveBeenCalledWith('/api/v1/users/me');
  });

  it('returns the user profile data', async () => {
    const profile = { email: 'user@example.com', first_name: 'Jane' };
    mockGet.mockResolvedValue(profile);
    const result = await authService.validateSession();
    expect(result).toEqual(profile);
  });

  it('propagates errors when the session is invalid', async () => {
    mockGet.mockRejectedValue(new Error('Unauthorized'));
    await expect(authService.validateSession()).rejects.toThrow('Unauthorized');
  });
});
