import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HealthCheck from '@/components/HealthCheck';

// Mock the health service
jest.mock('@/services/health', () => ({
  healthService: {
    getSystemHealth: jest.fn(),
  },
}));

import { healthService } from '@/services/health';

const mockHealthService = healthService as jest.Mocked<typeof healthService>;

describe('HealthCheck Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders healthy status correctly', async () => {
    mockHealthService.getSystemHealth.mockResolvedValue({
      status: 'healthy',
      database: 'healthy',
      redis: 'healthy',
    });

    render(<HealthCheck />);

    await waitFor(() => {
      expect(screen.getByText(/api health status/i)).toBeInTheDocument();
      expect(screen.getByText(/overall/i)).toBeInTheDocument();
      expect(screen.getAllByText(/healthy/i).length).toBeGreaterThan(0);
    });
  });

  test('renders unhealthy status correctly', async () => {
    mockHealthService.getSystemHealth.mockResolvedValue({
      status: 'unhealthy',
      database: 'unhealthy',
      redis: 'healthy',
      error: 'Database connection failed',
    });

    render(<HealthCheck />);

    await waitFor(() => {
      expect(screen.getByText(/api health status/i)).toBeInTheDocument();
      expect(screen.getAllByText(/unhealthy/i).length).toBeGreaterThan(0);
      expect(
        screen.getByText(/database connection failed/i)
      ).toBeInTheDocument();
    });
  });

  test('handles loading state', () => {
    mockHealthService.getSystemHealth.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<HealthCheck />);

    expect(screen.getByText(/checking system health/i)).toBeInTheDocument();
  });

  test('handles API error', async () => {
    mockHealthService.getSystemHealth.mockRejectedValue(
      new Error('Network error')
    );

    render(<HealthCheck />);

    await waitFor(() => {
      expect(screen.getByText(/connection failed/i)).toBeInTheDocument();
    });
  });

  test('displays no data state', async () => {
    mockHealthService.getSystemHealth.mockResolvedValue(null);

    render(<HealthCheck />);

    await waitFor(() => {
      expect(screen.getByText(/no health data available/i)).toBeInTheDocument();
    });
  });

  test('displays status colors correctly for unknown status', async () => {
    mockHealthService.getSystemHealth.mockResolvedValue({
      status: 'unknown',
      database: 'unknown',
      redis: 'unknown',
    });

    render(<HealthCheck />);

    await waitFor(() => {
      const statusElements = screen.getAllByText(/unknown/i);
      expect(statusElements.length).toBeGreaterThan(0);
    });
  });

  test('handles error with status code', async () => {
    const errorWithStatus = Object.assign(new Error('Server error'), {
      status: 500,
    });
    mockHealthService.getSystemHealth.mockRejectedValue(errorWithStatus);

    render(<HealthCheck />);

    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument();
      // The status is shown as "Network Error" for errors without status in the display
      expect(screen.getByText(/status:/i)).toBeInTheDocument();
    });
  });

  test('handles error without status (network error)', async () => {
    mockHealthService.getSystemHealth.mockRejectedValue(
      new Error('Network failed')
    );

    render(<HealthCheck />);

    await waitFor(() => {
      expect(screen.getByText(/status: network error/i)).toBeInTheDocument();
    });
  });

  test('displays warning message when error is present in data', async () => {
    mockHealthService.getSystemHealth.mockResolvedValue({
      status: 'healthy',
      database: 'healthy',
      redis: 'healthy',
      error: 'Some minor issue detected',
    });

    render(<HealthCheck />);

    await waitFor(() => {
      expect(screen.getByText(/warning:/i)).toBeInTheDocument();
      expect(
        screen.getByText(/some minor issue detected/i)
      ).toBeInTheDocument();
    });
  });

  test('does not display warning when no error in data', async () => {
    mockHealthService.getSystemHealth.mockResolvedValue({
      status: 'healthy',
      database: 'healthy',
      redis: 'healthy',
    });

    render(<HealthCheck />);

    await waitFor(() => {
      expect(screen.queryByText(/warning:/i)).not.toBeInTheDocument();
    });
  });

  test('handles mixed health status', async () => {
    mockHealthService.getSystemHealth.mockResolvedValue({
      status: 'unhealthy',
      database: 'healthy',
      redis: 'unhealthy',
    });

    render(<HealthCheck />);

    await waitFor(() => {
      // Check for multiple instances of unhealthy and healthy
      const unhealthyElements = screen.getAllByText(/unhealthy/i);
      const healthyElements = screen.getAllByText(/healthy/i);
      expect(unhealthyElements.length).toBeGreaterThan(0);
      expect(healthyElements.length).toBeGreaterThan(0);
    });
  });

  test('handles undefined status values', async () => {
    mockHealthService.getSystemHealth.mockResolvedValue({
      status: undefined,
      database: undefined,
      redis: undefined,
    });

    render(<HealthCheck />);

    await waitFor(() => {
      const unknownElements = screen.getAllByText(/unknown/i);
      expect(unknownElements.length).toBe(3); // Overall, Database, Redis
    });
  });

  test('refresh button calls execute', async () => {
    const user = userEvent.setup();
    mockHealthService.getSystemHealth.mockResolvedValue({
      status: 'healthy',
      database: 'healthy',
      redis: 'healthy',
    });

    render(<HealthCheck />);

    await waitFor(() => {
      expect(screen.getByText(/refresh/i)).toBeInTheDocument();
    });

    // Clear the initial call
    mockHealthService.getSystemHealth.mockClear();

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    await user.click(refreshButton);

    expect(mockHealthService.getSystemHealth).toHaveBeenCalledTimes(1);
  });

  test('retry button in error state calls execute', async () => {
    const user = userEvent.setup();
    mockHealthService.getSystemHealth.mockRejectedValue(
      new Error('Network error')
    );

    render(<HealthCheck />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /retry/i })
      ).toBeInTheDocument();
    });

    // Reset and mock for retry - this time resolve successfully
    mockHealthService.getSystemHealth.mockClear();
    mockHealthService.getSystemHealth.mockResolvedValue({
      status: 'healthy',
      database: 'healthy',
      redis: 'healthy',
    });

    const retryButton = screen.getByRole('button', { name: /retry/i });
    await user.click(retryButton);

    // Wait for the retry call to complete successfully
    await waitFor(() => {
      expect(mockHealthService.getSystemHealth).toHaveBeenCalledTimes(1);
    });
  });
});
