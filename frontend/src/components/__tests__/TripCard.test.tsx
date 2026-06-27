import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TripCard from '../TripCard';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const baseProps = {
  id: 42,
  title: 'Disney Adventure',
  destination: 'Walt Disney World Resort',
  dateRange: 'Jun 1 – Jun 5, 2026',
};

describe('TripCard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders title and destination', () => {
    render(<TripCard {...baseProps} />);
    expect(screen.getByText('Disney Adventure')).toBeInTheDocument();
    expect(screen.getByText('Walt Disney World Resort')).toBeInTheDocument();
    expect(screen.getByText('Jun 1 – Jun 5, 2026')).toBeInTheDocument();
  });

  it('navigates to trip detail on click', () => {
    render(<TripCard {...baseProps} />);
    fireEvent.click(screen.getByText('View Details →'));
    expect(mockPush).toHaveBeenCalledWith('/trips/42');
  });

  it('renders status badge when provided', () => {
    render(<TripCard {...baseProps} status="planned" />);
    expect(screen.getByText('planned')).toBeInTheDocument();
  });

  it('applies correct class for draft status', () => {
    render(<TripCard {...baseProps} status="draft" />);
    const badge = screen.getByText('draft');
    expect(badge.className).toContain('yellow');
  });

  it('applies correct class for completed status', () => {
    render(<TripCard {...baseProps} status="completed" />);
    const badge = screen.getByText('completed');
    expect(badge.className).toContain('blue');
  });

  it('applies correct class for planned status', () => {
    render(<TripCard {...baseProps} status="planned" />);
    const badge = screen.getByText('planned');
    expect(badge.className).toContain('green');
  });

  it('applies gray class for unknown status', () => {
    render(<TripCard {...baseProps} status="unknown" />);
    const badge = screen.getByText('unknown');
    expect(badge.className).toContain('gray');
  });

  it('renders party size when provided', () => {
    render(<TripCard {...baseProps} partySize={4} />);
    expect(screen.getByText('4 people')).toBeInTheDocument();
  });

  it('renders "With kids" when hasKids is true', () => {
    render(<TripCard {...baseProps} hasKids={true} />);
    expect(screen.getByText('With kids')).toBeInTheDocument();
  });

  it('renders "Adults only" when hasKids is false', () => {
    render(<TripCard {...baseProps} hasKids={false} />);
    expect(screen.getByText('Adults only')).toBeInTheDocument();
  });

  it('does not render party info section when neither partySize nor hasKids provided', () => {
    render(<TripCard {...baseProps} />);
    expect(screen.queryByText(/people/)).not.toBeInTheDocument();
    expect(screen.queryByText(/kids/i)).not.toBeInTheDocument();
  });

  it('does not render status badge when status is not provided', () => {
    render(<TripCard {...baseProps} />);
    expect(screen.queryByText('planned')).not.toBeInTheDocument();
  });
});
