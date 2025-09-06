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
  title = "Apartment Floorplan",
  width = 800,
  height = 600,
}: FloorplanProps) {
  return (
    <div className="flex flex-col items-center p-8">
      {title && <h1 className="text-3xl font-bold mb-6">{title}</h1>}

      <div
        className="relative border border-gray-400 dark:border-zinc-600 rounded-lg bg-gray-50 dark:bg-zinc-900 floorplan-container"
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
