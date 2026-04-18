'use client';

interface CheckboxProps {
  label: string;
  id: string;
  field?: string;
  value: string | boolean;
  isChecked: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  handleChange: (
    id: string,
    value: string | boolean,
    isChecked: boolean
  ) => void;
}

export default function Checkbox({
  id,
  label,
  field,
  value,
  isChecked = false,
  isRequired = false,
  isDisabled = false,
  handleChange = () => {},
}: CheckboxProps) {
  const dataField = field || id;
  return (
    <div className="flex items-center space-x-2">
      <input
        id={id}
        name={id}
        type="checkbox"
        checked={isChecked}
        onChange={(e) => handleChange(dataField, value, e.target.checked)}
        required={isRequired}
        disabled={isDisabled}
      />
      <label htmlFor={id} className="cursor-pointer">
        {label}
      </label>
    </div>
  );
}
