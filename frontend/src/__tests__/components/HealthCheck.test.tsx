import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import HealthCheck from '@/components/HealthCheck';

// Mock the API client
jest.mock('@/services/health', () => ({
  healthService: {
    getStatus: jest.fn(),
  },
}));

import { healthService } from '@/services/health';

const mockHealthService = healthService as jest.Mocked<typeof healthService>;

describe('HealthCheck Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders healthy status correctly', async () => {
    mockHealthService.getStatus.mockResolvedValue({
      status: 'healthy',
      database: 'healthy',
      redis: 'healthy',
    });

    render(<HealthCheck />);

    await waitFor(() => {
      expect(screen.getByText(/system status/i)).toBeInTheDocument();
      expect(screen.getByText(/healthy/i)).toBeInTheDocument();
    });
  });

  test('renders unhealthy status correctly', async () => {
    mockHealthService.getStatus.mockResolvedValue({
      status: 'unhealthy',
      database: 'unhealthy',
      redis: 'healthy',
      error: 'Database connection failed',
    });

    render(<HealthCheck />);

    await waitFor(() => {
      expect(screen.getByText(/unhealthy/i)).toBeInTheDocument();
      expect(
        screen.getByText(/database connection failed/i)
      ).toBeInTheDocument();
    });
  });

  test('handles loading state', () => {
    mockHealthService.getStatus.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<HealthCheck />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('handles API error', async () => {
    mockHealthService.getStatus.mockRejectedValue(new Error('Network error'));

    render(<HealthCheck />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });
});
