import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ForgotPasswordPage from '@/app/forgot-password/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock auth service
jest.mock('@/services/auth', () => ({
  authService: {
    sendPasswordReset: jest.fn(),
    logout: jest.fn(),
  },
}));

// Mock the ForgotPasswordForm component
jest.mock('@/components/auth/ForgotPasswordForm', () => {
  return function MockedForgotPasswordForm() {
    return (
      <div data-testid="forgot-password-form">Mocked ForgotPasswordForm</div>
    );
  };
});

const mockUseRouter = useRouter as jest.Mock;

describe('ForgotPasswordPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
    });
  });

  it('renders the page with correct structure', () => {
    render(<ForgotPasswordPage />);

    // Check main heading
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Forgot Your Password?'
    );

    // Check description text
    expect(
      screen.getByText('Enter your email to receive a password reset link.')
    ).toBeInTheDocument();

    // Check that the form component is rendered
    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument();
  });

  it('has proper page layout structure', () => {
    render(<ForgotPasswordPage />);

    // Check main container has proper classes for centering and layout
    const container = screen.getByRole('heading', { level: 2 }).closest('div');
    expect(container).toBeInTheDocument();
  });

  it('renders heading with correct styling classes', () => {
    render(<ForgotPasswordPage />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveClass('text-3xl', 'font-bold', 'text-center');
  });

  it('renders description with correct styling classes', () => {
    render(<ForgotPasswordPage />);

    const description = screen.getByText(
      'Enter your email to receive a password reset link.'
    );
    expect(description).toHaveClass(
      'mt-2',
      'text-sm',
      'text-gray-600',
      'text-center'
    );
  });

  it('is accessible with proper semantic structure', () => {
    render(<ForgotPasswordPage />);

    // Main heading should be h2
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();

    // Should have descriptive text
    expect(screen.getByText(/enter your email/i)).toBeInTheDocument();
  });

  it('renders the forgot password form component', () => {
    render(<ForgotPasswordPage />);

    // The mocked component should be present
    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument();
  });

  it('has responsive layout classes', () => {
    const { container } = render(<ForgotPasswordPage />);

    // Check that responsive classes are applied correctly
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass(
      'min-h-screen',
      'flex',
      'items-center',
      'justify-center'
    );

    // Check inner container classes
    const innerContainer = mainDiv.querySelector('.max-w-md');
    expect(innerContainer).toBeInTheDocument();
    expect(innerContainer).toHaveClass('w-full', 'space-y-8');
  });

  it('does not break when router is unavailable', () => {
    mockUseRouter.mockReturnValue(null);

    expect(() => {
      render(<ForgotPasswordPage />);
    }).not.toThrow();
  });

  it('maintains proper spacing between elements', () => {
    render(<ForgotPasswordPage />);

    // Check that the container with space-y-8 exists for proper spacing
    const spacedContainer = screen
      .getByRole('heading', { level: 2 })
      .closest('.space-y-8');
    expect(spacedContainer).toBeInTheDocument();
  });
});
