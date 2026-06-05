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

export interface UpdateTripRequestData {
  title?: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  party_size?: number;
  has_kids?: boolean;
}

export interface ItineraryPreferencesData {
  // Trip-specific overrides
  thrill_level?: 'low' | 'moderate' | 'high' | 'extreme';
  visit_style?: 'relaxed' | 'moderate' | 'aggressive' | 'commando';

  // Attraction preferences
  must_do_attractions?: string[]; // attraction IDs
  skip_attractions?: string[]; // attraction IDs
  preferred_attraction_types?: string[]; // rides, shows, dining, etc

  // Scheduling preferences
  start_time?: string; // "09:00"
  end_time?: string; // "21:00"
  break_preferences?: {
    lunch_break?: boolean;
    afternoon_rest?: boolean;
    preferred_meal_times?: string[];
  };

  // Experience priorities
  priority_factors?: {
    minimize_walking?: boolean;
    avoid_crowds?: boolean;
    maximize_attractions?: boolean;
    include_character_meets?: boolean;
    prioritize_new_attractions?: boolean;
  };

  // Group-specific
  accessibility_needs?: string[];
  dietary_restrictions?: string[];
  budget_tier?: 'budget' | 'moderate' | 'premium';
}

export interface AttractionData {
  id: number;
  park_id: number;
  external_id: string;
  name: string;
  type?: string;
  area?: string;
  min_height_cm?: number;
  avg_duration_min?: number;
  thrill_level?: string;
  kid_friendly?: boolean;
  location_lat?: number;
  location_lon?: number;
  attraction_metadata?: Record<string, unknown>;
}

export interface ItineraryData {
  id: number;
  trip_id: number;
  day_date: string;
  title?: string;
  must_dos?: string[];
  skip_list?: string[];
  status: string;
  items?: ItineraryItemData[];
}

export interface ItineraryItemData {
  id: number;
  attraction: AttractionData;
  position: number;
  arrival_time?: string;
  duration_min?: number;
  notes?: string;
}

export interface ItineraryResponse {
  message: string;
  itinerary?: ItineraryData;
}
