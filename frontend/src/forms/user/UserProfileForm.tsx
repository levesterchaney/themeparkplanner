'use client';

import { useEffect, useState } from 'react';
import { userService } from '@/services';
import { UserPreferenceRequestData } from '@/types/api';
import { Card, Input } from '@/components';

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
              <Input
                label="First Name"
                id="firstName"
                type="text"
                value={user?.firstName || ''}
                handleChange={handleInputChange}
                isRequired={true}
              />
              <Input
                label="Last Name"
                id="lastName"
                type="text"
                value={user?.lastName || ''}
                handleChange={handleInputChange}
                isRequired={true}
              />
            </div>
            <div>
              <Input
                label="Email"
                id="email"
                type="email"
                value={user?.email || ''}
                handleChange={handleInputChange}
                isDisabled={true}
              />
            </div>
            {/* Should we allow password change here as well? */}

            {/* Save Button */}
            <div className="pt-4">
              <div className="pt-4 border-t">
                <button
                  type="submit"
                  className="w-full md:w-auto flex-auto content-end"
                  onClick={handleProfileSubmit}
                >
                  Save Profile
                </button>
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
              <label htmlFor="partySize">Party Size</label>
              <input
                id="partySize"
                name="partySize"
                type="number"
                min="1"
                max="20"
                value={user?.preferences?.defaultPartySize}
                onChange={(e) =>
                  handlePreferenceChange(
                    'defaultPartySize',
                    parseInt(e.target.value) || 1
                  )
                }
                required
              />
              <p className="text-sm text-gray-500">
                Number of people in your party
              </p>
            </div>

            {/* Kids */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  id="hasKids"
                  name="hasKids"
                  type="checkbox"
                  checked={user?.preferences?.hasKids}
                  onChange={(e) =>
                    handlePreferenceChange('hasKids', e.target.checked)
                  }
                />
                <label htmlFor="hasKids" className="cursor-pointer">
                  Traveling with children
                </label>
              </div>
              {/* Would be great to capture kids ages here in a future release */}
            </div>

            {/* Thrill Level */}
            <div className="space-y-2">
              <label htmlFor="thrillLevel">Preferred Thrill Level</label>
              <select
                id="thrillLevel"
                name="thrillLevel"
                value={user?.preferences?.thrillLevel}
                onChange={(e) =>
                  handlePreferenceChange('thrillLevel', e.target.value)
                }
              >
                <option value="low">Low - Gentle rides and shows</option>
                <option value="moderate">Medium - Mix of everything</option>
                <option value="high">High - Thrill rides and coasters</option>
                <option value="extreme">
                  Extreme - Only the most intense rides
                </option>
              </select>
            </div>

            {/* Accessibility */}
            <div className="space-y-3">
              <label>Accessibility Needs</label>
              <div className="space-y-2">
                {accessibilityOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <input
                      id={`access-${option.value}`}
                      type="checkbox"
                      checked={user?.preferences?.accessibilityNeeds?.includes(
                        option.value
                      )}
                      onChange={(e) =>
                        handlePreferenceChange(
                          'accessibilityNeeds',
                          e.target.checked
                            ? [
                                ...(user?.preferences?.accessibilityNeeds ||
                                  []),
                                option.value,
                              ]
                            : user?.preferences?.accessibilityNeeds?.filter(
                                (need) => need !== option.value
                              ) || []
                        )
                      }
                    />
                    <label
                      htmlFor={`access-${option.value}`}
                      className="cursor-pointer font-normal"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div className="space-y-3">
              <label>Dietary Restrictions</label>
              <div className="space-y-2">
                {dietaryRestrictionOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <input
                      id={`diet-${option.value}`}
                      type="checkbox"
                      checked={user?.preferences?.dietaryRestrictions?.includes(
                        option.value
                      )}
                      onChange={(e) =>
                        handlePreferenceChange(
                          'dietaryRestrictions',
                          e.target.checked
                            ? [
                                ...(user?.preferences?.dietaryRestrictions ||
                                  []),
                                option.value,
                              ]
                            : user?.preferences?.dietaryRestrictions?.filter(
                                (r) => r !== option.value
                              ) || []
                        )
                      }
                    />
                    <label
                      htmlFor={`diet-${option.value}`}
                      className="cursor-pointer font-normal"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t">
              <button
                type="submit"
                className="w-full md:w-auto"
                onClick={handlePreferenceSubmit}
              >
                Save Preferences
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
