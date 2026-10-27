'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Rnd } from 'react-rnd'
import { X } from 'lucide-react'
import type { Area } from '@/types/floorplan'
import { getIconComponent } from '@/lib/getIconComponent'
import { theme } from "../../../../config/theme";
import { getRoomStatusFromAreas, type RoomStatus } from '@/utils/roomstatus'

interface RoomProps {
  id: string
  name: string
  icon?: string
  size?: string
  leftPercent: number
  topPercent: number
  widthPercent: number
  heightPercent: number
  areas?: Area[]
  onUpdate: (id: string, left: number, top: number, width: number, height: number) => void
  onDelete?: (id: string) => void
  onClick?: (id: string, name: string) => void
  gridSize?: number
  editMode: boolean
}

const STATUS_COLORS: Record<RoomStatus, string> = {
  'complete': theme.colors.cardGreen,
  'soon': theme.colors.cardYellow,
  'due': theme.colors.cardRed,
  'overdue': theme.colors.cardDarkRed,
  'neutral': '#FFFFFF'
}

export default function Room({
  id,
  name,
  icon,
  leftPercent,
  topPercent,
  widthPercent,
  heightPercent,
  areas = [],
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
    const areasWithTasks = areas.map(area => ({
      id: area.id,
      name: area.name,
      room_id: area.room_id ?? id,
      tasks: (area.tasks || []).map(task => ({
        id: task.id,
        last_completed: task.last_completed ?? null,
        frequency: typeof task.frequency === 'string' ? parseInt(task.frequency, 10) : task.frequency,
        forced_marked_incomplete: task.forced_marked_incomplete,
        forced_completion_status: task.forced_completion_status as "soon" | "due" | "overdue" | null || null,
      }))
    }))
    return getRoomStatusFromAreas(areasWithTasks)
  }, [areas, id])

  const IconComponent = icon ? getIconComponent(icon, 'room') : undefined

  // Container resize observer
  useEffect(() => {
    const container = document.querySelector('.floorplan-container') as HTMLElement
    if (container) {
      containerRef.current = container
      const updateSize = () => {
        setContainerSize({ width: container.clientWidth, height: container.clientHeight })
      }
      updateSize()
      
      const resizeObserver = new ResizeObserver(updateSize)
      resizeObserver.observe(container)
      return () => resizeObserver.disconnect()
    }
  }, [])

  // Measure room size with ResizeObserver
  useEffect(() => {
    if (!roomRef.current) return
    
    const updateRoomSize = () => {
      if (roomRef.current) {
        setRoomSize({
          width: roomRef.current.offsetWidth,
          height: roomRef.current.offsetHeight
        })
      }
    }
    
    updateRoomSize()
    const resizeObserver = new ResizeObserver(updateRoomSize)
    resizeObserver.observe(roomRef.current)
    
    return () => resizeObserver.disconnect()
  }, [])

  // Also update room size when container size or percentages change
  useEffect(() => {
    if (roomRef.current) {
      setRoomSize({
        width: roomRef.current.offsetWidth,
        height: roomRef.current.offsetHeight
      })
    }
  }, [containerSize.width, containerSize.height, widthPercent, heightPercent])

  const pixelPosition = {
    x: (leftPercent / 100) * containerSize.width,
    y: (topPercent / 100) * containerSize.height,
  }

  const handleClick = (e: React.MouseEvent) => {
    if (!editMode && !isDragging && onClick && !e.defaultPrevented) {
      onClick(id, name)
    }
  }

  const statusStyle = STATUS_COLORS[statusInfo]

  // Calculate dimensions based on actual or estimated room size
  const effectiveWidth = roomSize.width || (widthPercent / 100) * containerSize.width
  const effectiveHeight = roomSize.height || (heightPercent / 100) * containerSize.height
  const minDimension = Math.min(effectiveWidth, effectiveHeight)
  
  // Improved scaling with better min/max bounds
  const iconSize = Math.max(20, Math.min(minDimension * 0.35, 80))
  const fontSize = Math.max(10, Math.min(minDimension * 0.15, 24))
  const deleteButtonSize = Math.max(24, Math.min(minDimension * 0.2, 40))
  const deleteIconSize = Math.max(14, Math.min(minDimension * 0.12, 24))
  
  // Calculate padding to ensure text doesn't overflow
  const horizontalPadding = Math.max(8, effectiveWidth * 0.05)

  return (
    <Rnd
      bounds="parent"
      size={{ width: `${widthPercent}%`, height: `${heightPercent}%` }}
      position={pixelPosition}
      enableResizing={editMode ? {
        top: true, right: true, bottom: true, left: true,
        topRight: true, bottomRight: true, bottomLeft: true, topLeft: true
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
        style={{
          backgroundColor: statusStyle,
        }}
        className={`w-full h-full rounded-2xl shadow-lg
                  flex flex-col items-center justify-center relative group 
                  transform hover:scale-105 transition-all duration-300
                  hover:shadow-2xl backdrop-blur-sm
                  ${editMode ? '' : 'cursor-pointer'}`}
        onClick={handleClick}
      >
        {IconComponent && (
          <div 
            className="text-gray-800 dark:text-gray-100 drop-shadow-md flex-shrink-0"
            style={{ 
              marginBottom: `${Math.max(4, minDimension * 0.05)}px`,
              fontSize: `${iconSize}px`,
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IconComponent strokeWidth={1.5} />
          </div>
        )}

        <div 
          className="font-bold text-center text-gray-800 dark:text-gray-100 leading-tight"
          style={{ 
            fontSize: `${fontSize}px`,
            paddingLeft: `${horizontalPadding}px`,
            paddingRight: `${horizontalPadding}px`,
            maxWidth: '100%',
            wordBreak: 'break-word',
            hyphens: 'auto'
          }}
        >
          {name}
        </div>
        
        {editMode && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              if (window.confirm(`Delete room "${name}"?`)) onDelete(id)
            }}
            className="absolute bg-red-500 text-white rounded-full 
                       opacity-0 group-hover:opacity-90 hover:opacity-100 transition-all
                       flex items-center justify-center hover:bg-red-600 cursor-pointer
                       shadow-lg hover:scale-110 transform duration-200 border-2 border-white"
            style={{
              width: `${deleteButtonSize}px`,
              height: `${deleteButtonSize}px`,
              top: `${Math.max(6, minDimension * 0.08)}px`,
              right: `${Math.max(6, minDimension * 0.08)}px`
            }}
          >
            <X size={deleteIconSize} className="pointer-events-none" />
          </button>
        )}
      </div>
    </Rnd>
  )
}