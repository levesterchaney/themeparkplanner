export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success: boolean;
}

// Generic API Error Interface
export interface IApiError {
  message: string;
  status: number;
  details?: any;
}

// Health Check Types
export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  database?: 'healthy' | 'unhealthy' | 'unknown';
  redis?: 'healthy' | 'unhealthy' | 'unknown';
  error?: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

