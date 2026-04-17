import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import LogoutPage from '@/app/logout/page';
import { authService } from '@/services';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock auth service
jest.mock('@/services/auth', () => ({
  authService: {
    logout: jest.fn(),
  },
}));

const mockUseRouter = useRouter as jest.Mock;
const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('LogoutPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
    });
  });

  it('renders logout message and spinner', () => {
    render(<LogoutPage />);

    expect(screen.getByText('Logging you out...')).toBeInTheDocument();

    // Check for spinner by looking for the div with spinner classes
    const spinner = screen
      .getByText('Logging you out...')
      .parentElement?.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass(
      'animate-spin',
      'rounded-full',
      'h-8',
      'w-8',
      'border-b-2',
      'border-indigo-600',
      'mx-auto'
    );
  });

  it('calls authService.logout on mount', async () => {
    mockAuthService.logout.mockResolvedValue(undefined);

    render(<LogoutPage />);

    await waitFor(() => {
      expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
    });
  });

  it('redirects to login page on successful logout', async () => {
    mockAuthService.logout.mockResolvedValue(undefined);

    render(<LogoutPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('redirects to home page on logout failure', async () => {
    mockAuthService.logout.mockRejectedValue(new Error('Logout failed'));

    render(<LogoutPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('has correct CSS structure and classes', () => {
    const { container } = render(<LogoutPage />);

    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass(
      'min-h-screen',
      'flex',
      'items-center',
      'justify-center',
      'bg-gradient-to-br',
      'from-blue-50',
      'to-indigo-100'
    );
  });

  it('renders heading with correct styling', () => {
    render(<LogoutPage />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveClass(
      'text-2xl',
      'font-bold',
      'text-gray-900',
      'dark:text-white',
      'mb-4'
    );
    expect(heading).toHaveTextContent('Logging you out...');
  });

  it('only calls logout once even with multiple re-renders', async () => {
    mockAuthService.logout.mockResolvedValue(undefined);

    const { rerender } = render(<LogoutPage />);

    // Re-render the component
    rerender(<LogoutPage />);

    await waitFor(() => {
      expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
    });
  });

  it('handles network errors gracefully', async () => {
    const networkError = new Error('Network error');
    mockAuthService.logout.mockRejectedValue(networkError);

    render(<LogoutPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    // Should not throw unhandled error
    expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
  });
});
