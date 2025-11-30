'use client'

import React from 'react'
import { clsx } from 'clsx'
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react'

interface ButtonProps {
  color?: string // hex or CSS color string, e.g. "#1E90FF"
  onClick?: () => void
  disabled?: boolean
  rounded?: boolean
  shadow?: boolean
  direction?: 'left' | 'right' | 'up' | 'down'
  size?: number // Size of the square button in pixels
  className?: string
}

export default function ChevronButton({
  color = '#2563eb',
  onClick,
  disabled = false,
  rounded = true,
  shadow = true,
  direction = 'left',
  size = 48,
  className,
}: ButtonProps) {
  const isDisabled = disabled

  // Select the appropriate chevron icon
  const ChevronIcon = {
    left: ChevronLeft,
    right: ChevronRight,
    up: ChevronUp,
    down: ChevronDown,
  }[direction]

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={clsx(
        'flex items-center justify-center transition-all duration-200 cursor-pointer',
        rounded && 'rounded-md',
        shadow && 'shadow-md hover:shadow-lg',
        !isDisabled && 'hover:opacity-90 active:scale-[0.95]',
        isDisabled && 'opacity-50 cursor-not-allowed',
        direction === 'left' && 'pr-1',
        direction === 'right' && 'pl-1',
        direction === 'up' && 'pb-1',
        direction === 'down' && 'pt-0',
        className
      )}
      style={{
        backgroundColor: color,
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <ChevronIcon size={size * 0.8} color="white" />
    </button>
  )
}