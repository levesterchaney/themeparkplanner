import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Numberbox from '../Numberbox';

describe('Numberbox', () => {
  test('renders with label', () => {
    render(
      <Numberbox
        id="test-number"
        label="Test Number"
        value={5}
        handleChange={jest.fn()}
      />
    );

    expect(screen.getByLabelText('Test Number')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  test('displays the current value', () => {
    render(
      <Numberbox
        id="test-number"
        label="Test Number"
        value={42}
        handleChange={jest.fn()}
      />
    );

    expect(screen.getByRole('spinbutton')).toHaveValue(42);
  });

  test('calls handleChange when value changes', () => {
    const handleChange = jest.fn();
    render(
      <Numberbox
        id="test-number"
        label="Test Number"
        value={5}
        handleChange={handleChange}
      />
    );

    fireEvent.change(screen.getByRole('spinbutton'), {
      target: { value: '10' },
    });

    expect(handleChange).toHaveBeenCalledWith('test-number', 10);
  });

  test('applies default min and max values', () => {
    render(
      <Numberbox
        id="test-number"
        label="Test Number"
        value={5}
        handleChange={jest.fn()}
      />
    );

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('min', '1');
    expect(input).toHaveAttribute('max', '20');
  });

  test('applies custom min and max values', () => {
    render(
      <Numberbox
        id="test-number"
        label="Test Number"
        value={15}
        min={10}
        max={50}
        handleChange={jest.fn()}
      />
    );

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('min', '10');
    expect(input).toHaveAttribute('max', '50');
  });

  test('can be required', () => {
    render(
      <Numberbox
        id="test-number"
        label="Test Number"
        value={5}
        isRequired={true}
        handleChange={jest.fn()}
      />
    );

    expect(screen.getByRole('spinbutton')).toBeRequired();
  });

  test('can be disabled', () => {
    render(
      <Numberbox
        id="test-number"
        label="Test Number"
        value={5}
        isDisabled={true}
        handleChange={jest.fn()}
      />
    );

    expect(screen.getByRole('spinbutton')).toBeDisabled();
  });

  test('has correct input type', () => {
    render(
      <Numberbox
        id="test-number"
        label="Test Number"
        value={5}
        handleChange={jest.fn()}
      />
    );

    expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number');
  });

  test('has correct id and name attributes', () => {
    render(
      <Numberbox
        id="test-number"
        label="Test Number"
        value={5}
        handleChange={jest.fn()}
      />
    );

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('id', 'test-number');
    expect(input).toHaveAttribute('name', 'test-number');
  });

  test('handles invalid number input', () => {
    const handleChange = jest.fn();
    render(
      <Numberbox
        id="test-number"
        label="Test Number"
        value={5}
        handleChange={handleChange}
      />
    );

    fireEvent.change(screen.getByRole('spinbutton'), {
      target: { value: 'not-a-number' },
    });

    // parseInt('not-a-number') returns NaN
    expect(handleChange).toHaveBeenCalledWith('test-number', NaN);
  });

  test('applies correct CSS classes', () => {
    render(
      <Numberbox
        id="test-number"
        label="Test Number"
        value={5}
        handleChange={jest.fn()}
      />
    );

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveClass(
      'flex',
      'h-9',
      'w-full',
      'rounded-lg',
      'border',
      'border-border',
      'bg-input-background',
      'px-3',
      'py-1',
      'text-sm'
    );
  });
});
