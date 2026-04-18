import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Textbox from '../Textbox';

describe('Textbox', () => {
  test('renders with label', () => {
    render(
      <Textbox
        id="test-textbox"
        label="Test Label"
        value=""
        handleChange={jest.fn()}
      />
    );

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('displays the current value', () => {
    render(
      <Textbox
        id="test-textbox"
        label="Test Label"
        value="Test Value"
        handleChange={jest.fn()}
      />
    );

    expect(screen.getByRole('textbox')).toHaveValue('Test Value');
  });

  test('calls handleChange when value changes', () => {
    const handleChange = jest.fn();
    render(
      <Textbox
        id="test-textbox"
        label="Test Label"
        value=""
        handleChange={handleChange}
      />
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'New Value' },
    });

    expect(handleChange).toHaveBeenCalledWith('test-textbox', 'New Value');
  });

  test('can be required', () => {
    render(
      <Textbox
        id="test-textbox"
        label="Test Label"
        value=""
        isRequired={true}
        handleChange={jest.fn()}
      />
    );

    expect(screen.getByRole('textbox')).toBeRequired();
  });

  test('can be disabled', () => {
    render(
      <Textbox
        id="test-textbox"
        label="Test Label"
        value=""
        isDisabled={true}
        handleChange={jest.fn()}
      />
    );

    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  test('has correct input type', () => {
    render(
      <Textbox
        id="test-textbox"
        label="Test Label"
        value=""
        handleChange={jest.fn()}
      />
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
  });

  test('has correct id and name attributes', () => {
    render(
      <Textbox
        id="test-textbox"
        label="Test Label"
        value=""
        handleChange={jest.fn()}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'test-textbox');
    expect(input).toHaveAttribute('name', 'test-textbox');
  });

  test('applies correct CSS classes', () => {
    render(
      <Textbox
        id="test-textbox"
        label="Test Label"
        value=""
        handleChange={jest.fn()}
      />
    );

    const input = screen.getByRole('textbox');
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

  test('handles empty string values', () => {
    const handleChange = jest.fn();
    render(
      <Textbox
        id="test-textbox"
        label="Test Label"
        value="initial"
        handleChange={handleChange}
      />
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '' },
    });

    expect(handleChange).toHaveBeenCalledWith('test-textbox', '');
  });

  test('handles long text values', () => {
    const longText =
      'This is a very long text value that should be handled correctly by the textbox component';
    render(
      <Textbox
        id="test-textbox"
        label="Test Label"
        value={longText}
        handleChange={jest.fn()}
      />
    );

    expect(screen.getByRole('textbox')).toHaveValue(longText);
  });
});
