'use client';

import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '@/lib/api-client';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

export interface UseApiOptions {
  immediate?: boolean; // Whether to execute the API call immediately
}

/**
 * Custom hook for managing API calls with loading, error, and data states
 */
export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = { immediate: true }
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: options.immediate ?? true,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiCall();
      setState({
        data: result,
        loading: false,
        error: null,
      });
      return result;
    } catch (error) {
      const apiError = error instanceof ApiError 
        ? error 
        : new ApiError({ 
            message: error instanceof Error ? error.message : 'Unknown error', 
            status: 0 
          });
      
      setState({
        data: null,
        loading: false,
        error: apiError,
      });
      throw apiError;
    }
  }, [apiCall]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, [execute, options.immediate]);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook for API calls that should not execute automatically
 */
export function useApiMutation<T>(apiCall: () => Promise<T>) {
  return useApi(apiCall, { immediate: false });
}