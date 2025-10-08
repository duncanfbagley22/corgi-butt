'use client'

import { useState, FC } from 'react'
import * as LucideIcons from 'lucide-react'
import * as RoomIcons from '@/components/icons/custom/room-icons'
import * as AreaIcons from '@/components/icons/custom/area-icons'
import * as TaskIcons from '@/components/icons/custom/task-icons'

interface IconOption {
  name: string
  component: string  // Changed to string for flexibility
}

type CustomIconFolder = 'room' | 'area' | 'task'

interface IconSelectorProps {
  icons: IconOption[]
  selectedIcon?: string
  onSelect: (iconName: string) => void
  columns?: number
  iconSource?: 'custom' | 'lucide' | 'both'  // Added 'both' option
  customIconFolder?: CustomIconFolder  // NEW: Specify which custom icon folder to use
  allowedIcons?: string[]  // Optional whitelist of icon names
}

export default function IconSelector({
  icons,
  selectedIcon,
  onSelect,
  columns = 6,
  iconSource = 'custom',
  customIconFolder = 'room',  // NEW: Default to room-icons for backward compatibility
  allowedIcons,
}: IconSelectorProps) {
  const [current, setCurrent] = useState<string | undefined>(selectedIcon)

  const handleSelect = (iconName: string) => {
    setCurrent(iconName)
    onSelect(iconName)
  }

  // NEW: Select the appropriate custom icon set based on folder
  const getCustomIconSet = () => {
    switch (customIconFolder) {
      case 'area':
        return AreaIcons
      case 'task':
        return TaskIcons
      case 'room':
      default:
        return RoomIcons
    }
  }

  // Filter icons based on allowedIcons whitelist
  const filteredIcons = allowedIcons 
    ? icons.filter(icon => allowedIcons.includes(icon.name))
    : icons

  return (
    <div
      className={`grid gap-2`}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {filteredIcons.map(({ name, component }) => {
        // Select the appropriate icon source
        let IconComponent
        const CustomIconSet = getCustomIconSet()
        
        if (iconSource === 'both') {
          // Try custom first, then lucide
          IconComponent = (CustomIconSet as any)[component] || (LucideIcons as any)[component]
        } else if (iconSource === 'custom') {
          IconComponent = (CustomIconSet as any)[component]
        } else {
          IconComponent = (LucideIcons as any)[component]
        }
        
        const isSelected = current === name

        return (
          <button
            key={name}
            type="button"
            onClick={() => handleSelect(name)}
            className={`
              p-2 rounded-lg border 
              ${isSelected ? 'border-blue-500 bg-blue-100 dark:bg-blue-900' : 'border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'}
              flex justify-center items-center
              hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer
              transition-colors duration-200
            `}
            title={name}
          >
            {IconComponent && <IconComponent size={24} />}
          </button>
        )
      })}
    </div>
  )
}