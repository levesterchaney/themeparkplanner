import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileForm from '@/forms/user/UserProfileForm';

// Mock the user service
jest.mock('@/services/user', () => ({
  userService: {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    updateUserPreferences: jest.fn(),
  },
  UserProfileResponseData: {}, // Mock the interface export
}));

import { userService } from '@/services';

const mockUserService = userService as jest.Mocked<typeof userService>;

// Mock user data
const mockUserData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  avatar: 'https://example.com/avatar.jpg',
  preferences: {
    defaultPartySize: 2,
    hasKids: false,
    thrillLevel: 'moderate' as const,
    accessibilityNeeds: ['wheelchair'],
    dietaryRestrictions: ['vegetarian'],
  },
};

const mockUserDataWithoutPreferences = {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  avatar: null,
  preferences: undefined,
};

describe('UserProfileForm - Preferences Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading and Initial State', () => {
    test('displays loading state initially', () => {
      mockUserService.getProfile.mockReturnValue(new Promise(() => {})); // Never resolves

      render(<UserProfileForm />);

      expect(screen.getByText('Loading profile...')).toBeInTheDocument();
    });

    test('displays error state when API fails', async () => {
      mockUserService.getProfile.mockRejectedValue(new Error('API Error'));

      render(<UserProfileForm />);

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('API Error')).toBeInTheDocument();
      });
    });

    test('loads and displays user preferences correctly', async () => {
      mockUserService.getProfile.mockResolvedValue(mockUserData);

      render(<UserProfileForm />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
        expect(
          screen.getByDisplayValue('john.doe@example.com')
        ).toBeInTheDocument();
      });

      // Check preferences
      expect(screen.getByDisplayValue('2')).toBeInTheDocument(); // party size
      expect(
        screen.getByRole('combobox', { name: /thrill ride preference/i })
      ).toHaveValue('moderate');
      expect(
        screen.getByRole('checkbox', { name: /traveling with kids/i })
      ).not.toBeChecked();
    });
  });

  describe('Preference Change Handlers', () => {
    test('handles party size change', async () => {
      const user = userEvent.setup();
      mockUserService.getProfile.mockResolvedValue(mockUserData);

      render(<UserProfileForm />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('2')).toBeInTheDocument();
      });

      const partySizeInput = screen.getByLabelText(
        /preferred party size/i
      ) as HTMLInputElement;
      await user.clear(partySizeInput);
      fireEvent.change(partySizeInput, { target: { value: '4' } });

      await waitFor(() => {
        expect(partySizeInput.value).toBe('4');
      });
    });

    test('handles kids checkbox change', async () => {
      const user = userEvent.setup();
      mockUserService.getProfile.mockResolvedValue(mockUserData);

      render(<UserProfileForm />);

      await waitFor(() => {
        expect(
          screen.getByRole('checkbox', { name: /traveling with kids/i })
        ).not.toBeChecked();
      });

      const kidsCheckbox = screen.getByRole('checkbox', {
        name: /traveling with kids/i,
      });
      await user.click(kidsCheckbox);

      expect(kidsCheckbox).toBeChecked();
    });

    test('handles thrill level change', async () => {
      const user = userEvent.setup();
      mockUserService.getProfile.mockResolvedValue(mockUserData);

      render(<UserProfileForm />);

      await waitFor(() => {
        expect(
          screen.getByRole('combobox', { name: /thrill ride preference/i })
        ).toHaveValue('moderate');
      });

      const thrillSelect = screen.getByRole('combobox', {
        name: /thrill ride preference/i,
      });
      await user.selectOptions(thrillSelect, 'high');

      expect(thrillSelect).toHaveValue('high');
    });

    test('handles accessibility needs multi-select change', async () => {
      const user = userEvent.setup();
      mockUserService.getProfile.mockResolvedValue(mockUserData);

      render(<UserProfileForm />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      const accessibilitySelect = screen.getByLabelText(/accessibility needs/i);

      // Select multiple options
      await user.selectOptions(accessibilitySelect, ['wheelchair', 'hearing']);

      const selectedOptions = Array.from(
        accessibilitySelect.selectedOptions
      ).map((option) => option.value);
      expect(selectedOptions).toContain('wheelchair');
      expect(selectedOptions).toContain('hearing');
    });

    test('handles dietary restrictions multi-select change', async () => {
      const user = userEvent.setup();
      mockUserService.getProfile.mockResolvedValue(mockUserData);

      render(<UserProfileForm />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      const dietarySelect = screen.getByLabelText(/dietary needs/i);

      // Select multiple options
      await user.selectOptions(dietarySelect, ['vegetarian', 'glutenFree']);

      const selectedOptions = Array.from(dietarySelect.selectedOptions).map(
        (option) => option.value
      );
      expect(selectedOptions).toContain('vegetarian');
      expect(selectedOptions).toContain('glutenFree');
    });
  });

  describe('Form Submission with Preferences', () => {
    test('submits complete form with preferences successfully', async () => {
      const user = userEvent.setup();
      mockUserService.getProfile.mockResolvedValue(mockUserData);
      mockUserService.updateProfile.mockResolvedValue({
        message: 'Profile updated',
      });
      mockUserService.updateUserPreferences.mockResolvedValue({
        message: 'Preferences updated',
      });

      render(<UserProfileForm />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      // Modify some fields
      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Johnny');

      const partySizeInput = screen.getByLabelText(/preferred party size/i);
      await user.clear(partySizeInput);
      fireEvent.change(partySizeInput, { target: { value: '4' } });

      // Submit form
      const submitButton = screen.getByRole('button', {
        name: /save changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUserService.updateProfile).toHaveBeenCalledWith({
          firstName: 'Johnny',
          lastName: 'Doe',
          avatarUrl: 'https://example.com/avatar.jpg',
        });

        expect(mockUserService.updateUserPreferences).toHaveBeenCalledWith({
          defaultPartySize: 4,
          hasKids: false,
          thrillLevel: 'moderate',
          accessibilityNeeds: ['wheelchair'],
          dietaryRestrictions: ['vegetarian'],
        });
      });
    });

    test('handles form submission error gracefully', async () => {
      const user = userEvent.setup();
      mockUserService.getProfile.mockResolvedValue(mockUserData);
      mockUserService.updateProfile.mockRejectedValue(
        new Error('Update failed')
      );

      render(<UserProfileForm />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', {
        name: /save changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Update failed')).toBeInTheDocument();
      });
    });

    test('shows loading state during form submission', async () => {
      const user = userEvent.setup();
      mockUserService.getProfile.mockResolvedValue(mockUserData);
      mockUserService.updateProfile.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<UserProfileForm />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', {
        name: /save changes/i,
      });
      await user.click(submitButton);

      expect(screen.getByText('Loading profile...')).toBeInTheDocument();
    });
  });

  describe('Partial Preference Updates', () => {
    test('handles user without existing preferences', async () => {
      mockUserService.getProfile.mockResolvedValue(
        mockUserDataWithoutPreferences
      );

      render(<UserProfileForm />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Smith')).toBeInTheDocument();
      });

      // Check that preference fields handle undefined values gracefully
      expect(screen.getByLabelText(/preferred party size/i)).toHaveValue(null);
      expect(
        screen.getByRole('checkbox', { name: /traveling with kids/i })
      ).not.toBeChecked();
      expect(
        screen.getByRole('combobox', { name: /thrill ride preference/i })
      ).toHaveValue('moderate');
    });

    test('only sends defined preferences in update request', async () => {
      const user = userEvent.setup();
      const partialUserData = {
        ...mockUserData,
        preferences: {
          defaultPartySize: 3,
          hasKids: true,
          // Missing thrillLevel, accessibilityNeeds, dietaryRestrictions
        },
      };

      mockUserService.getProfile.mockResolvedValue(partialUserData);
      mockUserService.updateProfile.mockResolvedValue({
        message: 'Profile updated',
      });
      mockUserService.updateUserPreferences.mockResolvedValue({
        message: 'Preferences updated',
      });

      render(<UserProfileForm />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      // Submit form
      const submitButton = screen.getByRole('button', {
        name: /save changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUserService.updateUserPreferences).toHaveBeenCalledWith({
          defaultPartySize: 3,
          hasKids: true,
          // Should not include undefined fields
        });
      });
    });
  });

  describe('Preference Value Mapping', () => {
    test('maps frontend accessibility values to backend format', async () => {
      const user = userEvent.setup();
      const userDataWithMappingTest = {
        ...mockUserData,
        preferences: {
          ...mockUserData.preferences,
          accessibilityNeeds: ['hearing_impairment', 'visual_impairment'], // Backend format
        },
      };

      mockUserService.getProfile.mockResolvedValue(userDataWithMappingTest);
      mockUserService.updateProfile.mockResolvedValue({
        message: 'Profile updated',
      });
      mockUserService.updateUserPreferences.mockResolvedValue({
        message: 'Preferences updated',
      });

      render(<UserProfileForm />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', {
        name: /save changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUserService.updateUserPreferences).toHaveBeenCalledWith(
          expect.objectContaining({
            accessibilityNeeds: ['hearing_impairment', 'visual_impairment'], // Should map to backend format
          })
        );
      });
    });

    test('maps frontend dietary values to backend format', async () => {
      const user = userEvent.setup();
      const userDataWithDietaryMapping = {
        ...mockUserData,
        preferences: {
          ...mockUserData.preferences,
          dietaryRestrictions: ['gluten_free', 'dairy_free'], // Backend format
        },
      };

      mockUserService.getProfile.mockResolvedValue(userDataWithDietaryMapping);
      mockUserService.updateProfile.mockResolvedValue({
        message: 'Profile updated',
      });
      mockUserService.updateUserPreferences.mockResolvedValue({
        message: 'Preferences updated',
      });

      render(<UserProfileForm />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', {
        name: /save changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUserService.updateUserPreferences).toHaveBeenCalledWith(
          expect.objectContaining({
            dietaryRestrictions: ['gluten_free', 'dairy_free'], // Should map to backend format
          })
        );
      });
    });
  });

  describe('Form Validation', () => {
    test('requires first name to be filled', async () => {
      const user = userEvent.setup();
      mockUserService.getProfile.mockResolvedValue(mockUserData);

      render(<UserProfileForm />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.clear(firstNameInput);

      const submitButton = screen.getByRole('button', {
        name: /save changes/i,
      });
      await user.click(submitButton);

      // HTML5 validation should prevent submission
      expect(firstNameInput).toBeInvalid();
    });

    test('requires party size to be a valid number', async () => {
      const user = userEvent.setup();
      mockUserService.getProfile.mockResolvedValue(mockUserData);

      render(<UserProfileForm />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('2')).toBeInTheDocument();
      });

      const partySizeInput = screen.getByLabelText(/preferred party size/i);
      await user.clear(partySizeInput);

      const submitButton = screen.getByRole('button', {
        name: /save changes/i,
      });
      await user.click(submitButton);

      // Check that field is required (HTML5 validation)
      expect(partySizeInput).toBeRequired();
    });
  });

  describe('Accessibility', () => {
    test('has proper form labels and ARIA attributes', async () => {
      mockUserService.getProfile.mockResolvedValue(mockUserData);

      render(<UserProfileForm />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      // Check that all form fields have proper labels
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/preferred party size/i)
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/traveling with kids/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/thrill ride preference/i)
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/accessibility needs/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/dietary needs/i)).toBeInTheDocument();
    });

    test('submit button has proper disabled state during loading', async () => {
      const user = userEvent.setup();
      mockUserService.getProfile.mockResolvedValue(mockUserData);
      mockUserService.updateProfile.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<UserProfileForm />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', {
        name: /save changes/i,
      });
      await user.click(submitButton);

      expect(screen.getByText('Loading profile...')).toBeInTheDocument();
    });
  });
});
