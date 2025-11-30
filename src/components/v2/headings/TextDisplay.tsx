'use client'

import React, { useId } from 'react'
import { clsx } from 'clsx'

interface TextDisplayProps {
  label?: string
  value?: string
  icon?: boolean
  iconComponent?: React.ReactNode
  error?: string
  disabled?: boolean
  name?: string
  id?: string
  width?: string // e.g. "300px" or "50%"
  className?: string
}

export default function TextDisplay({
  label,
  value,
  icon = false,
  iconComponent,
  error,
  disabled = false,
  id,
  width = '100%',
  className,
}: TextDisplayProps) {
  const generatedId = useId()
  const displayId = id || `text-display-${generatedId}`
  const hasError = !!error

  return (
    <div
      className={clsx('flex flex-col gap-1', className)}
      style={{ width }}
    >
      {/* Label */}
      {label && (
        <label
          htmlFor={displayId}
          className={clsx(
            'text-sm font-medium',
            hasError ? 'text-red-600' : 'text-white',
            disabled && 'opacity-50'
          )}
        >
          {label}
        </label>
      )}

      {/* Display Container */}
      <div className="relative">
        {/* Icon */}
        {icon && iconComponent && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-black pointer-events-none">
            {iconComponent}
          </div>
        )}

        {/* Text Display Field */}
        <div
          id={displayId}
          className={clsx(
            'w-full px-4 py-2 text-base rounded-md bg-white border-2',
            icon && iconComponent && 'pl-10',
            hasError ? 'border-red-500' : 'border-gray-300',
            disabled && 'bg-gray-100 opacity-60',
            'text-gray-900'
          )}
        >
          {value || <span className="text-gray-400">—</span>}
        </div>
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
  )
}