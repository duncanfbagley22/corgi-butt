'use client'

import { useState, useRef } from 'react'
import * as LucideIcons from 'lucide-react'
import { getItemStatus } from '@/utils/itemstatus'
import type { Item } from '@/types/floorplan'

interface ItemCardProps {
  item: Item
  onRename: (id: string, newName: string) => void
  onDelete: (id: string) => void
  onMarkCompleted: (id: string) => void
}

export default function ItemCard({
  item,
  onRename,
  onDelete,
  onMarkCompleted,
}: ItemCardProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(item.name)
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPos, setTooltipPos] = useState<{ left: number; top: number }>({ left: 0, top: 0 })
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null)

  const status = getItemStatus(item.last_completed, item.frequency)

  const saveName = () => {
    onRename(item.id, name)
    setEditing(false)
  }

  const IconComponent =
    item.icon && LucideIcons[item.icon as keyof typeof LucideIcons]
      ? (LucideIcons[item.icon as keyof typeof LucideIcons] as any)
      : LucideIcons.Package // fallback icon

const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
  const offsetX = -170 // place tooltip to the left
  const offsetY = -40  // place tooltip above
  setTooltipPos({ left: e.nativeEvent.offsetX + offsetX, top: e.nativeEvent.offsetY + offsetY })
}

  const handleMouseEnter = () => {
    hoverTimeout.current = setTimeout(() => setShowTooltip(true), 600) // 300ms delay
  }

  const handleMouseLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
    setShowTooltip(false)
  }

  return (
    <div
      className={`relative w-36 h-36 cursor-pointer group`}
      onClick={() => onMarkCompleted(item.id)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <div
        className={`flex flex-col items-center justify-center border rounded-2xl bg-gray-50 dark:bg-zinc-800 shadow-sm transition-colors ${
          item.last_completed
            ? 'border-green-500'
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
            <IconComponent className="w-10 h-10 mb-2 text-purple-500" />
            <span
              className="text-lg font-semibold text-center"
              onDoubleClick={(e) => {
                e.stopPropagation()
                setEditing(true)
              }}
            >
              {name}
            </span>
          </>
        )}

        {/* Delete button faint on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(item.id)
          }}
          className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ✕
        </button>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          style={{
            left: tooltipPos.left,
            top: tooltipPos.top,
            width: 160, // fixed width so size doesn't change
          }}
          className="absolute z-50 pointer-events-none bg-gray-900 text-white text-xs rounded-md px-2 py-1 shadow-lg opacity-0 animate-fadeIn"
        >
          <div className="font-medium">Frequency:</div>
          <div>{item.frequency}</div>
          <div className="mt-1 text-gray-300">Description goes here</div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-2px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
