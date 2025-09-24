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
  onClick: () => void
  onDelete: () => void
  onRename: (newName: string) => void
}

export default function SubsectionCard({
  subsection,
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

  // Render Lucide icon from subsection.icon string, fallback to emoji
  const IconComponent = subsection.icon
    ? (LucideIcons[subsection.icon as keyof typeof LucideIcons] as LucideIcon)
    : null

  return (
    <div
      className="group relative p-4 border rounded-lg shadow bg-white dark:bg-zinc-800 
                 flex flex-col items-center justify-center cursor-pointer 
                 hover:scale-105 transform transition-transform duration-200
                 aspect-square w-52"
      onClick={onClick}
    >
      {/* Icon */}
      <div className="text-gray-800 dark:text-gray-200 mb-2">
        {IconComponent ? <IconComponent size={32} /> : '📦'}
      </div>

      {/* Name / Editable */}
      {editing ? (
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => e.key === 'Enter' && handleRename()}
          className="text-center border rounded px-1 dark:bg-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          autoFocus
        />
      ) : (
        <h2
          className="font-semibold text-center"
          onDoubleClick={() => setEditing(true)}
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
        className="absolute top-2 right-2 w-6 h-6 bg-red-300 text-white rounded-full 
                   opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity 
                   flex items-center justify-center hover:bg-red-600 cursor-pointer"
      >
        <X size={12} className="pointer-events-none" />
      </button>
    </div>
  )
}
