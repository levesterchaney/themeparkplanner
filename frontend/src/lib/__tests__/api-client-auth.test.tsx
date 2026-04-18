import { apiClient, setGlobalAuthHandler } from '../api-client';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('API Client Auth Handling', () => {
  let authHandler: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    authHandler = jest.fn();
    setGlobalAuthHandler(authHandler);
  });

  afterEach(() => {
    setGlobalAuthHandler(() => {});
  });

  test('calls auth failure handler on 401 response', async () => {
    const mockResponse = {
      ok: false,
      status: 401,
      json: jest.fn().mockResolvedValue({ message: 'Unauthorized' }),
    } as Response;
    mockFetch.mockResolvedValue(mockResponse);

    const result = await apiClient.get('/test-endpoint');

    expect(authHandler).toHaveBeenCalledTimes(1);
    expect(result).toEqual({});
  });

  test('calls auth failure handler on 403 response', async () => {
    const mockResponse = {
      ok: false,
      status: 403,
      json: jest.fn().mockResolvedValue({ message: 'Forbidden' }),
    };
    mockFetch.mockResolvedValue(mockResponse as Response);

    const result = await apiClient.get('/test-endpoint');

    expect(authHandler).toHaveBeenCalledTimes(1);
    expect(result).toEqual({});
  });

  test('does not call auth handler on other error status codes', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      json: jest.fn().mockResolvedValue({ message: 'Server Error' }),
    };
    mockFetch.mockResolvedValue(mockResponse as Response);

    try {
      await apiClient.get('/test-endpoint');
    } catch {
      // Expected to throw for 500 errors
    }

    expect(authHandler).not.toHaveBeenCalled();
  });

  test('handles successful responses normally', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ data: 'success' }),
    };
    mockFetch.mockResolvedValue(mockResponse as Response);

    const result = await apiClient.get('/test-endpoint');

    expect(authHandler).not.toHaveBeenCalled();
    expect(result).toEqual({ data: 'success' });
  });

  test('handles 401 when no auth handler is set', async () => {
    setGlobalAuthHandler(() => {}); // Clear the handler

    const mockResponse = {
      ok: false,
      status: 401,
      json: jest.fn().mockResolvedValue({ message: 'Unauthorized' }),
    };
    mockFetch.mockResolvedValue(mockResponse as Response);

    try {
      await apiClient.get('/test-endpoint');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
