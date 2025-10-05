// components/ui/floorplan/ItemCard.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import * as LucideIcons from 'lucide-react'
import { Calendar, CircleUserRound, Clock, X } from 'lucide-react'
import type { Item } from '@/types/floorplan'
import { getItemStatus } from '@/utils/itemstatus'

const statusStyles: Record<string, string> = {
  "up-to-date": "border-green-500 border-4 bg-green-50 dark:bg-green-900/20",
  "upcoming": "border-blue-500 border-4 bg-blue-50 dark:bg-blue-900/20",
  "due-soon": "border-yellow-500 border-4 bg-yellow-50 dark:bg-yellow-900/20",
  "overdue": "border-orange-500 border-4 bg-orange-50 dark:bg-orange-900/20",
  "way-overdue": "border-red-600 border-4 bg-red-50 dark:bg-red-900/30",
  "due": "border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800",
}

interface ItemCardProps {
  item: Item
  showCompletion?: boolean
  onRename?: (id: string, newName: string) => void
  onDelete?: (id: string) => void
  onItemClick?: (item: Item) => void
  onMarkIncomplete?: (id: string) => void
  editMode?: boolean
}

export function ItemCard({
  item,
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
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipTimerRef = useRef<NodeJS.Timeout | null>(null)
  // Tooltip handlers
  
  const handleMouseEnter = () => {
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current)
    tooltipTimerRef.current = setTimeout(() => {
      setShowTooltip(true)
    }, 600)
  }

  const handleMouseLeave = () => {
    // Tooltip hide
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current)
      tooltipTimerRef.current = null
    }
    setShowTooltip(false)
    // Long press logic
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    setTimeout(() => setIsLongPressing(false), 100)
  }

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

  const IconComponent =
    item.icon && LucideIcons[item.icon as keyof typeof LucideIcons]
      ? (LucideIcons[item.icon as keyof typeof LucideIcons] as any)
      : LucideIcons.Package

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
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <div
        className={`flex flex-col items-center justify-center hover:scale-105 transform transition-transform duration-200 border rounded-2xl shadow-sm ${styleClasses} w-full h-full p-4`}
      >
        {/* Tooltip */}
        {showTooltip && item.description && (
          <div
            className="absolute z-50 left-1/2 -translate-x-1/2 -top-10 bg-black text-white text-xs rounded px-2 py-1 shadow-lg whitespace-pre-line max-w-xs"
            style={{ pointerEvents: 'none' }}
          >
            {item.description}
          </div>
        )}
        {showCompletion ? (
          // Completion view
          <>
            <div className="flex flex-col items-center mb-2">
              <h3 className="font-semibold text-center text-sm leading-tight">
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
                autoFocus
              />
            ) : (
              <>
                <IconComponent className="w-10 h-10 mb-2 text-black-500" />
                <span className="text-lg font-semibold text-center">
                  {name}
                </span>
              </>
            )}

            {/* Delete button - only visible on hover in edit mode */}
            {editMode && (
              <button
                onClick={handleDelete}
                className="absolute top-2 right-2 w-6 h-6 bg-red-300 text-white rounded-full 
                           opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity 
                           flex items-center justify-center hover:bg-red-600 cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}