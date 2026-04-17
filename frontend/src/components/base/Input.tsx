'use client';

import { Label } from '@/components';

interface InputProps {
  label: string;
  type: string;
  id: string;
  value: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  handleChange: (field: string, value: string) => void;
}

export default function Input({
  id,
  label,
  type,
  value,
  isRequired = false,
  isDisabled = false,
  handleChange = () => {},
}: InputProps) {
  return (
    <div className="space-y-2">
      <Label text={label} htmlFor={id} />
      <input
        className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={() => handleChange(id, value)}
        required={isRequired}
        disabled={isDisabled}
      />
    </div>
  );
}
