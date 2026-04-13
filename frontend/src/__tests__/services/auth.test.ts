import { authService } from '@/services/auth';
import { apiClient } from '@/lib/api-client';

// Mock the API client
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    test('calls correct endpoint with user data', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      mockApiClient.post.mockResolvedValue({
        message: 'User created successfully',
        user_id: 1,
      });

      const result = await authService.register(userData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/v1/auth/register',
        userData
      );
      expect(result).toEqual({
        message: 'User created successfully',
        user_id: 1,
      });
    });

    test('handles registration error', async () => {
      const userData = {
        firstName: 'John',
        email: 'john@example.com',
        password: 'password123',
      };

      mockApiClient.post.mockRejectedValue(new Error('Registration failed'));

      await expect(authService.register(userData)).rejects.toThrow(
        'Registration failed'
      );
    });
  });

  describe('login', () => {
    test('calls correct endpoint with credentials', async () => {
      const email = 'john@example.com';
      const password = 'password123';

      mockApiClient.post.mockResolvedValue({
        message: 'Login successful',
        user_id: 1,
      });

      const result = await authService.login(email, password);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/auth/login', {
        email,
        password,
      });
      expect(result).toEqual({
        message: 'Login successful',
        user_id: 1,
      });
    });

    test('handles login error', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Invalid credentials'));

      await expect(
        authService.login('wrong@email.com', 'wrongpass')
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    test('calls correct logout endpoint', async () => {
      mockApiClient.post.mockResolvedValue({
        message: 'Logout successful',
      });

      const result = await authService.logout();

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/auth/logout');
      expect(result).toEqual({
        message: 'Logout successful',
      });
    });

    test('handles logout error', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Logout failed'));

      await expect(authService.logout()).rejects.toThrow('Logout failed');
    });
  });
});
