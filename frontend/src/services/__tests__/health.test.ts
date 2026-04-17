import { healthService } from '@/services';
import { apiClient } from '@/lib/api-client';

// Mock the API client
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('HealthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSystemHealth', () => {
    test('calls correct endpoint for system health', async () => {
      const mockHealthData = {
        status: 'healthy',
        database: 'healthy',
        redis: 'healthy',
      };

      mockApiClient.get.mockResolvedValue(mockHealthData);

      const result = await healthService.getSystemHealth();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/health');
      expect(result).toEqual(mockHealthData);
    });

    test('handles system health error', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Health check failed'));

      await expect(healthService.getSystemHealth()).rejects.toThrow(
        'Health check failed'
      );
    });
  });

  describe('getDatabaseHealth', () => {
    test('calls correct endpoint for database health', async () => {
      const mockHealthData = {
        status: 'healthy',
        database: 'connected',
      };

      mockApiClient.get.mockResolvedValue(mockHealthData);

      const result = await healthService.getDatabaseHealth();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/health/database');
      expect(result).toEqual(mockHealthData);
    });

    test('handles database health error', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Database check failed'));

      await expect(healthService.getDatabaseHealth()).rejects.toThrow(
        'Database check failed'
      );
    });
  });

  describe('getRedisHealth', () => {
    test('calls correct endpoint for redis health', async () => {
      const mockHealthData = {
        status: 'healthy',
        redis: 'connected',
      };

      mockApiClient.get.mockResolvedValue(mockHealthData);

      const result = await healthService.getRedisHealth();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/health/redis');
      expect(result).toEqual(mockHealthData);
    });

    test('handles redis health error', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Redis check failed'));

      await expect(healthService.getRedisHealth()).rejects.toThrow(
        'Redis check failed'
      );
    });
  });
});
