import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
  test('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('applies correct default props', () => {
    render(<Button>Default Button</Button>);
    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('type', 'button');
    expect(button).not.toBeDisabled();
  });

  test('can be disabled', () => {
    render(<Button disabled={true}>Disabled Button</Button>);
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
  });

  test('supports different button types', () => {
    const { rerender } = render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');

    rerender(<Button type="reset">Reset</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
  });

  test('applies correct CSS classes', () => {
    render(<Button>Styled Button</Button>);
    const button = screen.getByRole('button');

    expect(button).toHaveClass(
      'inline-flex',
      'items-center',
      'justify-center',
      'gap-2',
      'whitespace-nowrap',
      'rounded-lg',
      'font-medium',
      'bg-primary',
      'text-primary-foreground'
    );
  });

  test('supports different variants', () => {
    const { rerender } = render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass(
      'bg-secondary',
      'text-secondary-foreground'
    );

    rerender(<Button variant="destructive">Destructive</Button>);
    expect(screen.getByRole('button')).toHaveClass(
      'bg-destructive',
      'text-destructive-foreground'
    );
  });

  test('supports different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-8', 'px-3');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-10', 'px-6');
  });

  test('does not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} disabled={true}>
        Disabled Button
      </Button>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
