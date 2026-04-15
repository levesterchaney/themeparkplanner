import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

// Mock the auth service
jest.mock('@/services/auth', () => ({
  authService: {
    resetPassword: jest.fn(),
  },
}));

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock window.location.search
Object.defineProperty(window, 'location', {
  value: {
    search: '?token=test-reset-token',
  },
  writable: true,
});

import { authService } from '@/services/auth';

const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('ResetPasswordForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset URL search params for each test
    window.location.search = '?token=test-reset-token';
  });

  test('renders reset password form correctly', () => {
    render(<ResetPasswordForm />);

    expect(screen.getByPlaceholderText(/new password/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/confirm password/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /reset password/i })
    ).toBeInTheDocument();
  });

  test('submits form with valid matching passwords', async () => {
    const user = userEvent.setup();
    mockAuthService.resetPassword.mockResolvedValue({
      message: 'Password reset successful',
    });

    render(<ResetPasswordForm />);

    const password = 'NewPassword123';
    await user.type(screen.getByPlaceholderText(/new password/i), password);
    await user.type(screen.getByPlaceholderText(/confirm password/i), password);

    const submitButton = screen.getByRole('button', {
      name: /reset password/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith({
        token: 'test-reset-token',
        newPassword: password,
      });
    });
  });

  test('displays error when passwords do not match', async () => {
    const user = userEvent.setup();

    render(<ResetPasswordForm />);

    await user.type(
      screen.getByPlaceholderText(/new password/i),
      'Password123'
    );
    await user.type(
      screen.getByPlaceholderText(/confirm password/i),
      'DifferentPassword123'
    );

    const submitButton = screen.getByRole('button', {
      name: /reset password/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords must match/i)).toBeInTheDocument();
    });

    expect(mockAuthService.resetPassword).not.toHaveBeenCalled();
  });

  test('displays error for invalid password format', async () => {
    const user = userEvent.setup();

    render(<ResetPasswordForm />);

    const weakPassword = 'weak';
    await user.type(screen.getByPlaceholderText(/new password/i), weakPassword);
    await user.type(
      screen.getByPlaceholderText(/confirm password/i),
      weakPassword
    );

    const submitButton = screen.getByRole('button', {
      name: /reset password/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          /password must be at least 8 characters long and include uppercase letters, lowercase letters, and numbers/i
        )
      ).toBeInTheDocument();
    });

    expect(mockAuthService.resetPassword).not.toHaveBeenCalled();
  });

  test('validates password requirements correctly', async () => {
    const user = userEvent.setup();

    render(<ResetPasswordForm />);

    // Test password without uppercase
    await user.type(
      screen.getByPlaceholderText(/new password/i),
      'password123'
    );
    await user.type(
      screen.getByPlaceholderText(/confirm password/i),
      'password123'
    );

    let submitButton = screen.getByRole('button', { name: /reset password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          /password must be at least 8 characters long and include uppercase letters, lowercase letters, and numbers/i
        )
      ).toBeInTheDocument();
    });

    // Clear the form
    await user.clear(screen.getByPlaceholderText(/new password/i));
    await user.clear(screen.getByPlaceholderText(/confirm password/i));

    // Test password without lowercase
    await user.type(
      screen.getByPlaceholderText(/new password/i),
      'PASSWORD123'
    );
    await user.type(
      screen.getByPlaceholderText(/confirm password/i),
      'PASSWORD123'
    );

    submitButton = screen.getByRole('button', { name: /reset password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          /password must be at least 8 characters long and include uppercase letters, lowercase letters, and numbers/i
        )
      ).toBeInTheDocument();
    });

    expect(mockAuthService.resetPassword).not.toHaveBeenCalled();
  });

  test('displays error on reset password failure', async () => {
    const user = userEvent.setup();
    mockAuthService.resetPassword.mockRejectedValue({
      details: { error: 'Invalid or expired reset token' },
    });

    render(<ResetPasswordForm />);

    const password = 'NewPassword123';
    await user.type(screen.getByPlaceholderText(/new password/i), password);
    await user.type(screen.getByPlaceholderText(/confirm password/i), password);

    const submitButton = screen.getByRole('button', {
      name: /reset password/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/invalid or expired reset token/i)
      ).toBeInTheDocument();
    });
  });

  test('shows loading state during submission', async () => {
    const user = userEvent.setup();
    mockAuthService.resetPassword.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<ResetPasswordForm />);

    const password = 'NewPassword123';
    await user.type(screen.getByPlaceholderText(/new password/i), password);
    await user.type(screen.getByPlaceholderText(/confirm password/i), password);

    const submitButton = screen.getByRole('button', {
      name: /reset password/i,
    });
    await user.click(submitButton);

    expect(screen.getByText(/resetting/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  test('handles generic error message', async () => {
    const user = userEvent.setup();
    mockAuthService.resetPassword.mockRejectedValue(new Error('Network error'));

    render(<ResetPasswordForm />);

    const password = 'NewPassword123';
    await user.type(screen.getByPlaceholderText(/new password/i), password);
    await user.type(screen.getByPlaceholderText(/confirm password/i), password);

    const submitButton = screen.getByRole('button', {
      name: /reset password/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  test('handles error without details', async () => {
    const user = userEvent.setup();
    mockAuthService.resetPassword.mockRejectedValue({});

    render(<ResetPasswordForm />);

    const password = 'NewPassword123';
    await user.type(screen.getByPlaceholderText(/new password/i), password);
    await user.type(screen.getByPlaceholderText(/confirm password/i), password);

    const submitButton = screen.getByRole('button', {
      name: /reset password/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/password reset attempt failed/i)
      ).toBeInTheDocument();
    });
  });

  test('extracts token from URL search params', async () => {
    const user = userEvent.setup();
    window.location.search = '?token=custom-token-123';

    mockAuthService.resetPassword.mockResolvedValue({
      message: 'Password reset successful',
    });

    render(<ResetPasswordForm />);

    const password = 'NewPassword123';
    await user.type(screen.getByPlaceholderText(/new password/i), password);
    await user.type(screen.getByPlaceholderText(/confirm password/i), password);

    const submitButton = screen.getByRole('button', {
      name: /reset password/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith({
        newPassword: password,
        token: 'custom-token-123',
      });
    });
  });

  test('handles missing token in URL', async () => {
    const user = userEvent.setup();
    window.location.search = ''; // No token

    mockAuthService.resetPassword.mockResolvedValue({
      message: 'Password reset successful',
    });

    render(<ResetPasswordForm />);

    const password = 'NewPassword123';
    await user.type(screen.getByPlaceholderText(/new password/i), password);
    await user.type(screen.getByPlaceholderText(/confirm password/i), password);

    const submitButton = screen.getByRole('button', {
      name: /reset password/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith({
        newPassword: 'NewPassword123',
        token: '',
      });
    });
  });

  test('redirects to login on successful reset', async () => {
    const user = userEvent.setup();
    mockAuthService.resetPassword.mockResolvedValue({
      message: 'Password reset successful',
    });

    render(<ResetPasswordForm />);

    const password = 'NewPassword123';
    await user.type(screen.getByPlaceholderText(/new password/i), password);
    await user.type(screen.getByPlaceholderText(/confirm password/i), password);

    const submitButton = screen.getByRole('button', {
      name: /reset password/i,
    });
    await user.click(submitButton);

    // Wait for the setTimeout delay
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      },
      { timeout: 4000 }
    );
  });
});
