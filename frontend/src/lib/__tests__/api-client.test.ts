import { apiClient, ApiError } from '@/lib/api-client';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('ApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET requests', () => {
    test('makes successful GET request', async () => {
      const mockData = { message: 'success' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockData),
      } as unknown as Response);

      const result = await apiClient.get<typeof mockData>('/test');

      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/test', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'GET',
      });
      expect(result).toEqual(mockData);
    });

    test('makes GET request with query parameters', async () => {
      const mockData = { results: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockData),
      } as unknown as Response);

      await apiClient.get('/test', { param1: 'value1', param2: 'value2' });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/test?param1=value1&param2=value2',
        expect.any(Object)
      );
    });
  });

  describe('POST requests', () => {
    test('makes successful POST request with data', async () => {
      const postData = { name: 'test' };
      const mockResponse = { id: 1, ...postData };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as unknown as Response);

      const result = await apiClient.post<typeof mockResponse>(
        '/test',
        postData
      );

      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/test', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(postData),
      });
      expect(result).toEqual(mockResponse);
    });

    test('makes POST request without data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      } as unknown as Response);

      await apiClient.post('/test');

      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/test', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: undefined,
      });
    });
  });

  describe('PUT requests', () => {
    test('makes successful PUT request with data', async () => {
      const putData = { name: 'updated' };
      const mockResponse = { id: 1, ...putData };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as unknown as Response);

      const result = await apiClient.put<typeof mockResponse>(
        '/test/1',
        putData
      );

      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/test/1', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PUT',
        body: JSON.stringify(putData),
      });
      expect(result).toEqual(mockResponse);
    });

    test('makes PUT request without data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      } as unknown as Response);

      await apiClient.put('/test/1');

      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/test/1', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PUT',
        body: undefined,
      });
    });
  });

  describe('PATCH requests', () => {
    test('makes successful PATCH request with data', async () => {
      const patchData = { name: 'patched' };
      const mockResponse = { id: 1, ...patchData };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as unknown as Response);

      const result = await apiClient.patch<typeof mockResponse>(
        '/test/1',
        patchData
      );

      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/test/1', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
        body: JSON.stringify(patchData),
      });
      expect(result).toEqual(mockResponse);
    });

    test('makes PATCH request without data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      } as unknown as Response);

      await apiClient.patch('/test/1');

      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/test/1', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
        body: undefined,
      });
    });
  });

  describe('DELETE requests', () => {
    test('makes successful DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      } as unknown as Response);

      await apiClient.delete('/test/1');

      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/test/1', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'DELETE',
      });
    });
  });

  describe('Error handling', () => {
    test('handles HTTP error with JSON response containing message', async () => {
      const errorData = { message: 'Custom error message', code: 'NOT_FOUND' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValue(errorData),
      } as unknown as Response);

      await expect(apiClient.get('/test')).rejects.toThrow(
        'Custom error message'
      );
    });

    test('handles HTTP error with JSON response without message', async () => {
      const errorData = { error: 'Not found', code: 'NOT_FOUND' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValue(errorData),
      } as unknown as Response);

      await expect(apiClient.get('/test')).rejects.toThrow(
        'HTTP error! status: 404'
      );
    });

    test('handles HTTP error without JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as Response);

      await expect(apiClient.get('/test')).rejects.toThrow(ApiError);
    });

    test('handles network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiClient.get('/test')).rejects.toThrow(ApiError);
    });

    test('handles unknown error', async () => {
      mockFetch.mockRejectedValueOnce('Unknown error');

      await expect(apiClient.get('/test')).rejects.toThrow(ApiError);
    });
  });

  describe('204 No Content handling', () => {
    test('handles 204 response correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      } as unknown as Response);

      const result = await apiClient.delete('/test/1');
      expect(result).toEqual({});
    });
  });
});
