'use client'

import { ReactNode } from 'react'

interface FloorplanProps {
  children?: ReactNode
  gridSize?: number // optional grid size in px
  title?: string // optional custom title
  width?: number // pixel width of container
  height?: number // pixel height of container
  backgroundColor?: string // hex or CSS color string
}

export default function Floorplan({
  children,
  gridSize = 20,
  width = 800,
  height = 600,
  backgroundColor = '#ffffff',
}: FloorplanProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative rounded-lg floorplan-container"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: backgroundColor,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          backgroundImage:
            'linear-gradient(to right, rgba(0,0,0,0.15) 1px, transparent 1px), ' +
            'linear-gradient(to bottom, rgba(0,0,0,0.15) 1px, transparent 1px)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        }}
      >
        {children}
      </div>
    </div>
  )
}