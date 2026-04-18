'use client';

import { useEffect, useState } from 'react';
import { userService } from '@/services';
import { UserPreferenceRequestData } from '@/types/api';
import {
  Button,
  Card,
  Checkbox,
  Dropdown,
  Textbox,
  Numberbox,
} from '@/components';

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

const thrillLevelOptions = [
  { label: 'Low - Gentle rides and shows', value: 'low' },
  { label: 'Medium - Mix of everything', value: 'moderate' },
  { label: 'High - Thrill rides and coasters', value: 'high' },
  { label: 'Extreme - Only the most intense rides', value: 'extreme' },
];

const accessibilityOptions = [
  { label: 'Wheelchair', value: 'wheelchair' },
  { label: 'Hearing Impairment', value: 'hearing_impairment' },
  { label: 'Visual Impairment', value: 'visual_impairment' },
  { label: 'Service Animal', value: 'service_animal' },
  { label: 'Cognitive Disability', value: 'cognitive_disability' },
  { label: 'Mobility Aid', value: 'mobility_aid' },
];

const dietaryRestrictionOptions = [
  { label: 'Vegetarian', value: 'vegetarian' },
  { label: 'Vegan', value: 'vegan' },
  { label: 'Gluten-Free', value: 'gluten_free' },
  { label: 'Dairy-Free', value: 'dairy_free' },
  { label: 'Nut Allergy', value: 'nut_allergy' },
  { label: 'Shellfish Allergy', value: 'shellfish_allergy' },
  { label: 'Halal', value: 'halal' },
  { label: 'Kosher', value: 'kosher' },
];

export default function UserProfileForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUserData] = useState<UserProfileResponseData | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response =
          (await userService.getProfile()) as UserProfileResponseData;
        setUserData(response);
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
    setUserData((prev) =>
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
    setUserData((prev) =>
      prev
        ? {
            ...prev,
            preferences: prev.preferences
              ? {
                  ...prev.preferences,
                  [field]: value,
                }
              : {
                  [field]: value,
                },
          }
        : null
    );
  };

  const handleBooleanPreferenceChange = (
    field: string,
    value: string | boolean,
    isChecked: boolean
  ) => {
    handlePreferenceChange(field, isChecked);
  };

  const handleArrayPreferenceChange = (
    field: string,
    value: string | boolean,
    isChecked: boolean
  ) => {
    setUserData((prev) => {
      if (!prev) return null;
      const currentArray =
        (prev.preferences?.[
          field as keyof typeof prev.preferences
        ] as string[]) || [];
      const newArray = isChecked
        ? [...currentArray, value as string]
        : currentArray.filter((item) => item !== value);

      return {
        ...prev,
        preferences: prev.preferences
          ? {
              ...prev.preferences,
              [field]: newArray,
            }
          : {
              [field]: newArray,
            },
      };
    });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Update user details
      await userService.updateProfile({
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatar || '',
      });

      // Refresh user data
      const updatedResponse =
        (await userService.getProfile()) as UserProfileResponseData;
      setUserData(updatedResponse);
      alert('User profile updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Update preferences if they exist
      if (user.preferences) {
        const preferencesToUpdate: UserPreferenceRequestData = {};

        if (user.preferences.defaultPartySize !== undefined) {
          preferencesToUpdate.defaultPartySize =
            user.preferences.defaultPartySize;
        }
        if (user.preferences.hasKids !== undefined) {
          preferencesToUpdate.hasKids = user.preferences.hasKids;
        }
        if (user.preferences.thrillLevel !== undefined) {
          preferencesToUpdate.thrillLevel = user.preferences.thrillLevel;
        }
        if (user.preferences.accessibilityNeeds !== undefined) {
          preferencesToUpdate.accessibilityNeeds =
            user.preferences.accessibilityNeeds;
        }
        if (user.preferences.dietaryRestrictions !== undefined) {
          preferencesToUpdate.dietaryRestrictions =
            user.preferences.dietaryRestrictions;
        }

        // Only send the update if we have preferences to update
        if (Object.keys(preferencesToUpdate).length > 0) {
          await userService.updateUserPreferences(preferencesToUpdate);
        }
      }

      // Refresh user data
      const updatedResponse =
        (await userService.getProfile()) as UserProfileResponseData;
      setUserData(updatedResponse);
      alert('User profile updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      {loading && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto" />
          <p className="mt-4 text-lg text-gray-600">Loading profile...</p>
        </div>
      )}

      {error && (
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          {/* Profile Information */}
          <Card
            title={'Profile Information'}
            description={'Your personal details'}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textbox
                label="First Name"
                id="firstName"
                value={user?.firstName || ''}
                handleChange={handleInputChange}
                isRequired={true}
              />
              <Textbox
                label="Last Name"
                id="lastName"
                value={user?.lastName || ''}
                handleChange={handleInputChange}
                isRequired={true}
              />
            </div>
            <div>
              <Textbox
                label="Email"
                id="email"
                value={user?.email || ''}
                handleChange={handleInputChange}
                isDisabled={true}
              />
            </div>
            {/* Should we allow password change here as well? */}

            {/* Save Button */}
            <div className="pt-4">
              <div className="pt-4 border-t flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  onClick={handleProfileSubmit}
                >
                  Save Profile
                </Button>
              </div>
            </div>
          </Card>

          {/* Trip Preferences */}
          <Card
            title={'Default Trip Preferences'}
            description={
              'These settings will be used as defaults when planning new trips'
            }
          >
            {/* Party Size */}
            <div className="space-y-2">
              <Numberbox
                label="Party Size"
                id="defaultPartySize"
                value={user?.preferences?.defaultPartySize || 1}
                handleChange={handlePreferenceChange}
                isRequired={true}
              />
              <p className="text-sm text-gray-500">
                Number of people in your party
              </p>
            </div>

            {/* Kids */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasKids"
                  label="Traveling with children"
                  value={user?.preferences?.hasKids || false}
                  isChecked={user?.preferences?.hasKids || false}
                  handleChange={handleBooleanPreferenceChange}
                />
              </div>
              {/* Would be great to capture kids ages here in a future release */}
            </div>

            {/* Thrill Level */}
            <div className="space-y-2">
              <Dropdown
                id="thrillLevel"
                label="Preferred Thrill Level"
                current={user?.preferences?.thrillLevel || ''}
                options={thrillLevelOptions}
                handleChange={handlePreferenceChange}
              />
            </div>

            {/* Accessibility */}
            <div className="space-y-3">
              <p>Accessibility Needs</p>
              <div className="space-y-2">
                {accessibilityOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`access-${option.value}`}
                      label={option.label}
                      field="accessibilityNeeds"
                      value={option.value}
                      isChecked={
                        user?.preferences?.accessibilityNeeds?.includes(
                          option.value
                        ) || false
                      }
                      handleChange={handleArrayPreferenceChange}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div className="space-y-3">
              <p>Dietary Restrictions</p>
              <div className="space-y-2">
                {dietaryRestrictionOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`diet-${option.value}`}
                      label={option.label}
                      field="dietaryRestrictions"
                      value={option.value}
                      isChecked={
                        user?.preferences?.dietaryRestrictions?.includes(
                          option.value
                        ) || false
                      }
                      handleChange={handleArrayPreferenceChange}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <div className="pt-4 border-t flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  onClick={handlePreferenceSubmit}
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
