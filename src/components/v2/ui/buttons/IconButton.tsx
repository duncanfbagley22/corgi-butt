'use client'

import React from 'react'
import { clsx } from 'clsx'

interface IconButtonProps {
  icon: React.ReactNode
  color?: string // hex or CSS color string, e.g. "#1E90FF"
  onClick?: () => void
  disabled?: boolean
  rounded?: boolean
  shadow?: boolean
  size?: number // Size of the square button in pixels
  className?: string
}

export default function IconButton({
  icon,
  color = '#2563eb',
  onClick,
  disabled = false,
  rounded = true,
  shadow = true,
  size = 48,
  className,
}: IconButtonProps) {
  const isDisabled = disabled

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
        className
      )}
      style={{
        backgroundColor: color,
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      {icon}
    </button>
  )
}