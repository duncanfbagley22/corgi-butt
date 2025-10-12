// components/ui/floorplan/ItemCard.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar, CircleUserRound, Clock, X } from 'lucide-react'
import type { Item } from '@/types/floorplan'
import { getItemStatus } from '@/utils/itemstatus'
import { getIconComponent } from '@/lib/getIconComponent'

const statusStyles: Record<string, string> = {
  "done": "border-green-500 border-4 bg-green-50 dark:bg-green-900/20",
  "soon": "border-yellow-500 border-4 bg-yellow-50 dark:bg-yellow-900/20",
  "due": "border-orange-500 border-4 bg-orange-50 dark:bg-orange-900/20",
  "overdue": "border-red-600 border-4 bg-red-50 dark:bg-red-900/30"
}

interface ItemCardProps {
  item: Item
  showCompletion?: boolean
  onRename?: (id: string, newName: string) => void
  onDelete?: (id: string) => void
  onItemClick?: (item: Item) => void
  onMarkIncomplete?: (id: string) => void
  editMode?: boolean
  size?: number
}

export function ItemCard({
  item,
  size=208,
  showCompletion = false,
  onRename,
  onDelete,
  onItemClick,
  onMarkIncomplete,
  editMode = false,
}: ItemCardProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(item.name)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [isLongPressing, setIsLongPressing] = useState(false)
  // Tooltip handlers

  useEffect(() => {
    setName(item.name)
  }, [item.name])

  const saveName = () => {
    if (onRename) {
      onRename(item.id, name)
    }
    setEditing(false)
  }

  const handleClick = () => {
    if (editing || isLongPressing || showCompletion) return
    if (onItemClick) {
      onItemClick(item)
    }
  }

  const handleTouchStart = () => {
    if (!item.last_completed || editMode || editing || showCompletion) return
    setIsLongPressing(false)
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPressing(true)
      if (onMarkIncomplete) {
        onMarkIncomplete(item.id)
      }
    }, 800)
  }

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    setTimeout(() => setIsLongPressing(false), 100)
  }

  const handleMouseDown = () => {
    if (!item.last_completed || editMode || editing || showCompletion) return
    
    setIsLongPressing(false)
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPressing(true)
      if (onMarkIncomplete) {
        onMarkIncomplete(item.id)
      }
    }, 800)
  }

  const handleMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    setTimeout(() => setIsLongPressing(false), 100)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm(`Delete "${item.name}"?`) && onDelete) {
      onDelete(item.id)
    }
  }

  const IconComponent = item.icon ? getIconComponent(item.icon, 'task') : null

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleDateString()
  }

  const getCompletedByName = () => {
    if (!item.last_completed_by_user) return "Unknown"
    return item.last_completed_by_user.display_name || 
           item.last_completed_by_user.full_name || 
           "Unknown"
  }

const lastCompleted = item.last_completed || null

let status: keyof typeof statusStyles

if (
  typeof item.forced_completion_status === "string" &&
  item.forced_completion_status in statusStyles
) {
  status = item.forced_completion_status as keyof typeof statusStyles
} else {
  status = getItemStatus(lastCompleted, item.frequency)
}
  const styleClasses = statusStyles[status] || statusStyles["due"] // fallback

  return (
    <div
      className={`relative w-36 h-36 cursor-pointer group ${
        editMode ? 'animate-wiggle' : ''
      }`}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        WebkitUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
    >
      <div
        className={`flex flex-col items-center justify-center hover:scale-105 transform transition-transform duration-200 border rounded-2xl shadow-sm ${styleClasses} w-full h-full p-4`}
      >
        {showCompletion ? (
          // Completion view
          <>
            <div className="flex flex-col items-center mb-2">
              <h3 className="font-semibold text-center text-sm leading-tight"
              style={{ fontSize: size / 10, fontFamily: 'DM Sans, sans-serif' }}>
                {item.name}
              </h3>
            </div>

            <div className="flex flex-col gap-1 w-full items-center">
              {/* Frequency Pill */}
              <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 
                              rounded-full text-xs font-medium flex items-center gap-1">
                <Clock size={12} />
                {item.frequency}
              </div>

              {/* Last Completed Pill */}
              <div className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 
                              rounded-full text-xs font-medium text-center flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(lastCompleted)}
              </div>

              {/* Completed By Pill */}
              {lastCompleted && item.last_completed_by_user && (
                <div className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 
                                rounded-full text-xs font-medium text-center flex items-center gap-1 max-w-full">
                  <CircleUserRound size={12} />
                  <span className="truncate">
                    {getCompletedByName()}
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          // Regular item view
          <>
            {editing ? (
              <input
                className="border rounded px-2 py-1 text-sm dark:bg-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
              />
            ) : (
              <>
                          {/* Icon with subtle drop shadow */}
          <div className="text-gray-800 dark:text-gray-100 mb-3 drop-shadow-md" style={{ fontSize: size / 4 }}>
            {IconComponent ? <IconComponent size={size / 4} strokeWidth={1.5} /> : '...'}
          </div>
                <span className="text-lg font-semibold text-center"
                style={{ fontSize: size / 10, fontFamily: 'DM Sans, sans-serif' }}>
                  {name}
                </span>
              </>
            )}

            {/* Delete button - only visible on hover in edit mode */}
            {editMode && (
              <button
                onClick={handleDelete}
          className="absolute top-2 right-2 md:bg-red-500 bg-red-400 text-white rounded-full
                     md:opacity-0 group-hover:opacity-90 hover:opacity-100 transition-all
                     flex items-center justify-center hover:bg-red-600 cursor-pointer
                     shadow-lg hover:scale-110 transform duration-200"
          style={{ width: size / 6, height: size / 6 }}
        >
          <X size={size / 10} className="pointer-events-none" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}