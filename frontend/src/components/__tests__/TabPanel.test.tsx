import React from 'react';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import TabPanel, { TabItem } from '../TabPanel';

const mockTabs: TabItem[] = [
  {
    id: 'tab1',
    label: 'Tab 1',
    content: <div>Content 1</div>,
  },
  {
    id: 'tab2',
    label: 'Tab 2',
    content: <div>Content 2</div>,
    icon: <span data-testid="tab2-icon">🏠</span>,
  },
  {
    id: 'tab3',
    label: 'Tab 3',
    content: <div>Content 3</div>,
    disabled: true,
  },
];

describe('TabPanel', () => {
  describe('Basic functionality', () => {
    test('renders all tabs', () => {
      render(<TabPanel tabs={mockTabs} />);

      expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Tab 2/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tab 3' })).toBeInTheDocument();
    });

    test('renders first tab as active by default', () => {
      render(<TabPanel tabs={mockTabs} />);

      const firstTab = screen.getByRole('tab', { name: 'Tab 1' });
      expect(firstTab).toHaveAttribute('aria-selected', 'true');
      expect(firstTab).toHaveAttribute('data-state', 'active');
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    test('renders default tab when specified', () => {
      render(<TabPanel tabs={mockTabs} defaultTab="tab2" />);

      const secondTab = screen.getByRole('tab', { name: /Tab 2/ });
      expect(secondTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    test('renders tab icons when provided', () => {
      render(<TabPanel tabs={mockTabs} />);

      expect(screen.getByTestId('tab2-icon')).toBeInTheDocument();
    });

    test('handles disabled tabs correctly', () => {
      render(<TabPanel tabs={mockTabs} />);

      const disabledTab = screen.getByRole('tab', { name: 'Tab 3' });
      expect(disabledTab).toBeDisabled();
    });
  });

  describe('Tab navigation', () => {
    test('switches tabs on click', async () => {
      const user = userEvent.setup();
      render(<TabPanel tabs={mockTabs} />);

      const secondTab = screen.getByRole('tab', { name: /Tab 2/ });
      await user.click(secondTab);

      expect(secondTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Content 2')).toBeInTheDocument();
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });

    test('does not switch to disabled tab on click', async () => {
      const user = userEvent.setup();
      render(<TabPanel tabs={mockTabs} />);

      const disabledTab = screen.getByRole('tab', { name: 'Tab 3' });
      await user.click(disabledTab);

      // Should still be on first tab
      const firstTab = screen.getByRole('tab', { name: 'Tab 1' });
      expect(firstTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    test('calls onTabChange when tab is clicked', async () => {
      const user = userEvent.setup();
      const onTabChange = jest.fn();
      render(<TabPanel tabs={mockTabs} onTabChange={onTabChange} />);

      const secondTab = screen.getByRole('tab', { name: /Tab 2/ });
      await user.click(secondTab);

      expect(onTabChange).toHaveBeenCalledWith('tab2');
    });
  });

  describe('Keyboard navigation', () => {
    test('navigates with arrow keys', async () => {
      const user = userEvent.setup();
      render(<TabPanel tabs={mockTabs} />);

      const firstTab = screen.getByRole('tab', { name: 'Tab 1' });
      firstTab.focus();

      // Navigate right to second tab
      await user.keyboard('{ArrowRight}');
      const secondTab = screen.getByRole('tab', { name: /Tab 2/ });
      expect(secondTab).toHaveFocus();
      expect(secondTab).toHaveAttribute('aria-selected', 'true');
    });

    test('wraps around when navigating past last tab', async () => {
      const user = userEvent.setup();
      render(<TabPanel tabs={mockTabs} />);

      const secondTab = screen.getByRole('tab', { name: /Tab 2/ });
      secondTab.focus();

      // Navigate right past disabled tab should wrap to first tab
      await user.keyboard('{ArrowRight}');
      const firstTab = screen.getByRole('tab', { name: 'Tab 1' });
      expect(firstTab).toHaveFocus();
    });

    test('navigates to first tab with Home key', async () => {
      const user = userEvent.setup();
      render(<TabPanel tabs={mockTabs} defaultTab="tab2" />);

      const secondTab = screen.getByRole('tab', { name: /Tab 2/ });
      secondTab.focus();

      await user.keyboard('{Home}');
      const firstTab = screen.getByRole('tab', { name: 'Tab 1' });
      expect(firstTab).toHaveFocus();
      expect(firstTab).toHaveAttribute('aria-selected', 'true');
    });

    test('navigates to last enabled tab with End key', async () => {
      const user = userEvent.setup();
      render(<TabPanel tabs={mockTabs} />);

      const firstTab = screen.getByRole('tab', { name: 'Tab 1' });
      firstTab.focus();

      await user.keyboard('{End}');
      const secondTab = screen.getByRole('tab', { name: /Tab 2/ });
      expect(secondTab).toHaveFocus();
      expect(secondTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Controlled mode', () => {
    test('uses controlled activeTab prop', () => {
      render(<TabPanel tabs={mockTabs} activeTab="tab2" />);

      const secondTab = screen.getByRole('tab', { name: /Tab 2/ });
      expect(secondTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    test('does not change active tab internally when controlled', async () => {
      const user = userEvent.setup();
      const onTabChange = jest.fn();
      render(
        <TabPanel tabs={mockTabs} activeTab="tab1" onTabChange={onTabChange} />
      );

      const secondTab = screen.getByRole('tab', { name: /Tab 2/ });
      await user.click(secondTab);

      // Should call onTabChange but not change the active tab
      expect(onTabChange).toHaveBeenCalledWith('tab2');
      const firstTab = screen.getByRole('tab', { name: 'Tab 1' });
      expect(firstTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Variants and styling', () => {
    test('applies default variant styles', () => {
      render(<TabPanel tabs={mockTabs} variant="default" />);

      const tabList = screen.getByRole('tablist');
      expect(tabList).toHaveClass('border-b', 'border-border');
    });

    test('applies pills variant styles', () => {
      render(<TabPanel tabs={mockTabs} variant="pills" />);

      const firstTab = screen.getByRole('tab', { name: 'Tab 1' });
      expect(firstTab).toHaveClass('rounded-lg');
    });

    test('applies custom className', () => {
      render(<TabPanel tabs={mockTabs} className="custom-class" />);

      const container = screen.getByRole('tablist').parentElement;
      expect(container).toHaveClass('custom-class');
    });

    test('applies size variants', () => {
      render(<TabPanel tabs={mockTabs} size="lg" />);

      const firstTab = screen.getByRole('tab', { name: 'Tab 1' });
      expect(firstTab).toHaveClass('h-10', 'px-6', 'py-2');
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(<TabPanel tabs={mockTabs} />);

      const tabList = screen.getByRole('tablist');
      expect(tabList).toHaveAttribute('aria-label', 'Tabs');

      const firstTab = screen.getByRole('tab', { name: 'Tab 1' });
      expect(firstTab).toHaveAttribute('aria-controls', 'tabpanel-tab1');
      expect(firstTab).toHaveAttribute('tabindex', '0');

      const tabPanel = screen.getByRole('tabpanel');
      expect(tabPanel).toHaveAttribute('id', 'tabpanel-tab1');
      expect(tabPanel).toHaveAttribute('aria-labelledby', 'tab-tab1');
    });

    test('manages tabindex correctly for inactive tabs', () => {
      render(<TabPanel tabs={mockTabs} />);

      const secondTab = screen.getByRole('tab', { name: /Tab 2/ });
      expect(secondTab).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('Edge cases', () => {
    test('handles empty tabs array gracefully', () => {
      render(<TabPanel tabs={[]} />);

      const tabList = screen.getByRole('tablist');
      expect(tabList).toBeInTheDocument();
      expect(tabList.children).toHaveLength(0);
    });

    test('handles tabs with same content', () => {
      const sameTabs: TabItem[] = [
        { id: 'a', label: 'A', content: <div>Same content</div> },
        { id: 'b', label: 'B', content: <div>Same content</div> },
      ];

      render(<TabPanel tabs={sameTabs} />);

      expect(screen.getByRole('tab', { name: 'A' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'B' })).toBeInTheDocument();
      expect(screen.getByText('Same content')).toBeInTheDocument();
    });

    test('updates when defaultTab prop changes', () => {
      const { rerender } = render(
        <TabPanel tabs={mockTabs} defaultTab="tab1" />
      );

      expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute(
        'aria-selected',
        'true'
      );

      rerender(<TabPanel tabs={mockTabs} defaultTab="tab2" />);

      expect(screen.getByRole('tab', { name: /Tab 2/ })).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });
  });
});
