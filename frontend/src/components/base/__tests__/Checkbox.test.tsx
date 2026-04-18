import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Checkbox from '../Checkbox';

describe('Checkbox', () => {
  test('renders with label', () => {
    render(
      <Checkbox
        id="test-checkbox"
        label="Test Label"
        value="test-value"
        isChecked={false}
        handleChange={jest.fn()}
      />
    );

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  test('calls handleChange with correct parameters when clicked', () => {
    const handleChange = jest.fn();
    render(
      <Checkbox
        id="test-checkbox"
        label="Test Label"
        value="test-value"
        isChecked={false}
        handleChange={handleChange}
      />
    );

    fireEvent.click(screen.getByRole('checkbox'));
    expect(handleChange).toHaveBeenCalledWith(
      'test-checkbox',
      'test-value',
      true
    );
  });

  test('uses field prop when provided', () => {
    const handleChange = jest.fn();
    render(
      <Checkbox
        id="test-checkbox"
        field="custom-field"
        label="Test Label"
        value="test-value"
        isChecked={false}
        handleChange={handleChange}
      />
    );

    fireEvent.click(screen.getByRole('checkbox'));
    expect(handleChange).toHaveBeenCalledWith(
      'custom-field',
      'test-value',
      true
    );
  });

  test('reflects checked state', () => {
    const { rerender } = render(
      <Checkbox
        id="test-checkbox"
        label="Test Label"
        value="test-value"
        isChecked={false}
        handleChange={jest.fn()}
      />
    );

    expect(screen.getByRole('checkbox')).not.toBeChecked();

    rerender(
      <Checkbox
        id="test-checkbox"
        label="Test Label"
        value="test-value"
        isChecked={true}
        handleChange={jest.fn()}
      />
    );

    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  test('can be disabled', () => {
    render(
      <Checkbox
        id="test-checkbox"
        label="Test Label"
        value="test-value"
        isChecked={false}
        isDisabled={true}
        handleChange={jest.fn()}
      />
    );

    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  test('can be required', () => {
    render(
      <Checkbox
        id="test-checkbox"
        label="Test Label"
        value="test-value"
        isChecked={false}
        isRequired={true}
        handleChange={jest.fn()}
      />
    );

    expect(screen.getByRole('checkbox')).toBeRequired();
  });

  test('handles boolean value', () => {
    const handleChange = jest.fn();
    render(
      <Checkbox
        id="test-checkbox"
        label="Test Label"
        value={true}
        isChecked={true}
        handleChange={handleChange}
      />
    );

    fireEvent.click(screen.getByRole('checkbox'));
    expect(handleChange).toHaveBeenCalledWith('test-checkbox', true, false);
  });

  test('label is clickable', () => {
    const handleChange = jest.fn();
    render(
      <Checkbox
        id="test-checkbox"
        label="Test Label"
        value="test-value"
        isChecked={false}
        handleChange={handleChange}
      />
    );

    fireEvent.click(screen.getByText('Test Label'));
    expect(handleChange).toHaveBeenCalledWith(
      'test-checkbox',
      'test-value',
      true
    );
  });
});
