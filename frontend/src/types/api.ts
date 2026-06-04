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
  first_name?: string;
  last_name?: string;
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
  new_password: string;
}

export interface UserProfileRequestData {
  first_name: string;
  last_name: string;
  avatar_url: string;
}

export interface UserPreferenceRequestData {
  default_party_size?: number;
  has_kids?: boolean;
  thrill_level?: string;
  accessibility_needs?: string[];
  dietary_restrictions?: string[];
}

export interface NewTripRequestData {
  title: string;
  destination: string;
  start_date: string; // Changed to string to match backend date format
  end_date: string; // Changed to string to match backend date format
  party_size: number;
  has_kids: boolean;
}
