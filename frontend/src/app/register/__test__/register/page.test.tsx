import { render, screen } from '@testing-library/react';
import RegisterPage from '@/app/register/page';

// Mock the RegistrationForm component
jest.mock('@/forms/auth/RegistrationForm', () => {
  return function MockRegistrationForm() {
    return (
      <div data-testid="registration-form">Registration Form Component</div>
    );
  };
});

describe('RegisterPage', () => {
  it('renders the page title', () => {
    render(<RegisterPage />);

    expect(screen.getByText('Join Theme Park Planner')).toBeInTheDocument();
  });

  it('renders the RegistrationForm component', () => {
    render(<RegisterPage />);

    expect(screen.getByTestId('registration-form')).toBeInTheDocument();
  });

  it('has correct CSS structure and classes', () => {
    const { container } = render(<RegisterPage />);

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
    render(<RegisterPage />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveClass('text-3xl', 'font-bold', 'text-center');
    expect(heading).toHaveTextContent('Join Theme Park Planner');
  });
});
