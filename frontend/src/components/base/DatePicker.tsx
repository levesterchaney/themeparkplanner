'use client';

import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { clsx } from 'clsx';

interface DatePickerProps {
  id: string;
  label: string;
  value?: Date | undefined;
  isRequired?: boolean;
  isDisabled?: boolean;
  placeholder?: string;
  handleChange: (id: string, value: Date | undefined) => void;
}

export default function DatePicker({
  id,
  label,
  value,
  isRequired = false,
  isDisabled = false,
  placeholder = 'Select a date',
  handleChange,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    handleChange(id, selectedDate);
    setIsOpen(false);
  };

  const displayValue = value ? format(value, 'MMM dd, yyyy') : '';

  return (
    <div className="relative space-y-2">
      <label htmlFor={id}>{label}</label>

      <button
        ref={buttonRef}
        type="button"
        id={id}
        className={clsx(
          'flex h-9 w-full rounded-lg border border-border bg-input-background px-3 py-1 text-sm transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'text-left',
          !value && 'text-muted-foreground'
        )}
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        disabled={isDisabled}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={value ? `Selected date: ${displayValue}` : 'Select a date'}
      >
        {displayValue || placeholder}
        <svg
          className={clsx(
            'ml-auto h-4 w-4 transition-transform',
            isOpen && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && !isDisabled && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 rounded-lg border border-border bg-white p-4 shadow-lg"
        >
          <DayPicker
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            showOutsideDays
            className="rdp"
            classNames={{
              months:
                'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
              month: 'space-y-4',
              caption: 'flex justify-center pt-1 relative items-center',
              caption_label: 'text-sm font-medium',
              nav: 'space-x-1 flex items-center',
              nav_button:
                'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
              nav_button_previous: 'absolute left-1',
              nav_button_next: 'absolute right-1',
              table: 'w-full border-collapse space-y-1',
              head_row: 'flex',
              head_cell:
                'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]',
              row: 'flex w-full mt-2',
              cell: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
              day: clsx(
                'h-8 w-8 p-0 font-normal aria-selected:opacity-100',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:bg-accent focus:text-accent-foreground',
                'border border-transparent rounded-md'
              ),
              day_selected:
                'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
              day_today: 'bg-accent text-accent-foreground',
              day_outside: 'text-muted-foreground opacity-50',
              day_disabled: 'text-muted-foreground opacity-50',
              day_hidden: 'invisible',
            }}
          />
        </div>
      )}

      <input
        type="hidden"
        name={id}
        value={value ? value.toISOString() : ''}
        required={isRequired}
      />
    </div>
  );
}
