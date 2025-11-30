// TaskCard.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'
import type { TaskStatus } from '@/utils/taskstatus'
import { theme } from "../../../../../config/theme";

interface TaskCardProps {
  icon?: React.ReactNode
  taskName: string
  roomArea?: string
  status?: TaskStatus
  onClick?: () => void
  onComplete?: () => void
  className?: string
  backgroundColor?: string
  hoverEffect?: boolean
  padding?: string
  shadow?: boolean
  borderRadius?: string
  width?: string | number
  height?: string | number
  border?: boolean
}

export default function TaskCard({
  icon,
  taskName,
  roomArea,
  status = 'neutral',
  onClick,
  onComplete,
  className,
  backgroundColor = theme.colors.primary,
  hoverEffect = true,
  padding = '1.5rem',
  shadow = true,
  borderRadius = '1.5rem',
  width = 'auto',
  height = 'auto',
  border = false,
}: TaskCardProps) {
  const widthValue = typeof width === 'number' ? `${width}px` : width
  const heightValue = typeof height === 'number' ? `${height}px` : height
  
  const [isDragging, setIsDragging] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [isIconHovered, setIsIconHovered] = useState(false)
  const startX = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Split roomArea by " - " to get room and area separately
  const [room, area] = roomArea?.split(' - ') || ['', '']

  // Get status color
  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case 'complete':
        return theme.colors.cardGreen // green
      case 'soon':
        return theme.colors.cardYellow // yellow
      case 'due':
        return theme.colors.cardRed // red
      case 'overdue':
        return theme.colors.cardDarkRed // dark red
      case 'neutral':
      default:
        return theme.colors.cardWhite // white
    }
  }

  const statusColor = getStatusColor(status)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    startX.current = e.clientX - dragX
    e.stopPropagation()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const containerWidth = containerRef.current?.offsetWidth || 0
    const maxDrag = containerWidth - 100
    const newX = e.clientX - startX.current
    setDragX(Math.max(0, Math.min(newX, maxDrag)))
  }

  const isNearTarget = () => {
    const containerWidth = containerRef.current?.offsetWidth || 0
    const threshold = containerWidth * 0.7
    return dragX > threshold
  }

  const handleMouseUp = () => {
    if (isDragging) {
      const containerWidth = containerRef.current?.offsetWidth || 0
      const threshold = containerWidth * 0.7
      if (dragX > threshold && onComplete) {
        onComplete()
      }
      setDragX(0)
      setIsDragging(false)
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
    startX.current = e.touches[0].clientX - dragX
    e.stopPropagation()
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    if (!isDragging) return
    const containerWidth = containerRef.current?.offsetWidth || 0
    const maxDrag = containerWidth - 100
    const newX = e.touches[0].clientX - startX.current
    setDragX(Math.max(0, Math.min(newX, maxDrag)))
  }

  const handleTouchEnd = () => {
    if (isDragging) {
      const containerWidth = containerRef.current?.offsetWidth || 0
      const threshold = containerWidth * 0.7
      if (dragX > threshold && onComplete) {
        onComplete()
      }
      setDragX(0)
      setIsDragging(false)
    }
  }

useEffect(() => {
  const preventTouch = (e: TouchEvent) => {
    // only block vertical scroll while dragging horizontally
    // allow other touches if not dragging
    if (isDragging) e.preventDefault();
  };

  if (isDragging) {
    // passive: false is required so preventDefault works
    document.addEventListener("touchmove", preventTouch, { passive: false });
  } else {
    document.removeEventListener("touchmove", preventTouch);
  }

  return () => {
    document.removeEventListener("touchmove", preventTouch);
  };
}, [isDragging]);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={clsx(
        'transition-all duration-300 gap-2 relative overflow-hidden select-none',
        'flex flex-col',
        shadow && 'shadow-md',
        hoverEffect && !isDragging && 'hover:scale-[1.03] hover:shadow-lg hover:-translate-y-1',
        border && 'border border-gray-600',
        'cursor-pointer',
        className
      )}
      style={{
        backgroundColor,
        padding,
        borderRadius,
        width: widthValue,
        height: heightValue,
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* Blur overlay when dragging */}
      <div 
        className={clsx(
          'absolute inset-0 backdrop-blur-sm bg-black/20 transition-opacity duration-200 pointer-events-none rounded-[inherit] flex items-center justify-center',
          (isDragging || isIconHovered) ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Guide Box on the right */}
        <div 
          className={clsx(
            "absolute right-6 top-1/2 -translate-y-1/2 w-16 h-15.5 border-2 border-dashed rounded-2xl transition-colors duration-200",
            isNearTarget() ? "border-green-400 bg-green-400/20" : "border-white/40"
          )}
        />
        
        {/* Arrow and text */}
        <div className="flex flex-col items-center gap-2">
          <svg 
            className="w-12 h-12 text-white/80"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17 8l4 4m0 0l-4 4m4-4H3" 
            />
          </svg>
          <span className="text-white/80 text-sm font-medium">Slide to Complete</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Draggable Icon Container */}
        <div 
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onMouseEnter={() => setIsIconHovered(true)}
          onMouseLeave={() => setIsIconHovered(false)}
          className={clsx(
            "rounded-2xl p-4 flex-shrink-0 w-16 h-16 flex items-center justify-center relative z-10",
            (isDragging || isIconHovered) && "cursor-grab active:cursor-grabbing shadow-lg"
          )}
          style={{
            transform: `translateX(${dragX}px)`,
            backgroundColor: isNearTarget() ? '#42B94A' : (isDragging || isIconHovered) ? statusColor : statusColor,
            transition: isDragging ? 'none' : 'all 0.3s ease-out',
          }}
        >
          {icon || (
            <svg
              className={clsx(
                "w-8 h-8 transition-colors duration-300",
                (isDragging || isIconHovered) ? "text-white" : "text-gray-900"
              )}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
            </svg>
          )}
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white text-2xl font-medium mb-0.5 truncate">
            {taskName}
          </h3>
          {roomArea && (
            <div className="text-slate-400 text-base leading-tight">
              {room && <div className="truncate">{room}</div>}
              {area && <div className="truncate">{area}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}