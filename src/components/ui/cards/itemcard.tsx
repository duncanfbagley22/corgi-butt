'use client'

import { useState, useRef, useEffect } from 'react'
import * as LucideIcons from 'lucide-react'
import { getItemStatus } from '@/utils/itemstatus'
import type { Item } from '@/types/floorplan'
import { X } from 'lucide-react'

interface ItemCardProps {
  item: Item
  onRename: (id: string, newName: string) => void
  onDelete: (id: string) => void
  onItemClick: (item: Item) => void
  onMarkIncomplete?: (id: string) => void
  editMode: boolean
}

export default function ItemCard({
  item,
  onRename,
  onDelete,
  onItemClick,
  onMarkIncomplete,
  editMode,
}: ItemCardProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(item.name)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [isLongPressing, setIsLongPressing] = useState(false)

  useEffect(() => {
    setName(item.name)
  }, [item.name])

  const saveName = () => {
    onRename(item.id, name)
    setEditing(false)
  }

  const handleClick = () => {
    if (editing || isLongPressing) return // Don't trigger if we're editing the name or long pressing
    onItemClick(item)
  }

  const handleMouseDown = () => {
    if (!item.last_completed || editMode || editing) return
    
    setIsLongPressing(false)
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPressing(true)
      console.log('big click')
      if (onMarkIncomplete) {
        onMarkIncomplete(item.id)
      }
    }, 800) 
    // 800ms for long press
  }

  const handleMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    setTimeout(() => setIsLongPressing(false), 100) // Small delay to prevent click after long press
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm(`Delete "${item.name}"?`)) {
      onDelete(item.id)
    }
  }

  const IconComponent =
    item.icon && LucideIcons[item.icon as keyof typeof LucideIcons]
      ? (LucideIcons[item.icon as keyof typeof LucideIcons] as any)
      : LucideIcons.Package // fallback icon

  return (
    <div
      className={`relative w-36 h-36 cursor-pointer group ${
        editMode ? 'animate-wiggle' : ''
      }`}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // Clear timer if mouse leaves
    >
      <div
        className={`flex flex-col items-center justify-center hover:scale-105 transform transition-transform duration-200 border rounded-2xl bg-gray-50 dark:bg-zinc-800 shadow-sm ${
          item.last_completed
            ? 'border-green-500 border-6 bg-green-50'
            : 'border-gray-300 dark:border-zinc-700'
        } w-full h-full p-4`}
      >
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
      </div>
    </div>
  )
}