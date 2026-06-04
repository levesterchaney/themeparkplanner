import { apiClient } from '@/lib';
import { UserProfileRequestData, UserPreferenceRequestData } from '@/types/api';

// Response types for user profile data
export interface UserProfileResponseData {
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
  preferences?: {
    default_party_size?: number;
    has_kids?: boolean;
    thrill_level?: 'low' | 'moderate' | 'high' | 'extreme';
    accessibility_needs?: string[];
    dietary_restrictions?: string[];
  };
}

export const userService = {
  getProfile: async (): Promise<UserProfileResponseData> => {
    return apiClient.get<UserProfileResponseData>('/api/v1/users/me');
  },
  updateProfile: async (
    data: UserProfileRequestData
  ): Promise<{ message: string }> => {
    return apiClient.patch<{ message: string }>('/api/v1/users/me', data);
  },
  updateUserPreferences: async (
    data: UserPreferenceRequestData
  ): Promise<{ message: string }> => {
    return apiClient.patch<{ message: string }>(
      '/api/v1/users/me/preferences',
      data
    );
  },
};
