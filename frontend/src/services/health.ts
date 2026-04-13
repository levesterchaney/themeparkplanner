import { apiClient } from '@/lib/api-client';
import { HealthStatus } from '@/types/api';

export const healthService = {
  // Check overall system health
  async getSystemHealth(): Promise<HealthStatus> {
    return apiClient.get<HealthStatus>('/api/v1/health');
  },

  // Check database health specifically
  async getDatabaseHealth(): Promise<HealthStatus> {
    return apiClient.get<HealthStatus>('/api/v1/health/database');
  },

  // Check Redis health specifically
  async getRedisHealth(): Promise<HealthStatus> {
    return apiClient.get<HealthStatus>('/api/v1/health/redis');
  },
};
