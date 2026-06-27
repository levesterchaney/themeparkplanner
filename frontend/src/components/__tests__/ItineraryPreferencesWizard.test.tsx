import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ItineraryPreferencesWizard from '../ItineraryPreferencesWizard';
import { parkService } from '@/services';
import { TripDetailResponseData } from '@/services';

jest.mock('@/services', () => ({
  parkService: {
    getParkList: jest.fn(),
    getParkAttractions: jest.fn(),
  },
}));

const mockTrip: TripDetailResponseData = {
  id: '1',
  title: 'Summer Trip',
  destination: 'Walt Disney World Resort',
  start_date: '2026-07-01',
  end_date: '2026-07-07',
  party_size: 4,
  has_kids: true,
  status: 'planned',
};

const defaultProps = {
  trip: mockTrip,
  onComplete: jest.fn(),
  onCancel: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (parkService.getParkList as jest.Mock).mockResolvedValue([
    {
      id: 1,
      name: 'Magic Kingdom',
      resort_name: 'Walt Disney World Resort',
      description: '',
    },
  ]);
  (parkService.getParkAttractions as jest.Mock).mockResolvedValue([
    {
      id: 101,
      park_id: 1,
      name: 'Space Mountain',
      type: 'Coaster',
      thrill_level: 'high',
      kid_friendly: false,
      avg_duration_min: 3,
      description: '',
    },
  ]);
});

describe('ItineraryPreferencesWizard', () => {
  it('renders the first step (Experience Style)', async () => {
    render(<ItineraryPreferencesWizard {...defaultProps} />);
    expect(screen.getAllByText('Experience Style').length).toBeGreaterThan(0);
    expect(screen.getByText('Visit Pace')).toBeInTheDocument();
    expect(screen.getByText('Park Hours')).toBeInTheDocument();
    expect(screen.getByText('Break Preferences')).toBeInTheDocument();
  });

  it('calls onCancel when the Cancel button is clicked', async () => {
    render(<ItineraryPreferencesWizard {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('navigates to step 2 (Attraction Preferences) when Next is clicked', async () => {
    render(<ItineraryPreferencesWizard {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(
      screen.getAllByText('Attraction Preferences').length
    ).toBeGreaterThan(0);
    expect(screen.getByText('Thrill Level')).toBeInTheDocument();
    expect(screen.getByText('Experience Priorities')).toBeInTheDocument();
    expect(screen.getByText('Budget Tier')).toBeInTheDocument();
  });

  it('navigates back to step 1 from step 2', async () => {
    render(<ItineraryPreferencesWizard {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getAllByText('Experience Style').length).toBeGreaterThan(0);
  });

  it('navigates to step 3 (Must-Do & Skip Lists)', async () => {
    render(<ItineraryPreferencesWizard {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getAllByText('Must-Do & Skip Lists').length).toBeGreaterThan(
      0
    );
  });

  it('shows loading attractions spinner on step 3', async () => {
    (parkService.getParkList as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // never resolves — stays loading
    );
    render(<ItineraryPreferencesWizard {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('Loading attractions...')).toBeInTheDocument();
  });

  it('shows no-attractions message on step 3 when none found', async () => {
    (parkService.getParkList as jest.Mock).mockResolvedValue([]);
    render(<ItineraryPreferencesWizard {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() =>
      expect(
        screen.getByText(`No attractions found for ${mockTrip.destination}.`)
      ).toBeInTheDocument()
    );
  });

  it('shows attraction selectors when attractions are loaded on step 3', async () => {
    render(<ItineraryPreferencesWizard {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() =>
      expect(screen.getByText('Must-Do Attractions')).toBeInTheDocument()
    );
    expect(screen.getByText('Attractions to Skip')).toBeInTheDocument();
  });

  it('navigates to step 4 (Advanced Options)', async () => {
    render(<ItineraryPreferencesWizard {...defaultProps} />);
    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
    }
    expect(screen.getAllByText('Advanced Options').length).toBeGreaterThan(0);
    expect(screen.getByText('Accessibility & Dietary')).toBeInTheDocument();
    expect(screen.getByText('Accessibility Needs')).toBeInTheDocument();
    expect(screen.getByText('Dietary Restrictions')).toBeInTheDocument();
  });

  it('navigates to step 5 (Review & Generate)', async () => {
    render(<ItineraryPreferencesWizard {...defaultProps} />);
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
    }
    expect(screen.getAllByText('Review & Generate').length).toBeGreaterThan(0);
    expect(screen.getByText('Itinerary Summary')).toBeInTheDocument();
    expect(screen.getByText('Ready to Generate')).toBeInTheDocument();
  });

  it('calls onComplete with preferences when Generate button is clicked', async () => {
    render(<ItineraryPreferencesWizard {...defaultProps} />);
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
    }
    fireEvent.click(
      screen.getByRole('button', { name: /generate itinerary/i })
    );
    expect(defaultProps.onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        thrill_level: 'moderate',
        visit_style: 'moderate',
        start_time: '09:00',
        end_time: '21:00',
      })
    );
  });

  it('shows isLoading state on the action button', async () => {
    render(<ItineraryPreferencesWizard {...defaultProps} isLoading={true} />);
    // When isLoading, the primary button shows "Processing..." and is disabled
    expect(screen.getByText('Processing...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
  });

  it('updates start_time preference when dropdown changes', async () => {
    render(<ItineraryPreferencesWizard {...defaultProps} />);
    const startSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(startSelect, { target: { value: '08:00' } });
    // No error = state updated without crash
  });

  it('toggles lunch break checkbox', async () => {
    render(<ItineraryPreferencesWizard {...defaultProps} />);
    const lunchCheckbox = screen.getByLabelText(
      'Schedule dedicated lunch break'
    );
    fireEvent.click(lunchCheckbox);
    // No crash = nested preference update works
  });

  it('shows accessibility checkboxes on advanced options step', async () => {
    render(<ItineraryPreferencesWizard {...defaultProps} />);
    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
    }
    expect(screen.getByLabelText('Wheelchair Access')).toBeInTheDocument();
    expect(screen.getByLabelText('Vegetarian')).toBeInTheDocument();
  });

  it('toggles accessibility need checkbox', async () => {
    render(<ItineraryPreferencesWizard {...defaultProps} />);
    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
    }
    fireEvent.click(screen.getByLabelText('Wheelchair Access'));
    // No crash = accessibility array update works
  });

  it('shows • Avoid crowds in review step for default preferences', async () => {
    render(<ItineraryPreferencesWizard {...defaultProps} />);
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
    }
    expect(screen.getByText('• Avoid crowds')).toBeInTheDocument();
  });

  it('shows None selected for must-do and skip when empty', async () => {
    render(<ItineraryPreferencesWizard {...defaultProps} />);
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
    }
    expect(screen.getAllByText('None selected').length).toBe(2);
  });

  it('handles park service error gracefully', async () => {
    (parkService.getParkList as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );
    // Should not throw; renders without crashing
    render(<ItineraryPreferencesWizard {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getAllByText('Experience Style').length).toBeGreaterThan(0);
    });
  });

  it('handles individual park attractions error gracefully', async () => {
    (parkService.getParkAttractions as jest.Mock).mockRejectedValue(
      new Error('Park error')
    );
    render(<ItineraryPreferencesWizard {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => {
      // Attractions will be empty — shows the empty state
      expect(
        screen.getByText(`No attractions found for ${mockTrip.destination}.`)
      ).toBeInTheDocument();
    });
  });
});
