import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/contexts/SessionContext';
import { authService } from '@/services';
import HeaderNav from '../HeaderNav';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/contexts/SessionContext', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/services', () => ({
  authService: {
    logout: jest.fn(),
  },
}));

jest.mock('@/components', () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
}));

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('HeaderNav', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as Response);
    mockAuthService.logout.mockClear();
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        isAuthenticated: false,
        setIsAuthenticated: jest.fn(),
      });
    });

    test('renders header with app title', () => {
      render(<HeaderNav />);
      expect(screen.getByText('Theme Park Planner')).toBeInTheDocument();
    });

    test('shows login button when not authenticated', () => {
      render(<HeaderNav />);
      expect(screen.getByText('Login')).toBeInTheDocument();
    });

    test('does not show authenticated user navigation', () => {
      render(<HeaderNav />);
      expect(screen.queryByText('My Trips')).not.toBeInTheDocument();
      expect(screen.queryByText('Account')).not.toBeInTheDocument();
      expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });

    test('navigates to login when login button is clicked', () => {
      render(<HeaderNav />);
      fireEvent.click(screen.getByText('Login'));
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  describe('when user is authenticated', () => {
    const mockSetIsAuthenticated = jest.fn();

    beforeEach(() => {
      mockSetIsAuthenticated.mockClear();
      mockUseSession.mockReturnValue({
        isAuthenticated: true,
        setIsAuthenticated: mockSetIsAuthenticated,
      });
    });

    test('shows authenticated user navigation', () => {
      render(<HeaderNav />);
      expect(screen.getByText('My Trips')).toBeInTheDocument();
      expect(screen.getByText('Account')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    test('does not show login button when authenticated', () => {
      render(<HeaderNav />);
      expect(screen.queryByText('Login')).not.toBeInTheDocument();
    });

    test('navigates to trips when My Trips is clicked', () => {
      render(<HeaderNav />);
      fireEvent.click(screen.getByText('My Trips'));
      expect(mockPush).toHaveBeenCalledWith('/trips');
    });

    test('navigates to profile when Account is clicked', () => {
      render(<HeaderNav />);
      fireEvent.click(screen.getByText('Account'));
      expect(mockPush).toHaveBeenCalledWith('/profile');
    });

    describe('logout functionality', () => {
      test('logs out successfully and redirects to home', async () => {
        mockAuthService.logout.mockResolvedValue(undefined);
        render(<HeaderNav />);

        fireEvent.click(screen.getByText('Logout'));

        await waitFor(() => {
          expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
          expect(mockSetIsAuthenticated).toHaveBeenCalledWith(false);
          expect(mockPush).toHaveBeenCalledWith('/');
        });
      });

      test('handles logout failure gracefully', async () => {
        mockAuthService.logout.mockRejectedValue(new Error('Logout failed'));
        render(<HeaderNav />);

        fireEvent.click(screen.getByText('Logout'));

        await waitFor(() => {
          expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
          expect(mockSetIsAuthenticated).toHaveBeenCalledWith(false);
          expect(mockPush).toHaveBeenCalledWith('/');
        });
      });
    });
  });

  describe('navigation functionality', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        isAuthenticated: false,
        setIsAuthenticated: jest.fn(),
      });
    });

    test('navigates to home when title is clicked', () => {
      render(<HeaderNav />);
      fireEvent.click(screen.getByText('Theme Park Planner'));
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    test('navigates to home when logo area is clicked', () => {
      render(<HeaderNav />);
      const logoArea = screen.getByText('Theme Park Planner').closest('div');
      fireEvent.click(logoArea!);
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  describe('responsive design', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        isAuthenticated: true,
        setIsAuthenticated: jest.fn(),
      });
    });

    test('has hidden navigation on small screens', () => {
      render(<HeaderNav />);
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('hidden', 'md:flex');
    });

    test('renders proper layout structure', () => {
      render(<HeaderNav />);
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('sticky', 'top-0', 'z-10');
      expect(header).toHaveClass('bg-white', 'dark:bg-gray-900');
      expect(header).toHaveClass(
        'border-b',
        'border-gray-200',
        'dark:border-gray-800'
      );
    });
  });
});
