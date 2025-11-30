"use client";

import React, { useId } from "react";
import { clsx } from "clsx";

interface FrequencyOption {
  value: number;
  label: string;
}

interface FrequencySelectorProps {
label?: React.ReactNode;
  value?: number;
  onChange?: (value: number) => void;
  options?: FrequencyOption[];
  disabled?: boolean;
  focusRingColor?: string;
  backgroundColor?: string;
  width?: string;
  className?: string;
}

const DEFAULT_OPTIONS: FrequencyOption[] = [
  { value: 1, label: "Daily" },
  { value: 7, label: "1 Week" },
  { value: 14, label: "2 Weeks" },
  { value: 30, label: "Monthly" },
  { value: 90, label: "Quarterly" },
];

export default function FrequencySelector({
  label,
  value = 7,
  onChange,
  options = DEFAULT_OPTIONS,
  disabled = false,
  focusRingColor = "#2563eb",
  width = "100%",
  className,
}: FrequencySelectorProps) {
  const generatedId = useId();
  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const currentIndex = selectedIndex >= 0 ? selectedIndex : 0;

  const handleChange = (optionValue: number) => {
    if (!disabled) {
      onChange?.(optionValue);
    }
  };

  const segmentWidth = 100 / options.length;
  const backgroundPosition = currentIndex * segmentWidth;

  return (
    <div className={clsx("flex flex-col gap-2", className)} style={{ width }}>
      {/* Label */}
      {label && (
        <label
          className={clsx(
            "text-sm font-medium text-white",
            disabled && "opacity-50"
          )}
        >
          {label}
        </label>
      )}

      {/* Switch Container */}
      <div
        className={clsx(
          "relative flex items-center rounded-full border-2 h-12 overflow-hidden bg-white",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        style={{
          borderColor: focusRingColor,
        }}
      >
        {/* Sliding Background */}
        <div
          className="absolute top-1 bottom-1 rounded-full transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
          style={{
            backgroundColor: focusRingColor,
            width: `calc(${segmentWidth}% - 8px)`,
            left: `calc(${backgroundPosition}% + 4px)`,
          }}
        />

        {/* Options */}
        {options.map((option, index) => {
          const isSelected = option.value === value;
          const inputId = `${generatedId}-option-${index}`;

          return (
            <React.Fragment key={option.value}>
              <input
                type="radio"
                id={inputId}
                name={`frequency-${generatedId}`}
                value={option.value}
                checked={isSelected}
                onChange={() => handleChange(option.value)}
                disabled={disabled}
                className="hidden"
              />
              <label
                htmlFor={inputId}
                className={clsx(
                  "flex-1 text-center cursor-pointer relative z-10 transition-all duration-500 text-base font-medium",
                  isSelected ? "text-white font-bold" : "text-black",
                  disabled && "cursor-not-allowed"
                )}
              >
                <>
                  {/* Mobile: show number of days */}
                  <span className="inline sm:hidden">{option.value}</span>

                  {/* Desktop: show full label */}
                  <span className="hidden sm:inline">{option.label}</span>
                </>
              </label>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
