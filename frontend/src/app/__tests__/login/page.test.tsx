import { render, screen } from '@testing-library/react';
import LoginPage from '@/app/login/page';

// Mock the LoginForm component
jest.mock('@/forms/auth/LoginForm', () => {
  return function MockLoginForm() {
    return <div data-testid="login-form">Login Form Component</div>;
  };
});

describe('LoginPage', () => {
  it('renders the page title', () => {
    render(<LoginPage />);

    expect(screen.getByText('Welcome!')).toBeInTheDocument();
  });

  it('renders the LoginForm component', () => {
    render(<LoginPage />);

    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('has correct CSS structure and classes', () => {
    const { container } = render(<LoginPage />);

    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass(
      'min-h-screen',
      'flex',
      'items-center',
      'justify-center'
    );

    const contentDiv = container.querySelector('.max-w-md');
    expect(contentDiv).toHaveClass('max-w-md', 'w-full', 'space-y-8');
  });

  it('renders heading with correct styling', () => {
    render(<LoginPage />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveClass('text-3xl', 'font-bold', 'text-center');
    expect(heading).toHaveTextContent('Welcome!');
  });
});
