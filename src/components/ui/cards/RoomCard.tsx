'use client'

import { useState, useMemo } from 'react'
import * as LucideIcons from 'lucide-react'
import { X, Info } from 'lucide-react'
import { getRoomStatus, type OverallStatus } from '@/utils/itemstatus'
import type { RoomData, Subsection } from '@/types/floorplan'
import * as CustomIcons from '@/components/icons/custom/room-icons'

interface RoomCardProps {
  room: {
    id: string
    name: string
    icon?: string
    subsections: Subsection[]
  }
  size?: number
  onClick: () => void
  onDelete: () => void
  onRename: (newName: string) => void
  editMode?: boolean  // Add this prop
}

// Status color mapping for backgrounds and borders
const STATUS_STYLES: Record<OverallStatus, { bg: string; border: string; bgDark: string }> = {
  'excellent': { 
    bg: 'bg-gradient-to-br from-green-50 to-emerald-100', 
    border: 'border-green-400',
    bgDark: 'dark:from-green-950 dark:to-emerald-900'
  },
  'good': { 
    bg: 'bg-gradient-to-br from-yellow-50 to-amber-100', 
    border: 'border-yellow-400',
    bgDark: 'dark:from-yellow-950 dark:to-amber-900'
  },
  'needs-attention': { 
    bg: 'bg-gradient-to-br from-orange-50 to-red-100', 
    border: 'border-orange-400',
    bgDark: 'dark:from-orange-950 dark:to-red-900'
  },
  'critical': { 
    bg: 'bg-gradient-to-br from-red-50 to-rose-100', 
    border: 'border-red-500',
    bgDark: 'dark:from-red-950 dark:to-rose-900'
  }
}

const STATUS_LABELS: Record<string, string> = {
  'up-to-date': 'Up to Date',
  'upcoming': 'Upcoming',
  'due-soon': 'Due Soon',
  'overdue': 'Overdue',
  'way-overdue': 'Way Overdue',
  'due': 'Due'
}

export default function RoomCard({
  room,
  size = 208,
  onClick,
  onDelete,
  onRename,
  editMode = false,  // Add with default value
}: RoomCardProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(room.name)
  const [isFlipped, setIsFlipped] = useState(false)

  const handleRename = () => {
    onRename(name)
    setEditing(false)
  }

  const IconComponent = room.icon
    ? (CustomIcons[room.icon as keyof typeof CustomIcons] as any) || 
      (LucideIcons[room.icon as keyof typeof LucideIcons] as any)
    : null

  const statusInfo = useMemo(() => {
    return getRoomStatus(room.subsections || [])
  }, [room.subsections])

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFlipped(!isFlipped)
  }

  const statusStyle = statusInfo.totalItems > 0 
    ? STATUS_STYLES[statusInfo.overallStatus]
    : { bg: 'bg-white', border: 'border-gray-300', bgDark: 'dark:bg-zinc-800' }

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-2xl shadow-lg ${statusStyle.bg} ${statusStyle.bgDark}
                 flex flex-col items-center justify-center cursor-pointer
                 hover:scale-105 transform transition-all duration-300
                 border-4 ${statusStyle.border}
                 hover:shadow-2xl backdrop-blur-sm
                 ${editMode ? 'animate-wiggle' : ''}`  // Add the wiggle animation
                }
                 
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
      }}
    >
      {!isFlipped ? (
        <>
          {/* Icon with subtle drop shadow */}
          <div className="text-gray-800 dark:text-gray-100 mb-3 drop-shadow-md" style={{ fontSize: size / 4 }}>
            {IconComponent ? <IconComponent size={size / 4} strokeWidth={1.5} /> : '...'}
          </div>

          {/* Name / Editable */}
          {editing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              onClick={(e) => e.stopPropagation()}
              className="text-center border-2 border-gray-400 rounded-lg px-2 py-1 
                         bg-white/80 dark:bg-zinc-700/80 dark:text-white 
                         focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
              style={{ fontSize: size / 10 }}
              autoFocus
            />
          ) : (
            <h2
              className="font-bold text-center text-gray-800 dark:text-gray-100 px-4"
              onDoubleClick={(e) => {
                e.stopPropagation()
                setEditing(true)
              }}
              style={{ fontSize: size / 10 }}
            >
              {room.name}
            </h2>
          )}

          {/* Subtle status text */}
          {statusInfo.totalItems > 0 && (
            <div className="mt-2 text-gray-600 dark:text-gray-300 font-medium opacity-80" 
                 style={{ fontSize: size / 16 }}>
            </div>
          )}
        </>
      ) : (
        /* Back of Card */
        <div className="px-6 py-4 w-full h-full flex flex-col justify-center">
          <h3 className="font-bold text-center mb-3 text-gray-800 dark:text-gray-100" 
              style={{ fontSize: size / 11 }}>
            Status Breakdown
          </h3>
          <div className="space-y-1.5" style={{ fontSize: size / 15 }}>
            {Object.entries(statusInfo.statusCounts).map(([status, count]) => (
              count > 0 && (
                <div key={status} className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>{STATUS_LABELS[status]}:</span>
                  <span className="font-semibold">{count}</span>
                </div>
              )
            ))}
          </div>
          <div className="mt-3 pt-3 border-t-2 border-gray-400 dark:border-gray-500 
                          flex justify-between font-bold text-gray-800 dark:text-gray-100" 
               style={{ fontSize: size / 13 }}>
            <span>Total:</span>
            <span>{statusInfo.totalItems}</span>
          </div>
        </div>
      )}

      {/* Info Button - Top Right - Only show when NOT in edit mode */}
      {!editMode && (
        <button
          onClick={handleFlip}
          className="absolute top-2 right-2 bg-blue-500 text-white rounded-full
                     opacity-0 group-hover:opacity-90 hover:opacity-100 transition-all
                     flex items-center justify-center hover:bg-blue-600 cursor-pointer
                     shadow-lg hover:scale-110 transform duration-200"
          style={{ width: size / 6, height: size / 6 }}
          title={isFlipped ? "Show front" : "Show details"}
        >
          <Info size={size / 10} className="pointer-events-none" />
        </button>
      )}

      {/* Delete Button - Top Right - Only show in edit mode and when not flipped */}
      {!isFlipped && editMode && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            if (window.confirm(`Delete "${room.name}"?`)) onDelete()
          }}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full
                     opacity-0 group-hover:opacity-90 hover:opacity-100 transition-all
                     flex items-center justify-center hover:bg-red-600 cursor-pointer
                     shadow-lg hover:scale-110 transform duration-200"
          style={{ width: size / 6, height: size / 6 }}
        >
          <X size={size / 10} className="pointer-events-none" />
        </button>
      )}
    </div>
  )
}