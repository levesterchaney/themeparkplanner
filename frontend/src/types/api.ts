export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  success: boolean;
}

// Generic API Error Interface
export interface IApiError {
  message: string;
  status: number;
  details?: unknown;
}

// Health Check Types
export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  database?: 'healthy' | 'unhealthy' | 'unknown';
  redis?: 'healthy' | 'unhealthy' | 'unknown';
  error?: string;
}

export interface RegistrationRequestData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginRequestData {
  email: string;
  password: string;
}

export interface ForgotPasswordRequestData {
  email: string;
}

export interface PasswordResetRequestData {
  token: string;
  newPassword: string;
}

export interface UserProfileRequestData {
  firstName: string;
  lastName: string;
  avatarUrl: string;
}

export interface UserPreferenceRequestData {
  defaultPartySize?: number;
  hasKids?: boolean;
  thrillLevel?: string;
  accessibilityNeeds?: string[];
  dietaryRestrictions?: string[];
}
