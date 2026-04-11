import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

// Mock HealthCheck component
jest.mock('@/components/HealthCheck', () => {
  return function MockHealthCheck() {
    return <div data-testid="health-check">Health Check Component</div>;
  };
});

const { cookies } = jest.mocked(await import('next/headers'));
const mockCookies = cookies;

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock environment variable
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:8000';
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  });

  it('renders main heading and description', async () => {
    mockCookies.mockResolvedValue({
      has: jest.fn().mockReturnValue(false),
    });

    render(await Home());

    expect(screen.getByText('Theme Park Planner')).toBeInTheDocument();
    expect(
      screen.getByText(/Plan your perfect theme park adventure/)
    ).toBeInTheDocument();
  });

  it('renders system status section with HealthCheck component', async () => {
    mockCookies.mockResolvedValue({
      has: jest.fn().mockReturnValue(false),
    });

    render(await Home());

    expect(screen.getByText('System Status')).toBeInTheDocument();
    expect(screen.getByTestId('health-check')).toBeInTheDocument();
  });

  it('renders feature cards', async () => {
    mockCookies.mockResolvedValue({
      has: jest.fn().mockReturnValue(false),
    });

    render(await Home());

    expect(screen.getByText('🏰 Parks')).toBeInTheDocument();
    expect(
      screen.getByText('Browse theme parks and attractions')
    ).toBeInTheDocument();

    expect(screen.getByText('🎢 Attractions')).toBeInTheDocument();
    expect(
      screen.getByText('Check real-time wait times and plan your route')
    ).toBeInTheDocument();

    expect(screen.getByText('📋 Itineraries')).toBeInTheDocument();
    expect(
      screen.getByText('Create and manage your visit plans')
    ).toBeInTheDocument();
  });

  it('displays API base URL when configured', async () => {
    mockCookies.mockResolvedValue({
      has: jest.fn().mockReturnValue(false),
    });

    render(await Home());

    expect(
      screen.getByText('API Base URL: http://localhost:8000')
    ).toBeInTheDocument();
  });

  it('displays "Not configured" when API base URL is not set', async () => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;

    mockCookies.mockResolvedValue({
      has: jest.fn().mockReturnValue(false),
    });

    render(await Home());

    expect(
      screen.getByText('API Base URL: Not configured')
    ).toBeInTheDocument();
  });

  it('shows login and register links when no active session', async () => {
    mockCookies.mockResolvedValue({
      has: jest.fn().mockReturnValue(false),
    });

    render(await Home());

    const signInLink = screen.getByRole('link', { name: 'Sign in' });
    const registerLink = screen.getByRole('link', { name: 'Register' });

    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute('href', '/login');

    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');

    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('shows logout link when active session exists', async () => {
    mockCookies.mockResolvedValue({
      has: jest.fn().mockReturnValue(true),
    });

    render(await Home());

    const logoutLink = screen.getByRole('link', { name: 'Logout' });
    expect(logoutLink).toBeInTheDocument();
    expect(logoutLink).toHaveAttribute('href', '/logout');

    expect(screen.queryByText('Sign in')).not.toBeInTheDocument();
    expect(screen.queryByText('Register')).not.toBeInTheDocument();
  });

  it('checks for session_token cookie', async () => {
    const mockHas = jest.fn().mockReturnValue(true);
    mockCookies.mockResolvedValue({
      has: mockHas,
    });

    render(await Home());

    expect(mockHas).toHaveBeenCalledWith('session_token');
  });

  it('renders with correct CSS classes and structure', async () => {
    mockCookies.mockResolvedValue({
      has: jest.fn().mockReturnValue(false),
    });

    const { container } = render(await Home());

    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass(
      'min-h-screen',
      'bg-gradient-to-br',
      'from-blue-50',
      'to-indigo-100'
    );
  });
});
