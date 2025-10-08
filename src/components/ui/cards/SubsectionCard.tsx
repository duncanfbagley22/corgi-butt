'use client'

import { useState, useMemo } from 'react'
import * as LucideIcons from 'lucide-react'
import { X, Info, Circle, Triangle, Diamond, Hexagon } from 'lucide-react'
import { getSubsectionStatus, type OverallStatus } from '@/utils/itemstatus'
import * as CustomIcons from '@/components/icons/custom/area-icons'

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
  forced_completion_status?: string
  forced_marked_incomplete?: boolean
  subsection_id?: string
}

interface Subsection {
  id: string
  name: string
  icon?: string
  items: Item[]
  room_id?: string
}

interface SubsectionCardProps {
  subsection: Subsection
  size?: number
  onClick: () => void
  onDelete: () => void
  onRename: (newName: string) => void
  editMode?: boolean  // Add editMode prop
}

// Status color mapping for backgrounds and borders
const STATUS_STYLES: Record<OverallStatus, { bg: string; border: string; bgDark: string }> = {
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

export default function SubsectionCard({
  subsection,
  size = 208,
  onClick,
  onDelete,
  onRename,
  editMode = false,
}: SubsectionCardProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(subsection.name)
  const [isFlipped, setIsFlipped] = useState(false)

  const handleRename = () => {
    onRename(name)
    setEditing(false)
  }

  const IconComponent = subsection.icon
    ? (CustomIcons[subsection.icon as keyof typeof CustomIcons] as any) || 
      (LucideIcons[subsection.icon as keyof typeof LucideIcons] as any)
    : null

  const statusInfo = useMemo(() => {
    return getSubsectionStatus(subsection.items)
  }, [subsection.items])

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
                 ${editMode ? 'animate-wiggle' : ''}`}
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
              {subsection.name}
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
        /* Back of Card - 2x2 Grid of Status Icons */
        <div className="w-full h-full flex items-center justify-center p-6">
          <div className="grid grid-cols-2 gap-6 w-full">
            {/* Done - Green Circle */}
            <div className="flex items-center justify-center">
              <div className="relative transition-transform hover:scale-110 duration-200">
                <Circle 
                  size={size / 3.5} 
                  fill="#22c55e" 
                  stroke="none"
                  className="drop-shadow-lg"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-bold text-white drop-shadow-md" style={{ fontSize: size / 8 }}>
                    {statusInfo.statusCounts['done']}
                  </span>
                </div>
              </div>
            </div>

            {/* Soon - Yellow Triangle */}
            <div className="flex items-center justify-center">
              <div className="relative transition-transform hover:scale-110 duration-200">
                <Triangle 
                  size={size / 3.5} 
                  fill="#eab308" 
                  stroke="none"
                  className="drop-shadow-lg"
                />
                <div className="absolute inset-0 flex items-center justify-center" style={{ marginTop: size / 40 }}>
                  <span className="font-bold text-white drop-shadow-md" style={{ fontSize: size / 8 }}>
                    {statusInfo.statusCounts['soon']}
                  </span>
                </div>
              </div>
            </div>

            {/* Due - Orange Diamond */}
            <div className="flex items-center justify-center">
              <div className="relative transition-transform hover:scale-110 duration-200">
                <Diamond 
                  size={size / 3.5} 
                  fill="#f97316" 
                  stroke="none"
                  className="drop-shadow-lg"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-bold text-white drop-shadow-md" style={{ fontSize: size / 8 }}>
                    {statusInfo.statusCounts['due']}
                  </span>
                </div>
              </div>
            </div>

            {/* Overdue - Red Hexagon */}
            <div className="flex items-center justify-center">
              <div className="relative transition-transform hover:scale-110 duration-200">
                <Hexagon 
                  size={size / 3.5} 
                  fill="#ef4444" 
                  stroke="none"
                  className="drop-shadow-lg"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-bold text-white drop-shadow-md" style={{ fontSize: size / 8 }}>
                    {statusInfo.statusCounts['overdue']}
                  </span>
                </div>
              </div>
            </div>
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
            if (window.confirm(`Delete "${subsection.name}"?`)) onDelete()
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