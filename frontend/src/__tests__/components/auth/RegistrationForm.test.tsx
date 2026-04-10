import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegistrationForm from '@/components/auth/RegistrationForm';

// Mock the auth service
jest.mock('@/services/auth', () => ({
  authService: {
    register: jest.fn(),
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

describe('RegistrationForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders registration form correctly', () => {
    render(<RegistrationForm />);

    expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/last name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /register/i })
    ).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm />);

    const submitButton = screen.getByRole('button', { name: /register/i });
    await user.click(submitButton);

    expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
  });

  test('validates password strength', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm />);

    await user.type(screen.getByPlaceholderText(/first name/i), 'John');
    await user.type(
      screen.getByPlaceholderText(/email address/i),
      'john@example.com'
    );
    await user.type(screen.getByPlaceholderText(/password/i), 'weak');

    const submitButton = screen.getByRole('button', { name: /register/i });
    await user.click(submitButton);

    expect(
      screen.getByText(/password must be at least 8 characters/i)
    ).toBeInTheDocument();
  });

  test('submits form with valid data', async () => {
    const user = userEvent.setup();
    mockAuthService.register.mockResolvedValue({});

    render(<RegistrationForm />);

    await user.type(screen.getByPlaceholderText(/first name/i), 'John');
    await user.type(screen.getByPlaceholderText(/last name/i), 'Doe');
    await user.type(
      screen.getByPlaceholderText(/email address/i),
      'john@example.com'
    );
    await user.type(
      screen.getByPlaceholderText(/password/i),
      'StrongPassword123'
    );

    const submitButton = screen.getByRole('button', { name: /register/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAuthService.register).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'StrongPassword123',
      });
    });

    expect(mockPush).toHaveBeenCalledWith('/');
  });

  test('displays error on registration failure', async () => {
    const user = userEvent.setup();
    mockAuthService.register.mockRejectedValue({
      details: { error: 'Email already exists' },
    });

    render(<RegistrationForm />);

    await user.type(screen.getByPlaceholderText(/first name/i), 'John');
    await user.type(
      screen.getByPlaceholderText(/email address/i),
      'john@example.com'
    );
    await user.type(
      screen.getByPlaceholderText(/password/i),
      'StrongPassword123'
    );

    const submitButton = screen.getByRole('button', { name: /register/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });
  });

  test('shows loading state during submission', async () => {
    const user = userEvent.setup();
    mockAuthService.register.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<RegistrationForm />);

    await user.type(screen.getByPlaceholderText(/first name/i), 'John');
    await user.type(
      screen.getByPlaceholderText(/email address/i),
      'john@example.com'
    );
    await user.type(
      screen.getByPlaceholderText(/password/i),
      'StrongPassword123'
    );

    const submitButton = screen.getByRole('button', { name: /register/i });
    await user.click(submitButton);

    expect(screen.getByText(/creating account/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });
});
