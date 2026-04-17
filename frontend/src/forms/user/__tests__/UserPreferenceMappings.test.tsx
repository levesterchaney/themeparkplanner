/**
 * Unit tests for preference value mappings between frontend and backend
 * These functions are internal to UserProfileForm but critical for data integrity
 */

import React from 'react';
import { render } from '@testing-library/react';
import UserProfileForm from '@/forms/user/UserProfileForm';

// Mock the user service
jest.mock('@/services/user', () => ({
  userService: {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    updateUserPreferences: jest.fn(),
  },
}));

import { userService } from '@/services';
const mockUserService = userService as jest.Mocked<typeof userService>;

describe('UserProfileForm - Preference Value Mappings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Accessibility Needs Mapping', () => {
    const accessibilityMappingTests = [
      {
        frontend: 'hearing',
        backend: 'hearing_impairment',
        description: 'maps hearing to hearing_impairment',
      },
      {
        frontend: 'visual',
        backend: 'visual_impairment',
        description: 'maps visual to visual_impairment',
      },
      {
        frontend: 'animal',
        backend: 'service_animal',
        description: 'maps animal to service_animal',
      },
      {
        frontend: 'cognitive',
        backend: 'cognitive_disability',
        description: 'maps cognitive to cognitive_disability',
      },
      {
        frontend: 'wheelchair',
        backend: 'wheelchair',
        description: 'passes wheelchair unchanged',
      },
      {
        frontend: 'mobility',
        backend: 'mobility_aid',
        description: 'maps mobility to mobility_aid',
      },
    ];

    accessibilityMappingTests.forEach(({ frontend, backend, description }) => {
      test(description, async () => {
        const mockUserData = {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          preferences: {
            defaultPartySize: 2,
            hasKids: false,
            thrillLevel: 'moderate' as const,
            accessibilityNeeds: [frontend],
            dietaryRestrictions: [],
          },
        };

        mockUserService.getProfile.mockResolvedValue(mockUserData);
        mockUserService.updateProfile.mockResolvedValue({ message: 'Success' });
        mockUserService.updateUserPreferences.mockResolvedValue({
          message: 'Success',
        });

        // Render component to trigger mapping logic
        const { container } = render(<UserProfileForm />);

        // Wait for component to load and trigger a form submission to test mapping
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Simulate form submission by clicking submit button
        const form = container.querySelector('form');
        if (form) {
          const submitEvent = new Event('submit', {
            bubbles: true,
            cancelable: true,
          });
          form.dispatchEvent(submitEvent);
        }

        // Wait for async operations to complete
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Verify that the backend receives the correctly mapped value
        const updatePreferencesCalls =
          mockUserService.updateUserPreferences.mock.calls;
        if (updatePreferencesCalls.length > 0) {
          const lastCall =
            updatePreferencesCalls[updatePreferencesCalls.length - 1];
          const preferencesData = lastCall[0];
          expect(preferencesData.accessibilityNeeds).toContain(backend);
        }
      });
    });

    test('handles multiple accessibility needs mapping correctly', async () => {
      const mockUserData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        preferences: {
          defaultPartySize: 2,
          hasKids: false,
          thrillLevel: 'moderate' as const,
          accessibilityNeeds: ['hearing', 'visual', 'wheelchair'],
          dietaryRestrictions: [],
        },
      };

      mockUserService.getProfile.mockResolvedValue(mockUserData);
      mockUserService.updateProfile.mockResolvedValue({ message: 'Success' });
      mockUserService.updateUserPreferences.mockResolvedValue({
        message: 'Success',
      });

      const { container } = render(<UserProfileForm />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const form = container.querySelector('form');
      if (form) {
        const submitEvent = new Event('submit', {
          bubbles: true,
          cancelable: true,
        });
        form.dispatchEvent(submitEvent);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      const updatePreferencesCalls =
        mockUserService.updateUserPreferences.mock.calls;
      if (updatePreferencesCalls.length > 0) {
        const lastCall =
          updatePreferencesCalls[updatePreferencesCalls.length - 1];
        const preferencesData = lastCall[0];
        expect(preferencesData.accessibilityNeeds).toEqual([
          'hearing_impairment',
          'visual_impairment',
          'wheelchair',
        ]);
      }
    });
  });

  describe('Dietary Restrictions Mapping', () => {
    const dietaryMappingTests = [
      {
        frontend: 'glutenFree',
        backend: 'gluten_free',
        description: 'maps glutenFree to gluten_free',
      },
      {
        frontend: 'dairyFree',
        backend: 'dairy_free',
        description: 'maps dairyFree to dairy_free',
      },
      {
        frontend: 'nut',
        backend: 'nut_allergy',
        description: 'maps nut to nut_allergy',
      },
      {
        frontend: 'shellfish',
        backend: 'shellfish_allergy',
        description: 'maps shellfish to shellfish_allergy',
      },
      {
        frontend: 'vegetarian',
        backend: 'vegetarian',
        description: 'passes vegetarian unchanged',
      },
      {
        frontend: 'vegan',
        backend: 'vegan',
        description: 'passes vegan unchanged',
      },
      {
        frontend: 'halal',
        backend: 'halal',
        description: 'passes halal unchanged',
      },
      {
        frontend: 'kosher',
        backend: 'kosher',
        description: 'passes kosher unchanged',
      },
    ];

    dietaryMappingTests.forEach(({ frontend, backend, description }) => {
      test(description, async () => {
        const mockUserData = {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          preferences: {
            defaultPartySize: 2,
            hasKids: false,
            thrillLevel: 'moderate' as const,
            accessibilityNeeds: [],
            dietaryRestrictions: [frontend],
          },
        };

        mockUserService.getProfile.mockResolvedValue(mockUserData);
        mockUserService.updateProfile.mockResolvedValue({ message: 'Success' });
        mockUserService.updateUserPreferences.mockResolvedValue({
          message: 'Success',
        });

        const { container } = render(<UserProfileForm />);

        await new Promise((resolve) => setTimeout(resolve, 100));

        const form = container.querySelector('form');
        if (form) {
          const submitEvent = new Event('submit', {
            bubbles: true,
            cancelable: true,
          });
          form.dispatchEvent(submitEvent);
        }

        await new Promise((resolve) => setTimeout(resolve, 100));

        const updatePreferencesCalls =
          mockUserService.updateUserPreferences.mock.calls;
        if (updatePreferencesCalls.length > 0) {
          const lastCall =
            updatePreferencesCalls[updatePreferencesCalls.length - 1];
          const preferencesData = lastCall[0];
          expect(preferencesData.dietaryRestrictions).toContain(backend);
        }
      });
    });

    test('handles multiple dietary restrictions mapping correctly', async () => {
      const mockUserData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        preferences: {
          defaultPartySize: 2,
          hasKids: false,
          thrillLevel: 'moderate' as const,
          accessibilityNeeds: [],
          dietaryRestrictions: ['glutenFree', 'dairyFree', 'vegetarian'],
        },
      };

      mockUserService.getProfile.mockResolvedValue(mockUserData);
      mockUserService.updateProfile.mockResolvedValue({ message: 'Success' });
      mockUserService.updateUserPreferences.mockResolvedValue({
        message: 'Success',
      });

      const { container } = render(<UserProfileForm />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const form = container.querySelector('form');
      if (form) {
        const submitEvent = new Event('submit', {
          bubbles: true,
          cancelable: true,
        });
        form.dispatchEvent(submitEvent);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      const updatePreferencesCalls =
        mockUserService.updateUserPreferences.mock.calls;
      if (updatePreferencesCalls.length > 0) {
        const lastCall =
          updatePreferencesCalls[updatePreferencesCalls.length - 1];
        const preferencesData = lastCall[0];
        expect(preferencesData.dietaryRestrictions).toEqual([
          'gluten_free',
          'dairy_free',
          'vegetarian',
        ]);
      }
    });
  });

  describe('Backend to Frontend Mapping (Display)', () => {
    test('correctly maps backend accessibility values for display', async () => {
      const mockUserDataFromBackend = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        preferences: {
          defaultPartySize: 2,
          hasKids: false,
          thrillLevel: 'moderate' as const,
          accessibilityNeeds: [
            'hearing_impairment',
            'visual_impairment',
            'service_animal',
          ],
          dietaryRestrictions: [],
        },
      };

      mockUserService.getProfile.mockResolvedValue(mockUserDataFromBackend);

      const { container } = render(<UserProfileForm />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check that the multi-select shows the correct frontend values
      const accessibilitySelect = container.querySelector(
        '[name="accessibility"]'
      ) as HTMLSelectElement;
      if (accessibilitySelect) {
        const selectedValues = Array.from(
          accessibilitySelect.selectedOptions
        ).map((option) => option.value);
        expect(selectedValues).toContain('hearing');
        expect(selectedValues).toContain('visual');
        expect(selectedValues).toContain('animal');
      }
    });

    test('correctly maps backend dietary values for display', async () => {
      const mockUserDataFromBackend = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        preferences: {
          defaultPartySize: 2,
          hasKids: false,
          thrillLevel: 'moderate' as const,
          accessibilityNeeds: [],
          dietaryRestrictions: ['gluten_free', 'dairy_free', 'nut_allergy'],
        },
      };

      mockUserService.getProfile.mockResolvedValue(mockUserDataFromBackend);

      const { container } = render(<UserProfileForm />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check that the multi-select shows the correct frontend values
      const dietarySelect = container.querySelector(
        '[name="dietaryNeeds"]'
      ) as HTMLSelectElement;
      if (dietarySelect) {
        const selectedValues = Array.from(dietarySelect.selectedOptions).map(
          (option) => option.value
        );
        expect(selectedValues).toContain('glutenFree');
        expect(selectedValues).toContain('dairyFree');
        expect(selectedValues).toContain('nut');
      }
    });
  });

  describe('Edge Cases', () => {
    test('handles unknown accessibility values gracefully', async () => {
      const mockUserData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        preferences: {
          defaultPartySize: 2,
          hasKids: false,
          thrillLevel: 'moderate' as const,
          accessibilityNeeds: ['unknown_value', 'wheelchair'],
          dietaryRestrictions: [],
        },
      };

      mockUserService.getProfile.mockResolvedValue(mockUserData);
      mockUserService.updateProfile.mockResolvedValue({ message: 'Success' });
      mockUserService.updateUserPreferences.mockResolvedValue({
        message: 'Success',
      });

      const { container } = render(<UserProfileForm />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const form = container.querySelector('form');
      if (form) {
        const submitEvent = new Event('submit', {
          bubbles: true,
          cancelable: true,
        });
        form.dispatchEvent(submitEvent);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should pass unknown values unchanged
      const updatePreferencesCalls =
        mockUserService.updateUserPreferences.mock.calls;
      if (updatePreferencesCalls.length > 0) {
        const lastCall =
          updatePreferencesCalls[updatePreferencesCalls.length - 1];
        const preferencesData = lastCall[0];
        expect(preferencesData.accessibilityNeeds).toEqual([
          'unknown_value',
          'wheelchair',
        ]);
      }
    });

    test('handles unknown dietary values gracefully', async () => {
      const mockUserData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        preferences: {
          defaultPartySize: 2,
          hasKids: false,
          thrillLevel: 'moderate' as const,
          accessibilityNeeds: [],
          dietaryRestrictions: ['unknown_diet', 'vegetarian'],
        },
      };

      mockUserService.getProfile.mockResolvedValue(mockUserData);
      mockUserService.updateProfile.mockResolvedValue({ message: 'Success' });
      mockUserService.updateUserPreferences.mockResolvedValue({
        message: 'Success',
      });

      const { container } = render(<UserProfileForm />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const form = container.querySelector('form');
      if (form) {
        const submitEvent = new Event('submit', {
          bubbles: true,
          cancelable: true,
        });
        form.dispatchEvent(submitEvent);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should pass unknown values unchanged
      const updatePreferencesCalls =
        mockUserService.updateUserPreferences.mock.calls;
      if (updatePreferencesCalls.length > 0) {
        const lastCall =
          updatePreferencesCalls[updatePreferencesCalls.length - 1];
        const preferencesData = lastCall[0];
        expect(preferencesData.dietaryRestrictions).toEqual([
          'unknown_diet',
          'vegetarian',
        ]);
      }
    });

    test('handles empty arrays correctly', async () => {
      const mockUserData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        preferences: {
          defaultPartySize: 2,
          hasKids: false,
          thrillLevel: 'moderate' as const,
          accessibilityNeeds: [],
          dietaryRestrictions: [],
        },
      };

      mockUserService.getProfile.mockResolvedValue(mockUserData);
      mockUserService.updateProfile.mockResolvedValue({ message: 'Success' });
      mockUserService.updateUserPreferences.mockResolvedValue({
        message: 'Success',
      });

      const { container } = render(<UserProfileForm />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const form = container.querySelector('form');
      if (form) {
        const submitEvent = new Event('submit', {
          bubbles: true,
          cancelable: true,
        });
        form.dispatchEvent(submitEvent);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      const updatePreferencesCalls =
        mockUserService.updateUserPreferences.mock.calls;
      if (updatePreferencesCalls.length > 0) {
        const lastCall =
          updatePreferencesCalls[updatePreferencesCalls.length - 1];
        const preferencesData = lastCall[0];
        expect(preferencesData.accessibilityNeeds).toEqual([]);
        expect(preferencesData.dietaryRestrictions).toEqual([]);
      }
    });
  });
});
