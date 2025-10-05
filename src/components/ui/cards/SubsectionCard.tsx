'use client'

import { useState, useMemo } from 'react'
import * as LucideIcons from 'lucide-react'
import { X, Info } from 'lucide-react'
import { getSubsectionStatus, type OverallStatus } from '@/utils/itemstatus'

interface Item {
  id: string
  name: string
  icon?: string
  description?: string
  frequency: string
  last_completed_by?: string
  last_completed?: string | null
  last_completed_by_user?: {
    id: string
    display_name?: string
    full_name: string
  }
  forced_completion_status?: string  // Changed from boolean to string
  forced_marked_incomplete?: boolean
  subsection_id?: string  // Also good to add this
}

interface Subsection {
  id: string
  name: string
  icon?: string
  items: Item[]
  room_id?: string  // Also good to add this
}

interface SubsectionCardProps {
  subsection: Subsection
  size?: number
  onClick: () => void
  onDelete: () => void
  onRename: (newName: string) => void
}

// Status color mapping
const STATUS_COLORS: Record<OverallStatus, string> = {
  'excellent': 'bg-green-500',
  'good': 'bg-yellow-500',
  'needs-attention': 'bg-orange-500',
  'critical': 'bg-red-500'
}

// Status label mapping for display
const STATUS_LABELS: Record<string, string> = {
  'up-to-date': 'Up to Date',
  'upcoming': 'Upcoming',
  'due-soon': 'Due Soon',
  'overdue': 'Overdue',
  'way-overdue': 'Way Overdue',
  'due': 'Due'
}

export default function SubsectionCard({
  subsection,
  size = 208,
  onClick,
  onDelete,
  onRename,
}: SubsectionCardProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(subsection.name)
  const [isFlipped, setIsFlipped] = useState(false)

  const handleRename = () => {
    onRename(name)
    setEditing(false)
  }

  const IconComponent = subsection.icon
    ? (LucideIcons[subsection.icon as keyof typeof LucideIcons] as any)
    : null

  // Calculate status using utility
  const statusInfo = useMemo(() => {
    return getSubsectionStatus(subsection.items)
  }, [subsection.items])

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFlipped(!isFlipped)
  }

  return (
    <div
      onClick={onClick}
      className="group relative border rounded-lg shadow bg-white dark:bg-zinc-800
                 flex flex-col items-center justify-center cursor-pointer
                 hover:scale-105 transform transition-transform duration-200"
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
      }}
    >
      {!isFlipped ? (
        /* Front of Card */
        <>
          {/* Icon */}
          <div className="text-gray-800 dark:text-gray-200 mb-2" style={{ fontSize: size / 4 }}>
            {IconComponent ? <IconComponent size={size / 4} /> : '...'}
          </div>

          {/* Name / Editable */}
          {editing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              onClick={(e) => e.stopPropagation()}
              className="text-center border rounded px-1 dark:bg-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ fontSize: size / 10 }}
              autoFocus
            />
          ) : (
            <h2
              className="font-semibold text-center"
              onDoubleClick={(e) => {
                e.stopPropagation()
                setEditing(true)
              }}
              style={{ fontSize: size / 10 }}
            >
              {subsection.name}
            </h2>
          )}

          {/* Overall Status Badge */}
          {statusInfo.totalItems > 0 && (
            <div className="mt-3">
              <div
                className={`${STATUS_COLORS[statusInfo.overallStatus]} text-white px-3 py-1 rounded-full font-semibold`}
                style={{ fontSize: size / 14 }}
              >
                {statusInfo.overallStatus.toUpperCase()}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Back of Card - Status Breakdown */
        <div className="px-4 py-2 w-full h-full flex flex-col justify-center">
          <h3 className="font-semibold text-center mb-2" style={{ fontSize: size / 12 }}>
            Status Breakdown
          </h3>
          <div className="space-y-1" style={{ fontSize: size / 16 }}>
            {Object.entries(statusInfo.statusCounts).map(([status, count]) => (
              count > 0 && (
                <div key={status} className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>{STATUS_LABELS[status]}:</span>
                  <span className="font-semibold">{count}</span>
                </div>
              )
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600 flex justify-between font-bold text-gray-800 dark:text-gray-200" style={{ fontSize: size / 14 }}>
            <span>Total:</span>
            <span>{statusInfo.totalItems}</span>
          </div>
        </div>
      )}

      {/* Info/Flip Button - Top Right */}
      <button
        onClick={handleFlip}
        className="absolute top-2 right-2 bg-blue-300 text-white rounded-full
                   opacity-70 hover:opacity-100 transition-opacity
                   flex items-center justify-center hover:bg-blue-500 cursor-pointer z-10"
        style={{ width: size / 6, height: size / 6 }}
        title={isFlipped ? "Show front" : "Show details"}
      >
        <Info size={size / 10} className="pointer-events-none" />
      </button>

      {/* Delete Button - Top Left (only on front) */}
      {!isFlipped && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            if (window.confirm(`Delete "${subsection.name}"?`)) onDelete()
          }}
          className="absolute top-2 left-2 bg-red-300 text-white rounded-full
                     opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity
                     flex items-center justify-center hover:bg-red-600 cursor-pointer"
          style={{ width: size / 6, height: size / 6 }}
        >
          <X size={size / 10} className="pointer-events-none" />
        </button>
      )}
    </div>
  )
}