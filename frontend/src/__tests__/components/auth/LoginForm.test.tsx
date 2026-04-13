import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '@/components/auth/LoginForm';

// Mock the auth service
jest.mock('@/services/auth', () => ({
  authService: {
    login: jest.fn(),
  },
}));

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

import { authService } from '@/services/auth';

const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('LoginForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form correctly', () => {
    render(<LoginForm />);

    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign in/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /forgot your password/i })
    ).toBeInTheDocument();
  });

  test('submits form with valid credentials', async () => {
    const user = userEvent.setup();
    mockAuthService.login.mockResolvedValue({
      message: 'Login successful',
      user_id: 1,
    });

    render(<LoginForm />);

    await user.type(
      screen.getByPlaceholderText(/email address/i),
      'test@example.com'
    );
    await user.type(screen.getByPlaceholderText(/password/i), 'password123');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
    });

    expect(mockPush).toHaveBeenCalledWith('/');
  });

  test('displays error on login failure', async () => {
    const user = userEvent.setup();
    mockAuthService.login.mockRejectedValue({
      details: { error: 'Invalid credentials' },
    });

    render(<LoginForm />);

    await user.type(
      screen.getByPlaceholderText(/email address/i),
      'wrong@example.com'
    );
    await user.type(screen.getByPlaceholderText(/password/i), 'wrongpass');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  test('shows loading state during submission', async () => {
    const user = userEvent.setup();
    mockAuthService.login.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<LoginForm />);

    await user.type(
      screen.getByPlaceholderText(/email address/i),
      'test@example.com'
    );
    await user.type(screen.getByPlaceholderText(/password/i), 'password123');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    expect(screen.getByText(/logging in/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  test('handles generic error message', async () => {
    const user = userEvent.setup();
    mockAuthService.login.mockRejectedValue(new Error('Network error'));

    render(<LoginForm />);

    await user.type(
      screen.getByPlaceholderText(/email address/i),
      'test@example.com'
    );
    await user.type(screen.getByPlaceholderText(/password/i), 'password123');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  test('handles error without details', async () => {
    const user = userEvent.setup();
    mockAuthService.login.mockRejectedValue({});

    render(<LoginForm />);

    await user.type(
      screen.getByPlaceholderText(/email address/i),
      'test@example.com'
    );
    await user.type(screen.getByPlaceholderText(/password/i), 'password123');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/login attempt failed/i)).toBeInTheDocument();
    });
  });
});
