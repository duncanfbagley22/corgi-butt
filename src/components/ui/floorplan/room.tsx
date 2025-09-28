'use client'

import { useState, useEffect, useRef } from 'react'
import { Rnd } from 'react-rnd'
import { LucideIcon, X} from 'lucide-react' // import for typing


interface RoomProps {
  id: string
  name: string
  icon?: LucideIcon
  size?: string
  leftPercent: number
  topPercent: number
  widthPercent: number
  heightPercent: number
  onUpdate: (id: string, left: number, top: number, width: number, height: number) => void
  onDelete?: (id: string) => void
  onClick?: (id: string, name: string) => void
  gridSize?: number
  editMode: boolean
}

export default function Room({
  id,
  name,
  icon: IconComponent,
  leftPercent,
  topPercent,
  widthPercent,
  heightPercent,
  onUpdate,
  onDelete,
  onClick,
  gridSize = 20,
  editMode,
}: RoomProps) {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const container = document.querySelector('.floorplan-container') as HTMLElement
    if (container) {
      containerRef.current = container
      setContainerSize({ width: container.clientWidth, height: container.clientHeight })
      
      const resizeObserver = new ResizeObserver(() => {
        setContainerSize({ width: container.clientWidth, height: container.clientHeight })
      })
      resizeObserver.observe(container)
      
      return () => resizeObserver.disconnect()
    }
  }, [])

  const pixelPosition = {
    x: (leftPercent / 100) * containerSize.width,
    y: (topPercent / 100) * containerSize.height,
  }

  const handleClick = (e: React.MouseEvent) => {
    // In edit mode, prevent room navigation on click
    if (!editMode && !isDragging && onClick && !e.defaultPrevented) {
      onClick(id, name)
    }
  }

  return (
    <Rnd
      bounds="parent"
      size={{ width: `${widthPercent}%`, height: `${heightPercent}%` }}
      position={pixelPosition}
      enableResizing={editMode ? {
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
      } : false}
      disableDragging={!editMode}
      dragGrid={editMode ? [gridSize, gridSize] : undefined}
      resizeGrid={editMode ? [gridSize, gridSize] : undefined}
      onDragStart={() => setIsDragging(true)}
      onDragStop={(e, d) => {
        if (!containerRef.current) return
        const newLeft = (d.x / containerRef.current.clientWidth) * 100
        const newTop = (d.y / containerRef.current.clientHeight) * 100
        onUpdate(id, newLeft, newTop, widthPercent, heightPercent)
        setTimeout(() => setIsDragging(false), 100)
      }}
      onResizeStart={() => setIsDragging(true)}
      onResizeStop={(e, direction, ref, delta, pos) => {
        if (!containerRef.current) return
        const newWidth = (ref.offsetWidth / containerRef.current.clientWidth) * 100
        const newHeight = (ref.offsetHeight / containerRef.current.clientHeight) * 100
        const newLeft = (pos.x / containerRef.current.clientWidth) * 100
        const newTop = (pos.y / containerRef.current.clientHeight) * 100
        onUpdate(id, newLeft, newTop, newWidth, newHeight)
        setTimeout(() => setIsDragging(false), 100)
      }}
    >
        <div
          className={`w-full h-full border border-gray-400 dark:border-zinc-600 
                    bg-gray-200 dark:bg-zinc-800 rounded-md flex flex-col 
                    items-center justify-center relative group 
                    hover:bg-gray-300 dark:hover:bg-zinc-700 
                    transform hover:scale-105 transition-transform
                    ${editMode ? 'cursor-move' : 'cursor-pointer'}`}
          onClick={handleClick}
        >
        {/* Icon wrapper */}
        {IconComponent && (
          <div className="mb-1 text-gray-800 dark:text-gray-200">
            <IconComponent size={24} />
          </div>
        )}

        <div className="font-medium text-center">{name}</div>
        
        {/* Delete button - only show in edit mode */}
        {editMode && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              if (window.confirm(`Delete room "${name}"?`)) {
                onDelete(id)
              }
            }}
            className="absolute top-1 right-1 w-5 h-5 bg-red-300 text-white rounded-full 
                       opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity duration-300 
                       hover:bg-red-600 flex items-center justify-center cursor-pointer"         
          >
            <X size={12} className="pointer-events-none" />
          </button>
        )}
      </div>
    </Rnd>
  )
}