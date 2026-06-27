import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AttractionSelector from '../AttractionSelector';
import {
  AttractionDetailResponseData,
  ParkDetailResponseData,
} from '@/services/park';

const makeAttraction = (
  overrides: Partial<AttractionDetailResponseData> = {}
): AttractionDetailResponseData => ({
  id: 1,
  park_id: 10,
  name: 'Space Mountain',
  type: 'Coaster',
  thrill_level: 'high',
  kid_friendly: false,
  avg_duration_min: 3,
  description: '',
  ...overrides,
});

const parks: ParkDetailResponseData[] = [
  {
    id: 10,
    name: 'Magic Kingdom',
    resort_name: 'Walt Disney World Resort',
    description: '',
  },
];

const baseProps = {
  attractions: [makeAttraction()],
  selectedAttractions: [] as string[],
  onSelectionChange: jest.fn(),
  mode: 'must-do' as const,
  parks,
};

describe('AttractionSelector', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the must-do header', () => {
    render(<AttractionSelector {...baseProps} />);
    expect(screen.getByText('Must-Do Attractions')).toBeInTheDocument();
  });

  it('renders the skip header in skip mode', () => {
    render(<AttractionSelector {...baseProps} mode="skip" />);
    expect(screen.getByText('Attractions to Skip')).toBeInTheDocument();
  });

  it('renders attraction names', () => {
    render(<AttractionSelector {...baseProps} />);
    expect(screen.getByText('Space Mountain')).toBeInTheDocument();
  });

  it('renders park name from parks prop', () => {
    render(<AttractionSelector {...baseProps} />);
    expect(screen.getByText('Magic Kingdom')).toBeInTheDocument();
  });

  it('falls back to "Park {id}" when park not in parks list', () => {
    render(<AttractionSelector {...baseProps} parks={[]} />);
    expect(screen.getByText('Park 10')).toBeInTheDocument();
  });

  it('renders attraction metadata (type, thrill level, duration)', () => {
    render(<AttractionSelector {...baseProps} />);
    expect(screen.getAllByText('Coaster').length).toBeGreaterThan(0);
    expect(screen.getAllByText('high').length).toBeGreaterThan(0);
    expect(screen.getByText('3min')).toBeInTheDocument();
  });

  it('shows Kid-friendly label when attraction is kid friendly', () => {
    render(
      <AttractionSelector
        {...baseProps}
        attractions={[makeAttraction({ kid_friendly: true })]}
      />
    );
    expect(screen.getByText('Kid-friendly')).toBeInTheDocument();
  });

  it('calls onSelectionChange when an unselected attraction is clicked', () => {
    render(<AttractionSelector {...baseProps} />);
    fireEvent.click(screen.getByText('Space Mountain'));
    expect(baseProps.onSelectionChange).toHaveBeenCalledWith(['1']);
  });

  it('removes attraction from selection when already selected', () => {
    render(<AttractionSelector {...baseProps} selectedAttractions={['1']} />);
    fireEvent.click(screen.getByText('Space Mountain'));
    expect(baseProps.onSelectionChange).toHaveBeenCalledWith([]);
  });

  it('does not add attraction beyond maxSelections limit', () => {
    const props = {
      ...baseProps,
      selectedAttractions: ['99'],
      maxSelections: 1,
    };
    render(<AttractionSelector {...props} />);
    fireEvent.click(screen.getByText('Space Mountain'));
    expect(baseProps.onSelectionChange).not.toHaveBeenCalled();
  });

  it('shows selection count when maxSelections is set', () => {
    render(
      <AttractionSelector
        {...baseProps}
        selectedAttractions={['1']}
        maxSelections={5}
      />
    );
    expect(screen.getByText(/1\/5/)).toBeInTheDocument();
  });

  it('shows Clear All button when items are selected', () => {
    render(<AttractionSelector {...baseProps} selectedAttractions={['1']} />);
    expect(
      screen.getByRole('button', { name: 'Clear All' })
    ).toBeInTheDocument();
  });

  it('Clear All calls onSelectionChange with empty array', () => {
    render(<AttractionSelector {...baseProps} selectedAttractions={['1']} />);
    fireEvent.click(screen.getByRole('button', { name: 'Clear All' }));
    expect(baseProps.onSelectionChange).toHaveBeenCalledWith([]);
  });

  it('hides Clear All when nothing selected', () => {
    render(<AttractionSelector {...baseProps} />);
    expect(
      screen.queryByRole('button', { name: 'Clear All' })
    ).not.toBeInTheDocument();
  });

  it('shows Select Visible button when attractions exist', () => {
    render(<AttractionSelector {...baseProps} />);
    expect(
      screen.getByRole('button', { name: 'Select Visible' })
    ).toBeInTheDocument();
  });

  it('Select Visible adds unselected visible attractions', () => {
    render(<AttractionSelector {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Select Visible' }));
    expect(baseProps.onSelectionChange).toHaveBeenCalledWith(['1']);
  });

  it('Select Visible respects maxSelections', () => {
    const props = {
      ...baseProps,
      selectedAttractions: ['99'],
      maxSelections: 1,
    };
    render(<AttractionSelector {...props} />);
    // Button should be hidden when at limit
    expect(
      screen.queryByRole('button', { name: 'Select Visible' })
    ).not.toBeInTheDocument();
  });

  it('filters by search term', () => {
    const attractions = [
      makeAttraction({ id: 1, name: 'Space Mountain' }),
      makeAttraction({ id: 2, name: 'Haunted Mansion' }),
    ];
    render(<AttractionSelector {...baseProps} attractions={attractions} />);

    fireEvent.change(screen.getByPlaceholderText('Search attractions...'), {
      target: { value: 'Haunted' },
    });

    expect(screen.getByText('Haunted Mansion')).toBeInTheDocument();
    expect(screen.queryByText('Space Mountain')).not.toBeInTheDocument();
    expect(screen.getByText(/Showing 1 of 2/)).toBeInTheDocument();
  });

  it('filters by type', () => {
    const attractions = [
      makeAttraction({ id: 1, name: 'Space Mountain', type: 'Coaster' }),
      makeAttraction({ id: 2, name: 'Pirates', type: 'Dark Ride' }),
    ];
    render(<AttractionSelector {...baseProps} attractions={attractions} />);

    const typeSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(typeSelect, { target: { value: 'Dark Ride' } });

    expect(screen.getByText('Pirates')).toBeInTheDocument();
    expect(screen.queryByText('Space Mountain')).not.toBeInTheDocument();
  });

  it('filters by thrill level', () => {
    const attractions = [
      makeAttraction({ id: 1, name: 'Space Mountain', thrill_level: 'high' }),
      makeAttraction({ id: 2, name: 'Dumbo', thrill_level: 'low' }),
    ];
    render(<AttractionSelector {...baseProps} attractions={attractions} />);

    const thrillSelect = screen.getAllByRole('combobox')[1];
    fireEvent.change(thrillSelect, { target: { value: 'low' } });

    expect(screen.getByText('Dumbo')).toBeInTheDocument();
    expect(screen.queryByText('Space Mountain')).not.toBeInTheDocument();
  });

  it('filters by kid-friendly', () => {
    const attractions = [
      makeAttraction({ id: 1, name: 'Space Mountain', kid_friendly: false }),
      makeAttraction({ id: 2, name: 'Dumbo', kid_friendly: true }),
    ];
    render(<AttractionSelector {...baseProps} attractions={attractions} />);

    const kidSelect = screen.getAllByRole('combobox')[2];
    fireEvent.change(kidSelect, { target: { value: 'kid-friendly' } });

    expect(screen.getByText('Dumbo')).toBeInTheDocument();
    expect(screen.queryByText('Space Mountain')).not.toBeInTheDocument();
  });

  it('filters by not-kid-friendly', () => {
    const attractions = [
      makeAttraction({ id: 1, name: 'Space Mountain', kid_friendly: false }),
      makeAttraction({ id: 2, name: 'Dumbo', kid_friendly: true }),
    ];
    render(<AttractionSelector {...baseProps} attractions={attractions} />);

    const kidSelect = screen.getAllByRole('combobox')[2];
    fireEvent.change(kidSelect, { target: { value: 'not-kid-friendly' } });

    expect(screen.getByText('Space Mountain')).toBeInTheDocument();
    expect(screen.queryByText('Dumbo')).not.toBeInTheDocument();
  });

  it('shows no-results message and Clear Filters button when nothing matches', () => {
    render(<AttractionSelector {...baseProps} />);
    fireEvent.change(screen.getByPlaceholderText('Search attractions...'), {
      target: { value: 'xyzzy' },
    });
    expect(
      screen.getByText('No attractions found matching your criteria.')
    ).toBeInTheDocument();
  });

  it('Clear Filters resets all filters', () => {
    render(<AttractionSelector {...baseProps} />);
    fireEvent.change(screen.getByPlaceholderText('Search attractions...'), {
      target: { value: 'xyzzy' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Clear Filters' }));
    expect(screen.getByText('Space Mountain')).toBeInTheDocument();
  });

  it('groups attractions from multiple parks', () => {
    const twoParks: ParkDetailResponseData[] = [
      { id: 10, name: 'Magic Kingdom', resort_name: 'WDW', description: '' },
      { id: 20, name: 'EPCOT', resort_name: 'WDW', description: '' },
    ];
    const attractions = [
      makeAttraction({ id: 1, name: 'Space Mountain', park_id: 10 }),
      makeAttraction({ id: 2, name: 'Frozen Ever After', park_id: 20 }),
    ];
    render(
      <AttractionSelector
        {...baseProps}
        attractions={attractions}
        parks={twoParks}
      />
    );
    expect(screen.getByText('Magic Kingdom')).toBeInTheDocument();
    expect(screen.getByText('EPCOT')).toBeInTheDocument();
  });
});
