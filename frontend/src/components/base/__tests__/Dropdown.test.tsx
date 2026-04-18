import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Dropdown from '../Dropdown';

describe('Dropdown', () => {
  const mockOptions = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
  ];

  test('renders with label and options', () => {
    render(
      <Dropdown
        id="test-dropdown"
        label="Test Dropdown"
        current=""
        options={mockOptions}
        handleChange={jest.fn()}
      />
    );

    expect(screen.getByLabelText('Test Dropdown')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();

    // Check that all options are rendered
    mockOptions.forEach((option) => {
      expect(
        screen.getByRole('option', { name: option.label })
      ).toBeInTheDocument();
    });
  });

  test('calls handleChange when selection changes', () => {
    const handleChange = jest.fn();
    render(
      <Dropdown
        id="test-dropdown"
        label="Test Dropdown"
        current=""
        options={mockOptions}
        handleChange={handleChange}
      />
    );

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'option2' },
    });

    expect(handleChange).toHaveBeenCalledWith('test-dropdown', 'option2');
  });

  test('displays current value correctly', () => {
    render(
      <Dropdown
        id="test-dropdown"
        label="Test Dropdown"
        current="option2"
        options={mockOptions}
        handleChange={jest.fn()}
      />
    );

    expect(screen.getByRole('combobox')).toHaveValue('option2');
  });

  test('renders options with correct values and labels', () => {
    render(
      <Dropdown
        id="test-dropdown"
        label="Test Dropdown"
        current=""
        options={mockOptions}
        handleChange={jest.fn()}
      />
    );

    const option1 = screen.getByRole('option', { name: 'Option 1' });
    const option2 = screen.getByRole('option', { name: 'Option 2' });
    const option3 = screen.getByRole('option', { name: 'Option 3' });

    expect(option1).toHaveValue('option1');
    expect(option2).toHaveValue('option2');
    expect(option3).toHaveValue('option3');
  });

  test('handles empty options array', () => {
    render(
      <Dropdown
        id="test-dropdown"
        label="Test Dropdown"
        current=""
        options={[]}
        handleChange={jest.fn()}
      />
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
  });

  test('has correct id and name attributes', () => {
    render(
      <Dropdown
        id="test-dropdown"
        label="Test Dropdown"
        current=""
        options={mockOptions}
        handleChange={jest.fn()}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('id', 'test-dropdown');
    expect(select).toHaveAttribute('name', 'test-dropdown');
  });
});
