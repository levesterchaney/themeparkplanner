'use client';

import { useEffect, useState } from 'react';
import { userService } from '@/services/user';
import { UserPreferenceRequestData } from '@/types/api';

interface UserProfileResponseData {
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

export default function UserProfileForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UserProfileResponseData | null>(
    null
  );

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response =
          (await userService.getProfile()) as UserProfileResponseData;
        setFormData(response);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load user profile'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            [field]: value,
          }
        : null
    );
  };

  const handlePreferenceChange = (
    field: string,
    value: number | boolean | string | string[]
  ) => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            preferences: {
              defaultPartySize: prev.preferences?.defaultPartySize,
              hasKids: prev.preferences?.hasKids,
              thrillLevel: prev.preferences?.thrillLevel,
              accessibilityNeeds: prev.preferences?.accessibilityNeeds || [],
              dietaryRestrictions: prev.preferences?.dietaryRestrictions || [],
              ...prev.preferences,
              [field]: value,
            },
          }
        : null
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      setLoading(true);
      setError(null);

      // Update user details
      await userService.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        avatarUrl: formData.avatar || '',
      });

      // Update preferences if they exist
      if (formData.preferences) {
        const preferencesToUpdate: UserPreferenceRequestData = {};

        if (formData.preferences.defaultPartySize !== undefined) {
          preferencesToUpdate.defaultPartySize =
            formData.preferences.defaultPartySize;
        }
        if (formData.preferences.hasKids !== undefined) {
          preferencesToUpdate.hasKids = formData.preferences.hasKids;
        }
        if (formData.preferences.thrillLevel !== undefined) {
          preferencesToUpdate.thrillLevel = formData.preferences.thrillLevel;
        }
        if (formData.preferences.accessibilityNeeds !== undefined) {
          preferencesToUpdate.accessibilityNeeds =
            formData.preferences.accessibilityNeeds.map(
              mapFrontendToBackendAccessibility
            );
        }
        if (formData.preferences.dietaryRestrictions !== undefined) {
          preferencesToUpdate.dietaryRestrictions =
            formData.preferences.dietaryRestrictions.map(
              mapFrontendToBackendDietary
            );
        }

        // Only send the update if we have preferences to update
        if (Object.keys(preferencesToUpdate).length > 0) {
          await userService.updateUserPreferences(preferencesToUpdate);
        }
      }

      // Refresh user data
      const updatedResponse =
        (await userService.getProfile()) as UserProfileResponseData;
      setFormData(updatedResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Map frontend accessibility values to backend values
  const mapFrontendToBackendAccessibility = (value: string): string => {
    const mapping: { [key: string]: string } = {
      hearing: 'hearing_impairment',
      visual: 'visual_impairment',
      animal: 'service_animal',
      cognitive: 'cognitive_disability',
      wheelchair: 'wheelchair',
      mobility: 'mobility_aid',
    };
    return mapping[value] || value;
  };

  // Map frontend dietary values to backend values
  const mapFrontendToBackendDietary = (value: string): string => {
    const mapping: { [key: string]: string } = {
      glutenFree: 'gluten_free',
      dairyFree: 'dairy_free',
      nut: 'nut_allergy',
      shellfish: 'shellfish_allergy',
    };
    return mapping[value] || value;
  };

  // Map backend to frontend for display
  const mapBackendToFrontendAccessibility = (value: string): string => {
    const mapping: { [key: string]: string } = {
      hearing_impairment: 'hearing',
      visual_impairment: 'visual',
      service_animal: 'animal',
      cognitive_disability: 'cognitive',
      mobility_aid: 'mobility',
    };
    return mapping[value] || value;
  };

  const mapBackendToFrontendDietary = (value: string): string => {
    const mapping: { [key: string]: string } = {
      gluten_free: 'glutenFree',
      dairy_free: 'dairyFree',
      nut_allergy: 'nut',
      shellfish_allergy: 'shellfish',
    };
    return mapping[value] || value;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto" />
          <p className="mt-4 text-lg text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <form onSubmit={handleSubmit}>
          <div>
            {/* User profile form fields go here */}
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700"
            >
              First Name:
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              value={formData?.firstName || ''}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />

            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mt-4"
            >
              Last Name:
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              value={formData?.lastName || ''}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />

            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mt-4"
            >
              Email:
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              disabled={true}
              value={formData?.email || ''}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed"
            />

            <h4 className="text-lg font-medium text-gray-900 mt-6">
              Preferences
            </h4>
            <label
              htmlFor="partySize"
              className="block text-sm font-medium text-gray-700 mt-4"
            >
              Preferred Party Size:
            </label>
            <input
              id="partySize"
              name="partySize"
              type="number"
              min="1"
              max="20"
              value={formData?.preferences?.defaultPartySize || ''}
              onChange={(e) =>
                handlePreferenceChange(
                  'defaultPartySize',
                  parseInt(e.target.value) || 1
                )
              }
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />

            <label
              htmlFor="kids"
              className="block text-sm font-medium text-gray-700 mt-4"
            >
              Traveling with Kids:
            </label>
            <input
              id="kids"
              name="kids"
              type="checkbox"
              checked={formData?.preferences?.hasKids || false}
              onChange={(e) =>
                handlePreferenceChange('hasKids', e.target.checked)
              }
              className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />

            <label
              htmlFor="thrillLevel"
              className="block text-sm font-medium text-gray-700 mt-4"
            >
              Thrill Ride Preference:
            </label>
            <select
              id="thrillLevel"
              name="thrillLevel"
              value={formData?.preferences?.thrillLevel || 'moderate'}
              onChange={(e) =>
                handlePreferenceChange('thrillLevel', e.target.value)
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="low">Low Thrill</option>
              <option value="moderate">Medium Thrill</option>
              <option value="high">High Thrill</option>
              <option value="extreme">Extreme Thrill</option>
            </select>

            <label
              htmlFor="accessibility"
              className="block text-sm font-medium text-gray-700 mt-4"
            >
              Accessibility Needs:
            </label>
            <select
              id="accessibility"
              name="accessibility"
              value={
                formData?.preferences?.accessibilityNeeds?.map(
                  mapBackendToFrontendAccessibility
                ) || []
              }
              multiple
              onChange={(e) => {
                const values = Array.from(
                  e.target.selectedOptions,
                  (option) => option.value
                );
                handlePreferenceChange('accessibilityNeeds', values);
              }}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="wheelchair">Wheelchair Access</option>
              <option value="hearing">Hearing Impairment</option>
              <option value="visual">Visual Impairment</option>
              <option value="animal">Service Animal</option>
              <option value="cognitive">Cognitive Disability</option>
              <option value="mobility">Mobility Aid</option>
            </select>

            <label
              htmlFor="dietaryNeeds"
              className="block text-sm font-medium text-gray-700 mt-4"
            >
              Dietary Needs:
            </label>
            <select
              id="dietaryNeeds"
              name="dietaryNeeds"
              value={
                formData?.preferences?.dietaryRestrictions?.map(
                  mapBackendToFrontendDietary
                ) || []
              }
              multiple
              onChange={(e) => {
                const values = Array.from(
                  e.target.selectedOptions,
                  (option) => option.value
                );
                handlePreferenceChange('dietaryRestrictions', values);
              }}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="glutenFree">Gluten-Free</option>
              <option value="dairyFree">Dairy Free</option>
              <option value="nut">Nut Allergy</option>
              <option value="shellfish">Shellfish Allergy</option>
              <option value="halal">Halal</option>
              <option value="kosher">Kosher</option>
            </select>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
