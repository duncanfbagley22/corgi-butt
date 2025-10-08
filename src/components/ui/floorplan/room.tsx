'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Rnd } from 'react-rnd'
import { LucideIcon, X} from 'lucide-react'
import * as CustomIcons from '@/components/icons/custom/room-icons'
import { getRoomStatus } from '@/utils/itemstatus'
import type { Subsection } from '@/types/floorplan'

interface RoomProps {
  id: string
  name: string
  icon?: LucideIcon
  size?: string
  leftPercent: number
  topPercent: number
  widthPercent: number
  heightPercent: number
  subsections?: Subsection[]
  onUpdate: (id: string, left: number, top: number, width: number, height: number) => void
  onDelete?: (id: string) => void
  onClick?: (id: string, name: string) => void
  gridSize?: number
  editMode: boolean
}

const STATUS_STYLES: Record<string, { bg: string; border: string; bgDark: string }> = {
  'done': { 
    bg: 'bg-gradient-to-br from-green-50 to-emerald-100', 
    border: 'border-green-400',
    bgDark: 'dark:from-green-950 dark:to-emerald-900'
  },
  'soon': { 
    bg: 'bg-gradient-to-br from-yellow-50 to-amber-100', 
    border: 'border-yellow-400',
    bgDark: 'dark:from-yellow-950 dark:to-amber-900'
  },
  'due': { 
    bg: 'bg-gradient-to-br from-orange-50 to-red-100', 
    border: 'border-orange-400',
    bgDark: 'dark:from-orange-950 dark:to-red-900'
  },
  'overdue': { 
    bg: 'bg-gradient-to-br from-red-50 to-rose-100', 
    border: 'border-red-500',
    bgDark: 'dark:from-red-950 dark:to-rose-900'
  }
}

export default function Room({
  id,
  name,
  icon: IconComponent,
  leftPercent,
  topPercent,
  widthPercent,
  heightPercent,
  subsections = [],
  onUpdate,
  onDelete,
  onClick,
  gridSize = 20,
  editMode,
}: RoomProps) {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [roomSize, setRoomSize] = useState({ width: 0, height: 0 })
  const containerRef = useRef<HTMLElement | null>(null)
  const roomRef = useRef<HTMLDivElement>(null)

  const statusInfo = useMemo(() => {
    return getRoomStatus(subsections)
  }, [subsections])

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

  useEffect(() => {
    if (roomRef.current) {
      setRoomSize({
        width: roomRef.current.offsetWidth,
        height: roomRef.current.offsetHeight
      })
    }
  }, [widthPercent, heightPercent, containerSize])

  const pixelPosition = {
    x: (leftPercent / 100) * containerSize.width,
    y: (topPercent / 100) * containerSize.height,
  }

  const handleClick = (e: React.MouseEvent) => {
    if (!editMode && !isDragging && onClick && !e.defaultPrevented) {
      onClick(id, name)
    }
  }

  const statusStyle = statusInfo.totalItems > 0 
    ? STATUS_STYLES[statusInfo.overallStatus]
    : { bg: 'bg-gray-200', border: 'border-gray-300', bgDark: 'dark:bg-zinc-800' }

  // Calculate dynamic sizes based on room dimensions
  const minDimension = Math.min(roomSize.width, roomSize.height)
  const iconSize = Math.max(24, Math.min(minDimension / 4, 64))
  const fontSize = Math.max(12, Math.min(minDimension / 8, 20))
  const deleteButtonSize = Math.max(20, Math.min(minDimension / 8, 32))
  const deleteIconSize = Math.max(12, Math.min(minDimension / 12, 20))

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
        ref={roomRef}
        className={`w-full h-full rounded-2xl shadow-lg ${statusStyle.bg} ${statusStyle.bgDark}
                  flex flex-col items-center justify-center relative group 
                  transform hover:scale-105 transition-all duration-300
                  border-4 ${statusStyle.border}
                  hover:shadow-2xl backdrop-blur-sm
                  ${editMode ? '' : 'cursor-pointer'}`}
        onClick={handleClick}
      >
        {IconComponent && (
          <div className="text-gray-800 dark:text-gray-100 mb-2 drop-shadow-md">
            <IconComponent style={{ width: iconSize, height: iconSize }}  size={300} strokeWidth={1.5} />
          </div>
        )}

        <div 
          className="font-bold text-center text-gray-800 dark:text-gray-100 px-2"
          style={{ fontSize: `${fontSize}px` }}
        >
          {name}
        </div>
        
        {editMode && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              if (window.confirm(`Delete room "${name}"?`)) {
                onDelete(id)
              }
            }}
            className="absolute bg-red-500 text-white rounded-full 
                       opacity-0 group-hover:opacity-90 hover:opacity-100 transition-all
                       flex items-center justify-center hover:bg-red-600 cursor-pointer
                       shadow-lg hover:scale-110 transform duration-200 border-2 border-white"
            style={{
              width: `${deleteButtonSize}px`,
              height: `${deleteButtonSize}px`,
              top: `${Math.max(4, minDimension / 26)}px`,
              right: `${Math.max(4, minDimension / 26)}px`
            }}
          >
            <X size={deleteIconSize} className="pointer-events-none" />
          </button>
        )}
      </div>
    </Rnd>
  )
}