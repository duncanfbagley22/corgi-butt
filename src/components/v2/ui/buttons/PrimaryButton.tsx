'use client'

import React from 'react'
import { clsx } from 'clsx'

interface ButtonProps {
  text?: string
  color?: string // hex or CSS color string, e.g. "#1E90FF"
  textColor?: string // also hex or CSS color string
  icon?: boolean
  iconComponent?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  rounded?: boolean
  fullWidth?: boolean
  shadow?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

export default function Button({
  text,
  color = '#2563eb',
  textColor = '#ffffff',
  icon = false,
  iconComponent,
  onClick,
  disabled = false,
  loading = false,
  rounded = true,
  fullWidth = false,
  shadow = true,
  type = 'button',
  className,
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={clsx(
        'flex items-center font-[Poppins] font-bold justify-center gap-2 px-8 py-2 text-2xl transition-all duration-200 cursor-pointer',
        rounded && 'rounded-md',
        fullWidth && 'w-full',
        shadow && 'shadow-md hover:shadow-lg',
        !isDisabled && 'hover:opacity-90 active:scale-[0.95]',
        isDisabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{
        backgroundColor: color,
        color: textColor,
      }}
    >
    {text && <span>{text}</span>}
      {loading ? (
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </span>
      ) : (
        icon && iconComponent && (
          <span className="flex items-center justify-center">{iconComponent}</span>
        )
      )}
    </button>
  )
}