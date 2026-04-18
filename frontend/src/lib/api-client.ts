// Global auth failure handler - will be set by SessionProvider
let globalAuthFailureHandler: (() => void) | null = null;

export const setGlobalAuthHandler = (handler: () => void) => {
  globalAuthFailureHandler = handler;
};

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle auth failures globally
        if (
          (response.status === 401 || response.status === 403) &&
          globalAuthFailureHandler
        ) {
          globalAuthFailureHandler();
          // Don't throw the error for auth failures as they're handled globally
          return {} as T;
        }

        throw new ApiError({
          message:
            errorData.message || `HTTP error! status: ${response.status}`,
          status: response.status,
          details: errorData,
        });
      }

      // Handle empty responses (e.g., 204 No Content)
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Network or other fetch errors
      throw new ApiError({
        message:
          error instanceof Error ? error.message : 'An unknown error occurred',
        status: 0,
        details: error,
      });
    }
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const searchParams = params ? new URLSearchParams(params) : null;
    const url = searchParams ? `${endpoint}?${searchParams}` : endpoint;

    return this.request<T>(url, {
      method: 'GET',
    });
  }

  // POST request
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Custom API Error class
export class ApiError extends Error {
  public status: number;
  public details?: unknown;

  constructor({
    message,
    status,
    details,
  }: {
    message: string;
    status: number;
    details?: unknown;
  }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}
