'use client'

import React, { useId } from 'react'
import { clsx } from 'clsx'
import { theme } from "../../../../config/theme";

interface Tag {
  id: string
  label: string
  icon?: React.ReactNode
  color?: string // hex color from theme.colors
}

interface TagDisplayProps {
  label?: string
  tags?: Tag[]
  error?: string
  disabled?: boolean
  id?: string
  width?: string
  className?: string
}

export default function TagDisplay({
  label,
  tags = [],
  error,
  disabled = false,
  id,
  width = '100%',
  className,
}: TagDisplayProps) {
  const generatedId = useId()
  const displayId = id || `tag-display-${generatedId}`
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

      {/* tag Container */}
      <div
        id={displayId}
        className={clsx(
          'w-full px-4 py-2 rounded-md bg-white border-2 overflow-x-auto',
          hasError ? 'border-red-500' : 'border-gray-300',
          disabled && 'bg-gray-100 opacity-60'
        )}
        style={{
          minHeight: '42px', // matches the input height
        }}
      >
        {tags.length > 0 ? (
          <div className="flex gap-2 flex-nowrap">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className={clsx(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap',
                  'text-white'
                )}
                style={{
                  backgroundColor: theme.colors.secondary || '#6b7280',
                }}
              >
                {tag.icon && (
                  <span className="flex-shrink-0">{tag.icon}</span>
                )}
                <span>{tag.label}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-base">—</div>
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
  )
}