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

  test('validates first name is required', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm />);

    const submitButton = screen.getByRole('button', { name: /register/i });
    await user.click(submitButton);

    expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
  });

  test('validates email is required', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm />);

    await user.type(screen.getByPlaceholderText(/first name/i), 'John');

    const submitButton = screen.getByRole('button', { name: /register/i });
    await user.click(submitButton);

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });

  test('validates password is required', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm />);

    await user.type(screen.getByPlaceholderText(/first name/i), 'John');
    await user.type(
      screen.getByPlaceholderText(/email address/i),
      'john@example.com'
    );

    const submitButton = screen.getByRole('button', { name: /register/i });
    await user.click(submitButton);

    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  test('validates password strength - too short', async () => {
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

  test('validates password strength - missing uppercase', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm />);

    await user.type(screen.getByPlaceholderText(/first name/i), 'John');
    await user.type(
      screen.getByPlaceholderText(/email address/i),
      'john@example.com'
    );
    await user.type(
      screen.getByPlaceholderText(/password/i),
      'weakpassword123'
    );

    const submitButton = screen.getByRole('button', { name: /register/i });
    await user.click(submitButton);

    expect(
      screen.getByText(/password must be at least 8 characters/i)
    ).toBeInTheDocument();
  });

  test('validates password strength - missing lowercase', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm />);

    await user.type(screen.getByPlaceholderText(/first name/i), 'John');
    await user.type(
      screen.getByPlaceholderText(/email address/i),
      'john@example.com'
    );
    await user.type(
      screen.getByPlaceholderText(/password/i),
      'WEAKPASSWORD123'
    );

    const submitButton = screen.getByRole('button', { name: /register/i });
    await user.click(submitButton);

    expect(
      screen.getByText(/password must be at least 8 characters/i)
    ).toBeInTheDocument();
  });

  test('validates password strength - missing numbers', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm />);

    await user.type(screen.getByPlaceholderText(/first name/i), 'John');
    await user.type(
      screen.getByPlaceholderText(/email address/i),
      'john@example.com'
    );
    await user.type(screen.getByPlaceholderText(/password/i), 'WeakPassword');

    const submitButton = screen.getByRole('button', { name: /register/i });
    await user.click(submitButton);

    expect(
      screen.getByText(/password must be at least 8 characters/i)
    ).toBeInTheDocument();
  });

  test('submits form with valid data including last name', async () => {
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

  test('submits form with valid data without last name', async () => {
    const user = userEvent.setup();
    mockAuthService.register.mockResolvedValue({});

    render(<RegistrationForm />);

    await user.type(screen.getByPlaceholderText(/first name/i), 'John');
    // Skip last name field
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
        lastName: undefined,
        email: 'john@example.com',
        password: 'StrongPassword123',
      });
    });

    expect(mockPush).toHaveBeenCalledWith('/');
  });

  test('displays error on registration failure with details.error', async () => {
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

  test('displays error on registration failure with message property', async () => {
    const user = userEvent.setup();
    mockAuthService.register.mockRejectedValue({
      message: 'Server error occurred',
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
      expect(screen.getByText(/server error occurred/i)).toBeInTheDocument();
    });
  });

  test('displays error message from Error object', async () => {
    const user = userEvent.setup();
    mockAuthService.register.mockRejectedValue(new Error('Network failed'));

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
      expect(screen.getByText(/network failed/i)).toBeInTheDocument();
    });
  });

  test('displays generic error message when error has no details or message', async () => {
    const user = userEvent.setup();
    // Create an error object that has neither details.error nor message
    mockAuthService.register.mockRejectedValue({ someOtherProperty: 'value' });

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
      expect(
        screen.getByText(/registration attempt failed/i)
      ).toBeInTheDocument();
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
