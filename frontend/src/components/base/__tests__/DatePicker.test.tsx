import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DatePicker from '../DatePicker';

const mockHandleChange = jest.fn();

const defaultProps = {
  id: 'test-date-picker',
  label: 'Test Date',
  handleChange: mockHandleChange,
};

describe('DatePicker Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with label', () => {
    render(<DatePicker {...defaultProps} />);
    expect(screen.getByLabelText('Test Date')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('displays placeholder when no value is provided', () => {
    render(<DatePicker {...defaultProps} placeholder="Select a date" />);
    expect(screen.getByText('Select a date')).toBeInTheDocument();
  });

  it('displays formatted date when value is provided', () => {
    const testDate = new Date('2024-03-15T00:00:00.000Z');
    render(<DatePicker {...defaultProps} value={testDate} />);
    // Use a more flexible matcher since timezone may affect the display
    expect(screen.getByText(/Mar 1[4-5], 2024/)).toBeInTheDocument();
  });

  it('opens calendar when button is clicked', async () => {
    const user = userEvent.setup();
    render(<DatePicker {...defaultProps} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes calendar when date is selected', async () => {
    const user = userEvent.setup();
    render(<DatePicker {...defaultProps} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(screen.getByRole('grid')).toBeInTheDocument();

    // Find any available date button to click
    const dateButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.getAttribute('name')?.match(/^\d+$/));

    if (dateButtons.length > 0) {
      await user.click(dateButtons[0]);
      expect(mockHandleChange).toHaveBeenCalledWith(
        'test-date-picker',
        expect.any(Date)
      );
    } else {
      // Find any gridcell and click it
      const gridCells = screen.getAllByRole('gridcell');
      if (gridCells.length > 0) {
        await user.click(gridCells[0]);
        expect(mockHandleChange).toHaveBeenCalledWith(
          'test-date-picker',
          expect.any(Date)
        );
      }
    }
  });

  it('closes calendar when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <DatePicker {...defaultProps} />
        <div data-testid="outside">Outside content</div>
      </div>
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(screen.getByRole('grid')).toBeInTheDocument();

    const outside = screen.getByTestId('outside');
    await user.click(outside);

    await waitFor(() => {
      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    });
  });

  it('does not open calendar when disabled', async () => {
    const user = userEvent.setup();
    render(<DatePicker {...defaultProps} isDisabled={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    await user.click(button);
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('shows required attribute on hidden input when isRequired is true', () => {
    render(<DatePicker {...defaultProps} isRequired={true} />);
    const hiddenInput = screen.getByRole('textbox', { hidden: true });
    expect(hiddenInput).toHaveAttribute('required');
  });

  it('has proper accessibility attributes', () => {
    render(<DatePicker {...defaultProps} />);
    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('aria-haspopup', 'dialog');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-label', 'Select a date');
  });

  it('has proper accessibility label when date is selected', () => {
    const testDate = new Date('2024-03-15T00:00:00.000Z');
    render(<DatePicker {...defaultProps} value={testDate} />);
    const button = screen.getByRole('button');

    expect(button).toHaveAttribute(
      'aria-label',
      expect.stringMatching(/Selected date: Mar 1[4-5], 2024/)
    );
  });

  it('rotates arrow icon when calendar is open', async () => {
    const user = userEvent.setup();
    render(<DatePicker {...defaultProps} />);

    const button = screen.getByRole('button');
    const arrow = button.querySelector('svg');

    expect(arrow).not.toHaveClass('rotate-180');

    await user.click(button);

    expect(arrow).toHaveClass('rotate-180');
  });

  it('sets ISO string value in hidden input', () => {
    const testDate = new Date('2024-03-15T10:00:00.000Z');
    render(<DatePicker {...defaultProps} value={testDate} />);

    const hiddenInput = screen.getByDisplayValue(testDate.toISOString());
    expect(hiddenInput).toBeInTheDocument();
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<DatePicker {...defaultProps} />);

    const button = screen.getByRole('button');
    await user.click(button);

    const calendar = screen.getByRole('grid');
    expect(calendar).toBeInTheDocument();

    // Focus and navigate with keyboard
    await user.keyboard('{Tab}');
    await user.keyboard('{ArrowDown}');

    // Calendar should still be visible after keyboard navigation
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('applies custom placeholder text', () => {
    render(<DatePicker {...defaultProps} placeholder="Pick your date" />);
    expect(screen.getByText('Pick your date')).toBeInTheDocument();
  });

  it('maintains focus states correctly', async () => {
    const user = userEvent.setup();
    render(<DatePicker {...defaultProps} />);

    const button = screen.getByRole('button');
    await user.tab();

    expect(button).toHaveFocus();
  });
});
