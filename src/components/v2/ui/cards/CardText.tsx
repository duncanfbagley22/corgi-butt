'use client'

import React from 'react'
import { clsx } from 'clsx'
import { Info } from 'lucide-react' // Example icon

interface CardTextProps {
  text: string
  textColor?: string
  backgroundColor?: string
  buttonColor?: string
  className?: string
  onButtonClick?: () => void
}

export default function CardText({
  text,
  textColor = '#000000',
  backgroundColor = '#ffffff',
  className,
  onButtonClick,
}: CardTextProps) {
  return (
    <div className={clsx('w-full relative group', className)}>
      {/* Text container */}
      <div
        className={clsx(
          'w-full flex items-center justify-center rounded-lg px-4 py-1',
          'group-hover:w-[70%]',
          'transition-all duration-300 overflow-hidden'
        )}
        style={{ backgroundColor }}
      >
<span
  className={clsx(
    'text-center font-semibold text-[10px] sm:text-base whitespace-nowrap overflow-hidden text-ellipsis',
    'transition-all duration-300'
  )}
  style={{ color: textColor }}
>
          {text}
        </span>
      </div>

      {/* Hover Button */}
      <button
        onClick={onButtonClick}
        className={clsx(
          'absolute top-1/2 right-2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center',
          'bg-white text-black opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer hover:scale-110 hover:shadow-md'
        )}
      >
        <Info size={24} />
      </button>
    </div>
  )
}
