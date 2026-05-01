'use client';

import { useState, useCallback, useEffect, KeyboardEvent } from 'react';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface TabPanelProps {
  tabs: TabItem[];
  defaultTab?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  tabListClassName?: string;
  tabContentClassName?: string;
}

export default function TabPanel({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  className = '',
  tabListClassName = '',
  tabContentClassName = '',
}: TabPanelProps) {
  const isControlled = controlledActiveTab !== undefined;
  const [internalActiveTab, setInternalActiveTab] = useState<string>(
    defaultTab || tabs[0]?.id || ''
  );
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const currentActiveTab = isControlled
    ? controlledActiveTab
    : internalActiveTab;

  useEffect(() => {
    if (
      !isControlled &&
      defaultTab &&
      defaultTab !== internalActiveTab &&
      !hasUserInteracted
    ) {
      setInternalActiveTab(defaultTab);
    }
  }, [defaultTab, isControlled, internalActiveTab, hasUserInteracted]);

  const handleTabClick = useCallback(
    (tabId: string) => {
      const tab = tabs.find((t) => t.id === tabId);
      if (tab?.disabled) return;

      setHasUserInteracted(true);
      if (!isControlled) {
        setInternalActiveTab(tabId);
      }
      onTabChange?.(tabId);
    },
    [tabs, isControlled, onTabChange]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, tabId: string) => {
      const currentIndex = tabs.findIndex((tab) => tab.id === tabId);
      let nextIndex = currentIndex;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
          break;
        case 'ArrowRight':
          event.preventDefault();
          nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'Home':
          event.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          nextIndex = tabs.length - 1;
          break;
        default:
          return;
      }

      // Skip disabled tabs
      let attempts = 0;
      const maxAttempts = tabs.length;
      while (tabs[nextIndex]?.disabled && attempts < maxAttempts) {
        if (event.key === 'ArrowLeft' || event.key === 'End') {
          nextIndex = nextIndex > 0 ? nextIndex - 1 : tabs.length - 1;
        } else {
          nextIndex = nextIndex < tabs.length - 1 ? nextIndex + 1 : 0;
        }
        attempts++;
      }

      if (!tabs[nextIndex]?.disabled) {
        handleTabClick(tabs[nextIndex].id);
        // Focus the new tab
        const newTabButton = document.querySelector(
          `[data-tab-id="${tabs[nextIndex].id}"]`
        ) as HTMLButtonElement;
        newTabButton?.focus();
      }
    },
    [tabs, handleTabClick]
  );

  const baseTabStyles =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

  const variantStyles = {
    default: {
      tab: 'border-b-2 border-transparent hover:text-accent-foreground hover:border-border data-[state=active]:border-primary data-[state=active]:text-primary',
      list: 'border-b border-border',
    },
    pills: {
      tab: 'rounded-lg hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground',
      list: '',
    },
    underline: {
      tab: 'border-b-2 border-transparent hover:border-border data-[state=active]:border-primary',
      list: '',
    },
  };

  const sizeStyles = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-9 px-4 py-2 text-sm',
    lg: 'h-10 px-6 py-2',
  };

  const activeTabData = tabs.find((tab) => tab.id === currentActiveTab);

  return (
    <div className={`w-full ${className}`}>
      <div
        role="tablist"
        className={`flex items-center ${variantStyles[variant].list} ${tabListClassName}`}
        aria-label="Tabs"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            data-tab-id={tab.id}
            role="tab"
            aria-selected={tab.id === currentActiveTab}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={tab.id === currentActiveTab ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => handleTabClick(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, tab.id)}
            data-state={tab.id === currentActiveTab ? 'active' : 'inactive'}
            className={`${baseTabStyles} ${variantStyles[variant].tab} ${sizeStyles[size]}`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      <div className={`mt-4 ${tabContentClassName}`}>
        {activeTabData && (
          <div
            key={activeTabData.id}
            role="tabpanel"
            id={`tabpanel-${activeTabData.id}`}
            aria-labelledby={`tab-${activeTabData.id}`}
            tabIndex={0}
          >
            {activeTabData.content}
          </div>
        )}
      </div>
    </div>
  );
}
