'use client';

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  id: string;
  label: string;
  current: string;
  options: DropdownOption[];
  handleChange: (id: string, value: string) => void;
}

export default function Dropdown({
  id,
  label,
  current,
  options,
  handleChange = () => {},
}: DropdownProps) {
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        name={id}
        value={current}
        onChange={(e) => handleChange(id, e.target.value)}
        className="flex h-9 w-full rounded-lg border border-border bg-input-background px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {options.map((option) => (
          <option key={`thrill-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
