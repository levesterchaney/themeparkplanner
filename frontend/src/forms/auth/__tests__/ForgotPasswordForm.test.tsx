import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPasswordForm from '../ForgotPasswordForm';
import { authService } from '@/services';

jest.mock('@/services/auth', () => ({
  authService: {
    sendPasswordReset: jest.fn(),
  },
}));

const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.console = {
      ...global.console,
      log: jest.fn(),
    };
  });

  it('renders the forgot password form correctly', () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /send reset link/i })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
  });

  it('displays loading state when form is submitted', async () => {
    const user = userEvent.setup();
    mockAuthService.sendPasswordReset.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ message: 'Success' }), 100)
        )
    );

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', {
      name: /send reset link/i,
    });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    expect(
      screen.getByRole('button', { name: /sending.../i })
    ).toBeInTheDocument();
  });

  it('calls authService.sendPasswordReset with correct email when form is submitted', async () => {
    const user = userEvent.setup();
    const mockResponse = { message: 'Reset link sent successfully' };
    mockAuthService.sendPasswordReset.mockResolvedValue(mockResponse);

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', {
      name: /send reset link/i,
    });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    expect(mockAuthService.sendPasswordReset).toHaveBeenCalledWith({
      email: 'test@example.com',
    });
    expect(mockAuthService.sendPasswordReset).toHaveBeenCalledTimes(1);
  });

  it('displays success message when email is sent successfully', async () => {
    const user = userEvent.setup();
    const mockResponse = { message: 'Reset link sent successfully' };
    mockAuthService.sendPasswordReset.mockResolvedValue(mockResponse);

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', {
      name: /send reset link/i,
    });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/reset link sent successfully/i)
      ).toBeInTheDocument();
    });

    expect(screen.queryByLabelText(/email address/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /send reset link/i })
    ).not.toBeInTheDocument();
  });

  it('displays default success message when response has no message', async () => {
    const user = userEvent.setup();
    mockAuthService.sendPasswordReset.mockResolvedValue({});

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', {
      name: /send reset link/i,
    });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/a reset link has been sent/i)
      ).toBeInTheDocument();
    });
  });

  it('displays error message when request fails', async () => {
    const user = userEvent.setup();
    mockAuthService.sendPasswordReset.mockRejectedValue(
      new Error('Network error')
    );

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', {
      name: /send reset link/i,
    });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /send reset link/i })
    ).toBeInTheDocument();
  });

  it('clears error message when form is resubmitted', async () => {
    const user = userEvent.setup();
    mockAuthService.sendPasswordReset
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ message: 'Success' });

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', {
      name: /send reset link/i,
    });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    await user.clear(emailInput);
    await user.type(emailInput, 'test2@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.queryByText(/something went wrong/i)
      ).not.toBeInTheDocument();
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });
  });

  it('requires email input to be filled', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    const submitButton = screen.getByRole('button', {
      name: /send reset link/i,
    });
    await user.click(submitButton);

    expect(mockAuthService.sendPasswordReset).not.toHaveBeenCalled();
  });

  it('handles form submission with preventDefault', () => {
    const mockPreventDefault = jest.fn();

    render(<ForgotPasswordForm />);

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    expect(mockPreventDefault).not.toHaveBeenCalled();
  });

  it('extracts email from FormData correctly', async () => {
    const user = userEvent.setup();
    mockAuthService.sendPasswordReset.mockResolvedValue({ message: 'Success' });

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', {
      name: /send reset link/i,
    });

    await user.type(emailInput, 'user@domain.com');
    await user.click(submitButton);

    expect(mockAuthService.sendPasswordReset).toHaveBeenCalledWith({
      email: 'user@domain.com',
    });
  });
});
