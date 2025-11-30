import React from "react";
import { clsx } from "clsx";

interface DropdownProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  focusRingColor?: string;
  id?: string; // Add optional id prop
}

export default function Dropdown({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  options,
  name,
  required = false,
  disabled = false,
  className,
  focusRingColor = "#DB783B",
  id, // Accept id prop
}: DropdownProps) {
  // Generate stable ID: use provided id, or create one from label, or undefined
  const selectId =
    id ||
    (label
      ? `dropdown-${label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`
      : undefined);

  return (
    <div className="flex flex-col gap-2" style={{ width: "100%" }}>
      {/* Label */}
      {label && (
        <label
          htmlFor={selectId}
          className={clsx(
            "text-sm font-medium",
            disabled ? "text-gray-400" : "text-white"
          )}
        >
          {label}
        </label>
      )}

      {/* Select Container */}
      <div className="relative">
<select
  id={selectId}
  name={name}
  value={value}
  onChange={onChange}
  onBlur={onBlur}
  onFocus={onFocus}
  disabled={disabled}
  required={required}
  style={
    { "--focus-ring-color": focusRingColor } as React.CSSProperties
  }
  className={clsx(
    "w-full px-4 py-2 text-base rounded-md transition-all duration-200",
    "bg-white text-gray-900 border-2 outline-none",
    "appearance-none cursor-pointer",
    "overflow-hidden whitespace-nowrap text-ellipsis",

    // Hover
    !disabled && "hover:border-gray-400",

    // Focus ring + border color (shared style)
    !disabled && [
      "focus:border-[color:var(--focus-ring-color)]",
      "focus:ring-2",
      "focus:ring-[color:var(--focus-ring-color)]/30",
    ],

    // Disabled
    disabled && "bg-gray-100 cursor-not-allowed opacity-50",

    className
  )}
>
  {placeholder && (
    <option value="" disabled>
      {placeholder}
    </option>
  )}
  {options.map((option) => (
    <option key={option.value} value={option.value}>
      {option.label}
    </option>
  ))}
</select>


        {/* Dropdown Arrow Icon */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
