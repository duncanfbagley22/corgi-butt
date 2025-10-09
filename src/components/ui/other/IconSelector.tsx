'use client'

import { useState } from 'react'
import * as LucideIcons from 'lucide-react'
import * as RoomIcons from '@/components/icons/custom/room-icons'
import * as AreaIcons from '@/components/icons/custom/area-icons'
import * as TaskIcons from '@/components/icons/custom/task-icons'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface IconOption {
  name: string
  component: string
}

type CustomIconFolder = 'room' | 'area' | 'task'

interface IconSelectorProps {
  icons: IconOption[]
  selectedIcon?: string
  onSelect: (iconName: string) => void
  columns?: number
  customIconFolder?: CustomIconFolder
  allowedIcons?: string[]
}

export default function IconSelector({
  icons,
  selectedIcon,
  onSelect,
  columns = 6,
  customIconFolder = 'room',
  allowedIcons,
}: IconSelectorProps) {
  const [current, setCurrent] = useState<string | undefined>(selectedIcon)
  const [page, setPage] = useState(0)

  const handleSelect = (iconName: string) => {
    setCurrent(iconName)
    onSelect(iconName)
  }

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

  const filteredIcons = allowedIcons
    ? icons.filter(icon => allowedIcons.includes(icon.name))
    : icons

  const iconsPerPage = columns // one row
  const totalPages = Math.ceil(filteredIcons.length / iconsPerPage)
  const startIndex = page * iconsPerPage
  const pageIcons = filteredIcons.slice(startIndex, startIndex + iconsPerPage)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {pageIcons.map(({ name, component }) => {
          const CustomIconSet = getCustomIconSet()
          const IconComponent = (CustomIconSet as any)[component] || (LucideIcons as any)[component]
          const isSelected = current === name

          return (
            <button
              key={name}
              type="button"
              onClick={() => handleSelect(name)}
              className={`
                p-2 rounded-lg border flex justify-center items-center
                ${isSelected ? 'border-blue-500 bg-blue-100 dark:bg-blue-900' : 'border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'}
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

      {totalPages > 1 && (
        <div className="flex gap-2 items-center mt-2">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="p-1 rounded border bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="text-sm">
            {page + 1} / {totalPages}
          </span>

          <button
            type="button"
            disabled={page === totalPages - 1}
            onClick={() => setPage(page + 1)}
            className="p-1 rounded border bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
