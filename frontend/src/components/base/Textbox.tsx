'use client';

interface TextboxProps {
  id: string;
  label: string;
  value?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  handleChange: (id: string, value: string) => void;
}

export default function Textbox({
  id,
  label,
  value = '',
  isRequired = false,
  isDisabled = false,
  handleChange = () => {},
}: TextboxProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id}>{label}</label>
      <input
        className="flex h-9 w-full rounded-lg border border-border bg-input-background px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        id={id}
        name={id}
        type="text"
        value={value}
        onChange={(e) => handleChange(id, e.target.value)}
        required={isRequired}
        disabled={isDisabled}
      />
    </div>
  );
}
