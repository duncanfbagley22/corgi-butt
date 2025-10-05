'use client'

import { useState, FC } from 'react'
import * as LucideIcons from 'lucide-react'
import * as CustomIcons from '@/components/icons/custom/room-icons'

interface IconOption {
  name: string
  component: keyof typeof CustomIcons | keyof typeof LucideIcons
}

interface IconSelectorProps {
  icons: IconOption[]
  selectedIcon?: string
  onSelect: (iconName: string) => void
  columns?: number
  iconSource?: 'custom' | 'lucide'  // Add this to specify which icon set to use
}

export default function IconSelector({
  icons,
  selectedIcon,
  onSelect,
  columns = 6,
  iconSource = 'custom',  // Default to lucide for backward compatibility
}: IconSelectorProps) {
  const [current, setCurrent] = useState<string | undefined>(selectedIcon)

  const handleSelect = (iconName: string) => {
    setCurrent(iconName)
    onSelect(iconName)
  }

  return (
    <div
      className={`grid gap-2`}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {icons.map(({ name, component }) => {
        // Select the appropriate icon source
        const IconComponent = iconSource === 'custom'
          ? (CustomIcons as any)[component]
          : (LucideIcons as any)[component]
        
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
            `}
          >
            {IconComponent && <IconComponent size={24} />}
          </button>
        )
      })}
    </div>
  )
}