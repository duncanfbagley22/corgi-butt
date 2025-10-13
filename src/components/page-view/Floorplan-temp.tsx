'use client'

import { ReactNode } from 'react'

interface FloorplanProps {
  children?: ReactNode
  gridSize?: number // optional grid size in px
  title?: string // optional custom title
  width?: number // pixel width of container
  height?: number // pixel height of container
}

export default function Floorplan({
  children,
  gridSize = 20,
  width = 800,
  height = 600,
}: FloorplanProps) {
  return (
    <div className="flex flex-col items-center p-8 pt-1.5">
      <div
        className="relative border-2 border-gray-500 dark:border-zinc-500 rounded-lg bg-gray-50 dark:bg-zinc-900 floorplan-container"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          backgroundImage:
            'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), ' +
            'linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)',
        }}
      >
        {children}
      </div>
    </div>
  )
}
