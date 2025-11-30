"use client";

import React, { useId } from "react";
import { clsx } from "clsx";

interface InputProps {
  label?: string;
  placeholder?: string;
  type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "tel"
    | "url"
    | "search"
    | "textarea";
  value?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onBlur?: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onFocus?: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  icon?: boolean;
  iconComponent?: React.ReactNode;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  autoComplete?: string;
  maxLength?: number;
  rows?: number; 
  width?: string;
  focusRingColor?: string;
  className?: string;
}

export default function Input({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  onBlur,
  onFocus,
  icon = false,
  iconComponent,
  error,
  disabled = false,
  required = false,
  name,
  id,
  autoComplete,
  maxLength,
  rows = 4,
  width = "100%",
  focusRingColor = "#2563eb", // default Tailwind blue-600
  className,
}: InputProps) {
  const generatedId = useId();
  const inputId = id || `input-${generatedId}`;
  const hasError = !!error;
  const isTextarea = type === "textarea";

  const sharedStyles = clsx(
    "w-full px-4 py-2 text-base rounded-md transition-all duration-200 bg-white border-2 outline-none",
    "placeholder:text-gray-400",
    icon && iconComponent && !isTextarea && "pl-10",
    !hasError &&
      !disabled && [
        "border-gray-300",
        "focus:border-[color:var(--focus-ring-color)]",
        "focus:ring-2",
        "focus:ring-[color:var(--focus-ring-color)]/30",
      ],
    hasError &&
      "border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200",
    disabled && "bg-gray-100 cursor-not-allowed opacity-60",
    !disabled && "hover:border-gray-400"
  );

  return (
    <div className={clsx("flex flex-col gap-1", className)} style={{ width }}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className={clsx(
            "text-sm font-medium",
            hasError ? "text-red-600" : "text-white",
            disabled && "opacity-50"
          )}
        >
          {label}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Icon - only show for regular inputs, not textarea */}
        {icon && iconComponent && !isTextarea && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-black pointer-events-none">
            {iconComponent}
          </div>
        )}

        {/* Conditional rendering: textarea or input */}
        {isTextarea ? (
          <textarea
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            maxLength={maxLength}
            rows={rows}
            style={
              {
                "--focus-ring-color": focusRingColor,
              } as React.CSSProperties
            }
            className={clsx(sharedStyles, "resize-y min-h-[80px]")}
          />
        ) : (
          <input
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={
              onChange as (e: React.ChangeEvent<HTMLInputElement>) => void
            }
            onBlur={onBlur as (e: React.FocusEvent<HTMLInputElement>) => void}
            onFocus={onFocus as (e: React.FocusEvent<HTMLInputElement>) => void}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            autoComplete={autoComplete}
            maxLength={maxLength}
            style={
              {
                "--focus-ring-color": focusRingColor,
              } as React.CSSProperties
            }
            className={sharedStyles}
          />
        )}
      </div>

      {/* Error Message */}
      {hasError && (
        <span className="text-sm text-red-600 flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
}
