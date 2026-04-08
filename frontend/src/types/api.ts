// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

// Health Check Types
export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  database?: 'healthy' | 'unhealthy' | 'unknown';
  redis?: 'healthy' | 'unhealthy' | 'unknown';
  error?: string;
}

// Generic API Error Interface
export interface IApiError {
  message: string;
  status: number;
  details?: any;
}

// Theme Park Types (for future use)
export interface ThemePark {
  id: string;
  name: string;
  location: string;
  description?: string;
  // Add more fields as needed
}

export interface Attraction {
  id: string;
  name: string;
  park_id: string;
  wait_time?: number;
  description?: string;
  // Add more fields as needed
}

export interface Itinerary {
  id: string;
  name: string;
  user_id: string;
  park_id: string;
  date: string;
  attractions: string[]; // attraction IDs
  // Add more fields as needed
}