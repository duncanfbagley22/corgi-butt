// CardInfo.tsx
'use client'

import React from 'react'
import { clsx } from 'clsx'

interface CardInfoProps {
  frontContent: React.ReactNode
  backContent?: React.ReactNode
  showBack?: boolean
  className?: string
  bgColor?: string // <-- NEW
}

export default function CardInfo({
  frontContent,
  backContent,
  showBack = false,
  className,
  bgColor = '#FFFFFF', // <-- default to white
}: CardInfoProps) {
  return (
    <div
      className={clsx(
        'relative rounded-2xl text-black overflow-hidden flex-[4]',
        className
      )}
      style={{ backgroundColor: bgColor }} // <-- apply hex bg here
    >
      {showBack && backContent ? (
        <div className="absolute inset-0 flex items-center justify-center">
          {backContent}
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          {frontContent}
        </div>
      )}
    </div>
  )
}
