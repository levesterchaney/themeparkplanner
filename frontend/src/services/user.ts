import { apiClient } from '@/lib';
import { UserProfileRequestData, UserPreferenceRequestData } from '@/types/api';

// Response types for user profile data
export interface UserProfileResponseData {
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  preferences?: {
    defaultPartySize?: number;
    hasKids?: boolean;
    thrillLevel?: 'low' | 'moderate' | 'high' | 'extreme';
    accessibilityNeeds?: string[];
    dietaryRestrictions?: string[];
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
