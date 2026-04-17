import { userService } from '@/services';
import { apiClient } from '@/lib';
import { UserProfileRequestData, UserPreferenceRequestData } from '@/types/api';

// Mock the apiClient
jest.mock('@/lib', () => ({
  apiClient: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    test('successfully fetches user profile', async () => {
      const mockUserProfile = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        avatar: 'https://example.com/avatar.jpg',
        preferences: {
          defaultPartySize: 4,
          hasKids: true,
          thrillLevel: 'high' as const,
          accessibilityNeeds: ['wheelchair'],
          dietaryRestrictions: ['vegetarian'],
        },
      };

      mockApiClient.get.mockResolvedValue(mockUserProfile);

      const result = await userService.getProfile();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/users/me');
      expect(result).toEqual(mockUserProfile);
    });

    test('handles API error when fetching profile', async () => {
      const errorMessage = 'Failed to fetch user profile';
      mockApiClient.get.mockRejectedValue(new Error(errorMessage));

      await expect(userService.getProfile()).rejects.toThrow(errorMessage);
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/users/me');
    });

    test('returns user profile without preferences', async () => {
      const mockUserProfile = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
      };

      mockApiClient.get.mockResolvedValue(mockUserProfile);

      const result = await userService.getProfile();

      expect(result).toEqual(mockUserProfile);
      expect(result.preferences).toBeUndefined();
    });

    test('handles network errors', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      await expect(userService.getProfile()).rejects.toThrow('Network error');
    });
  });

  describe('updateProfile', () => {
    test('successfully updates user profile with all fields', async () => {
      const profileData: UserProfileRequestData = {
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: 'https://example.com/new-avatar.jpg',
      };

      const mockResponse = { message: 'Profile updated successfully' };
      mockApiClient.patch.mockResolvedValue(mockResponse);

      const result = await userService.updateProfile(profileData);

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/api/v1/users/me',
        profileData
      );
      expect(result).toEqual(mockResponse);
    });

    test('successfully updates profile with partial data', async () => {
      const profileData: UserProfileRequestData = {
        firstName: 'Jane',
      };

      const mockResponse = { message: 'Profile updated' };
      mockApiClient.patch.mockResolvedValue(mockResponse);

      const result = await userService.updateProfile(profileData);

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/api/v1/users/me',
        profileData
      );
      expect(result).toEqual(mockResponse);
    });

    test('handles update profile API error', async () => {
      const profileData: UserProfileRequestData = {
        firstName: 'John',
        lastName: 'Doe',
      };

      mockApiClient.patch.mockRejectedValue(new Error('Update failed'));

      await expect(userService.updateProfile(profileData)).rejects.toThrow(
        'Update failed'
      );
      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/api/v1/users/me',
        profileData
      );
    });

    test('handles validation errors', async () => {
      const profileData: UserProfileRequestData = {
        firstName: '',
        lastName: 'Doe',
      };

      mockApiClient.patch.mockRejectedValue(
        new Error('Validation failed: firstName is required')
      );

      await expect(userService.updateProfile(profileData)).rejects.toThrow(
        'Validation failed: firstName is required'
      );
    });

    test('updates profile with empty avatar URL', async () => {
      const profileData: UserProfileRequestData = {
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: '',
      };

      const mockResponse = { message: 'Profile updated' };
      mockApiClient.patch.mockResolvedValue(mockResponse);

      const result = await userService.updateProfile(profileData);

      expect(result).toEqual(mockResponse);
      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/api/v1/users/me',
        profileData
      );
    });
  });

  describe('updateUserPreferences', () => {
    test('successfully updates all preference fields', async () => {
      const preferencesData: UserPreferenceRequestData = {
        defaultPartySize: 6,
        hasKids: true,
        thrillLevel: 'extreme',
        accessibilityNeeds: ['wheelchair', 'hearing_impairment'],
        dietaryRestrictions: ['gluten_free', 'dairy_free'],
      };

      const mockResponse = { message: 'Preferences updated successfully' };
      mockApiClient.patch.mockResolvedValue(mockResponse);

      const result = await userService.updateUserPreferences(preferencesData);

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/api/v1/users/me/preferences',
        preferencesData
      );
      expect(result).toEqual(mockResponse);
    });

    test('updates partial preferences', async () => {
      const preferencesData: UserPreferenceRequestData = {
        thrillLevel: 'low',
        hasKids: false,
      };

      const mockResponse = { message: 'Preferences updated' };
      mockApiClient.patch.mockResolvedValue(mockResponse);

      const result = await userService.updateUserPreferences(preferencesData);

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/api/v1/users/me/preferences',
        preferencesData
      );
      expect(result).toEqual(mockResponse);
    });

    test('updates only party size preference', async () => {
      const preferencesData: UserPreferenceRequestData = {
        defaultPartySize: 2,
      };

      const mockResponse = { message: 'Party size updated' };
      mockApiClient.patch.mockResolvedValue(mockResponse);

      const result = await userService.updateUserPreferences(preferencesData);

      expect(result).toEqual(mockResponse);
    });

    test('updates only accessibility needs', async () => {
      const preferencesData: UserPreferenceRequestData = {
        accessibilityNeeds: ['visual_impairment'],
      };

      const mockResponse = { message: 'Accessibility preferences updated' };
      mockApiClient.patch.mockResolvedValue(mockResponse);

      const result = await userService.updateUserPreferences(preferencesData);

      expect(result).toEqual(mockResponse);
    });

    test('updates only dietary restrictions', async () => {
      const preferencesData: UserPreferenceRequestData = {
        dietaryRestrictions: ['vegetarian', 'nut_allergy'],
      };

      const mockResponse = { message: 'Dietary preferences updated' };
      mockApiClient.patch.mockResolvedValue(mockResponse);

      const result = await userService.updateUserPreferences(preferencesData);

      expect(result).toEqual(mockResponse);
    });

    test('handles preference update API error', async () => {
      const preferencesData: UserPreferenceRequestData = {
        defaultPartySize: -1, // Invalid value
      };

      mockApiClient.patch.mockRejectedValue(new Error('Invalid party size'));

      await expect(
        userService.updateUserPreferences(preferencesData)
      ).rejects.toThrow('Invalid party size');
      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/api/v1/users/me/preferences',
        preferencesData
      );
    });

    test('handles network error during preferences update', async () => {
      const preferencesData: UserPreferenceRequestData = {
        thrillLevel: 'high',
      };

      mockApiClient.patch.mockRejectedValue(new Error('Network timeout'));

      await expect(
        userService.updateUserPreferences(preferencesData)
      ).rejects.toThrow('Network timeout');
    });

    test('handles server error response', async () => {
      const preferencesData: UserPreferenceRequestData = {
        defaultPartySize: 4,
      };

      mockApiClient.patch.mockRejectedValue(new Error('Internal server error'));

      await expect(
        userService.updateUserPreferences(preferencesData)
      ).rejects.toThrow('Internal server error');
    });

    test('updates with empty arrays', async () => {
      const preferencesData: UserPreferenceRequestData = {
        accessibilityNeeds: [],
        dietaryRestrictions: [],
      };

      const mockResponse = { message: 'Preferences cleared' };
      mockApiClient.patch.mockResolvedValue(mockResponse);

      const result = await userService.updateUserPreferences(preferencesData);

      expect(result).toEqual(mockResponse);
      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/api/v1/users/me/preferences',
        preferencesData
      );
    });

    test('validates thrill level values', async () => {
      const validThrillLevels: ('low' | 'moderate' | 'high' | 'extreme')[] = [
        'low',
        'moderate',
        'high',
        'extreme',
      ];

      for (const thrillLevel of validThrillLevels) {
        const preferencesData: UserPreferenceRequestData = {
          thrillLevel,
        };

        const mockResponse = { message: `Thrill level set to ${thrillLevel}` };
        mockApiClient.patch.mockResolvedValue(mockResponse);

        const result = await userService.updateUserPreferences(preferencesData);

        expect(result).toEqual(mockResponse);
        expect(mockApiClient.patch).toHaveBeenCalledWith(
          '/api/v1/users/me/preferences',
          preferencesData
        );
      }
    });
  });

  describe('error handling', () => {
    test('handles 401 unauthorized errors', async () => {
      const unauthorizedError = new Error('Unauthorized');
      mockApiClient.get.mockRejectedValue(unauthorizedError);

      await expect(userService.getProfile()).rejects.toThrow('Unauthorized');
    });

    test('handles 403 forbidden errors', async () => {
      const forbiddenError = new Error('Forbidden');
      mockApiClient.patch.mockRejectedValue(forbiddenError);

      await expect(
        userService.updateProfile({ firstName: 'Test' })
      ).rejects.toThrow('Forbidden');
    });

    test('handles 404 not found errors', async () => {
      const notFoundError = new Error('User not found');
      mockApiClient.get.mockRejectedValue(notFoundError);

      await expect(userService.getProfile()).rejects.toThrow('User not found');
    });

    test('handles 500 server errors', async () => {
      const serverError = new Error('Internal server error');
      mockApiClient.patch.mockRejectedValue(serverError);

      await expect(
        userService.updateUserPreferences({ defaultPartySize: 2 })
      ).rejects.toThrow('Internal server error');
    });
  });

  describe('data flow integration', () => {
    test('profile update followed by preferences update', async () => {
      const profileData: UserProfileRequestData = {
        firstName: 'John',
        lastName: 'Doe',
      };
      const preferencesData: UserPreferenceRequestData = {
        defaultPartySize: 4,
        hasKids: true,
      };

      const profileResponse = { message: 'Profile updated' };
      const preferencesResponse = { message: 'Preferences updated' };

      mockApiClient.patch
        .mockResolvedValueOnce(profileResponse)
        .mockResolvedValueOnce(preferencesResponse);

      const profileResult = await userService.updateProfile(profileData);
      const preferencesResult =
        await userService.updateUserPreferences(preferencesData);

      expect(profileResult).toEqual(profileResponse);
      expect(preferencesResult).toEqual(preferencesResponse);
      expect(mockApiClient.patch).toHaveBeenCalledTimes(2);
    });

    test('get profile after update operations', async () => {
      const updatedProfile = {
        firstName: 'Updated',
        lastName: 'User',
        email: 'updated@example.com',
        preferences: {
          defaultPartySize: 3,
          hasKids: false,
          thrillLevel: 'moderate' as const,
        },
      };

      // First update profile
      mockApiClient.patch.mockResolvedValueOnce({ message: 'Profile updated' });

      // Then get updated profile
      mockApiClient.get.mockResolvedValueOnce(updatedProfile);

      await userService.updateProfile({
        firstName: 'Updated',
        lastName: 'User',
      });
      const result = await userService.getProfile();

      expect(result).toEqual(updatedProfile);
      expect(mockApiClient.patch).toHaveBeenCalledWith('/api/v1/users/me', {
        firstName: 'Updated',
        lastName: 'User',
      });
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/users/me');
    });
  });
});
