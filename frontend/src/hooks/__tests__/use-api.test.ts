import { renderHook, waitFor, act } from '@testing-library/react';
import { useApi, useApiMutation } from '@/hooks/use-api';
import { ApiError } from '@/lib/api-client';

describe('useApi Hook', () => {
  const mockApiCall = jest.fn();
  const mockSuccessData = { id: 1, name: 'test' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('immediate execution', () => {
    test('executes API call immediately by default', async () => {
      mockApiCall.mockResolvedValue(mockSuccessData);

      const { result } = renderHook(() => useApi(mockApiCall));

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();

      // Wait for API call to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockSuccessData);
      expect(result.current.error).toBeNull();
      expect(mockApiCall).toHaveBeenCalledTimes(1);
    });

    test('handles API error on immediate execution', async () => {
      const error = new ApiError({
        message: 'API Error',
        status: 500,
      });
      mockApiCall.mockRejectedValue(error);

      const { result } = renderHook(() => useApi(mockApiCall));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toEqual(error);
    });

    test('converts non-ApiError to ApiError', async () => {
      const genericError = new Error('Generic error');
      mockApiCall.mockRejectedValue(genericError);

      const { result } = renderHook(() => useApi(mockApiCall));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeInstanceOf(ApiError);
      expect(result.current.error?.message).toBe('Generic error');
      expect(result.current.error?.status).toBe(0);
    });

    test('handles unknown error type with string', async () => {
      mockApiCall.mockRejectedValue('String error');

      const { result } = renderHook(() => useApi(mockApiCall));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeInstanceOf(ApiError);
      expect(result.current.error?.message).toBe('Unknown error');
      expect(result.current.error?.status).toBe(0);
    });

    test('handles null error', async () => {
      mockApiCall.mockRejectedValue(null);

      const { result } = renderHook(() => useApi(mockApiCall));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeInstanceOf(ApiError);
      expect(result.current.error?.message).toBe('Unknown error');
      expect(result.current.error?.status).toBe(0);
    });
  });

  describe('manual execution', () => {
    test('does not execute immediately when immediate is false', () => {
      const { result } = renderHook(() =>
        useApi(mockApiCall, { immediate: false })
      );

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
      expect(mockApiCall).not.toHaveBeenCalled();
    });

    test('executes when execute is called manually', async () => {
      mockApiCall.mockResolvedValue(mockSuccessData);

      const { result } = renderHook(() =>
        useApi(mockApiCall, { immediate: false })
      );

      // Call execute manually
      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockSuccessData);
      expect(result.current.error).toBeNull();
      expect(mockApiCall).toHaveBeenCalledTimes(1);
    });

    test('execute method throws error on failure', async () => {
      const error = new ApiError({
        message: 'API Error',
        status: 500,
      });
      mockApiCall.mockRejectedValue(error);

      const { result } = renderHook(() =>
        useApi(mockApiCall, { immediate: false })
      );

      await act(async () => {
        await expect(result.current.execute()).rejects.toThrow('API Error');
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toEqual(error);
    });

    test('execute method handles non-Error exceptions', async () => {
      mockApiCall.mockRejectedValue('String error');

      const { result } = renderHook(() =>
        useApi(mockApiCall, { immediate: false })
      );

      await act(async () => {
        await expect(result.current.execute()).rejects.toThrow('Unknown error');
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeInstanceOf(ApiError);
      expect(result.current.error?.message).toBe('Unknown error');
    });

    test('execute method handles null exceptions', async () => {
      mockApiCall.mockRejectedValue(null);

      const { result } = renderHook(() =>
        useApi(mockApiCall, { immediate: false })
      );

      await act(async () => {
        await expect(result.current.execute()).rejects.toThrow('Unknown error');
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeInstanceOf(ApiError);
      expect(result.current.error?.message).toBe('Unknown error');
    });
  });

  describe('reset functionality', () => {
    test('resets state to initial values', async () => {
      mockApiCall.mockResolvedValue(mockSuccessData);

      const { result } = renderHook(() => useApi(mockApiCall));

      // Wait for initial execution
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockSuccessData);

      // Reset state
      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('state management during execution', () => {
    test('sets loading to true and clears error when execute is called', async () => {
      // First call fails
      mockApiCall.mockRejectedValueOnce(new Error('First error'));

      const { result } = renderHook(() =>
        useApi(mockApiCall, { immediate: false })
      );

      // Execute and let it fail
      await act(async () => {
        try {
          await result.current.execute();
        } catch {}
      });

      expect(result.current.error).toBeTruthy();

      // Now mock success
      mockApiCall.mockResolvedValue(mockSuccessData);

      // Execute again
      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockSuccessData);
      expect(result.current.error).toBeNull();
    });
  });
});

describe('useApiMutation Hook', () => {
  const mockApiCall = jest.fn();

  test('is equivalent to useApi with immediate: false', () => {
    const { result } = renderHook(() => useApiMutation(mockApiCall));

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(mockApiCall).not.toHaveBeenCalled();
  });
});
