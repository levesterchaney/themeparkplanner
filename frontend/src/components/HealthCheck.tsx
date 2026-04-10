'use client';

import { useCallback } from 'react';
import { useApi } from '@/hooks/use-api';
import { healthService } from '@/services';

export default function HealthCheck() {
  const getSystemHealth = useCallback(() => healthService.getSystemHealth(), []);
  const { data, loading, error, execute } = useApi(getSystemHealth, { immediate: true });

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'unhealthy':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'healthy':
        return '✅';
      case 'unhealthy':
        return '❌';
      default:
        return '⚠️';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-gray-600 dark:text-gray-300">Checking system health...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-red-800 dark:text-red-200 font-semibold">
              ❌ Connection Failed
            </h3>
            <p className="text-red-600 dark:text-red-300 text-sm mt-1">
              {error.message}
            </p>
            <p className="text-red-500 dark:text-red-400 text-xs mt-1">
              Status: {error.status || 'Network Error'}
            </p>
          </div>
          <button
            onClick={() => execute()}
            className="px-3 py-1 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded text-sm hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-gray-500 dark:text-gray-400">
        No health data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          API Health Status
        </h3>
        <button
          onClick={() => execute()}
          className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Status */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStatusIcon(data.status)}</span>
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Overall
              </div>
              <div className={`text-sm font-semibold ${getStatusColor(data.status)}`}>
                {data.status || 'unknown'}
              </div>
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStatusIcon(data.database)}</span>
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Database
              </div>
              <div className={`text-sm font-semibold ${getStatusColor(data.database)}`}>
                {data.database || 'unknown'}
              </div>
            </div>
          </div>
        </div>

        {/* Redis Status */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStatusIcon(data.redis)}</span>
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Redis
              </div>
              <div className={`text-sm font-semibold ${getStatusColor(data.redis)}`}>
                {data.redis || 'unknown'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {data.error && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            <strong>Warning:</strong> {data.error}
          </p>
        </div>
      )}
    </div>
  );
}