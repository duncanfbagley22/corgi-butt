'use client'

import { useState } from 'react'
import * as LucideIcons from 'lucide-react'
import { X, LucideIcon } from 'lucide-react'

interface Subsection {
  id: string
  name: string
  icon?: string
  items: any[]
}

interface SubsectionCardProps {
  subsection: Subsection
  size?: number // new prop: width/height in px or rem
  onClick: () => void
  onDelete: () => void
  onRename: (newName: string) => void
}

export default function SubsectionCard({
  subsection,
  size = 208, // default: 52 * 4px = 208px
  onClick,
  onDelete,
  onRename,
}: SubsectionCardProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(subsection.name)

  const handleRename = () => {
    onRename(name)
    setEditing(false)
  }

  const IconComponent = subsection.icon
    ? (LucideIcons[subsection.icon as keyof typeof LucideIcons] as LucideIcon)
    : null

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
          className="text-center border rounded px-1 dark:bg-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          style={{ fontSize: size / 10 }}
          autoFocus
        />
      ) : (
        <h2
          className="font-semibold text-center"
          onDoubleClick={() => setEditing(true)}
          style={{ fontSize: size / 10 }}
        >
          {subsection.name}
        </h2>
      )}

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          if (window.confirm(`Delete "${subsection.name}"?`)) onDelete()
        }}
        className="absolute top-2 right-2 bg-red-300 text-white rounded-full
                   opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity
                   flex items-center justify-center hover:bg-red-600 cursor-pointer"
        style={{ width: size / 6, height: size / 6 }}
      >
        <X size={size / 10} className="pointer-events-none" />
      </button>
    </div>
  )
}
