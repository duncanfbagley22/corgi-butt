// components/ui/floorplan/ItemEditCard.tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import * as LucideIcons from "lucide-react"
import { X, LucideIcon } from "lucide-react"
import type { Item } from "@/types/floorplan"

interface ItemEditCardProps {
  item: Item
  onSave: (updatedItem: Partial<Item>) => void
  onCancel: () => void
}

export function ItemEditCard({ item, onSave, onCancel }: ItemEditCardProps) {
  const [name, setName] = useState(item.name)
  const [description, setDescription] = useState(item.description || "")
  const [icon, setIcon] = useState(item.icon || "")
  const [status, setStatus] = useState(item.last_completed ? "completed" : "incomplete")

  const handleSave = () => {
    onSave({ 
      name, 
      description, 
      icon, 
      last_completed: status === "completed" 
        ? item.last_completed || new Date().toISOString() 
        : null 
    })
  }

  const iconOptions = Object.keys(LucideIcons)

  // Render selected icon
  const IconComponent = icon 
    ? (LucideIcons[icon as keyof typeof LucideIcons] as LucideIcon)
    : null

  return (
    <div className="group relative p-4 border rounded-lg shadow bg-white dark:bg-zinc-800 
                    flex flex-col items-center justify-center
                    aspect-square w-52 space-y-3">
      
      {/* Icon Preview */}
      <div className="text-gray-800 dark:text-gray-200 mb-2">
        {IconComponent ? <IconComponent size={32} /> : '📝'}
      </div>

      {/* Name Input */}
      <div className="w-full">
        <label className="block text-xs font-medium mb-1 text-center">Name</label>
        <input
          type="text"
          className="w-full text-center border rounded px-2 py-1 text-sm
                     dark:bg-zinc-700 dark:text-white dark:border-zinc-600
                     focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item name"
        />
      </div>

      {/* Description Input */}
      <div className="w-full">
        <label className="block text-xs font-medium mb-1 text-center">Description</label>
        <input
          type="text"
          className="w-full text-center border rounded px-2 py-1 text-sm
                     dark:bg-zinc-700 dark:text-white dark:border-zinc-600
                     focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
        />
      </div>

      {/* Icon Select */}
      <div className="w-full">
        <label className="block text-xs font-medium mb-1 text-center">Icon</label>
        <select
          className="w-full text-center border rounded px-2 py-1 text-sm
                     dark:bg-zinc-700 dark:text-white dark:border-zinc-600
                     focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
        >
          <option value="">Select icon</option>
          {iconOptions.slice(0, 50).map((ic) => (
            <option key={ic} value={ic}>
              {ic}
            </option>
          ))}
        </select>
      </div>

      {/* Status Select */}
      <div className="w-full">
        <label className="block text-xs font-medium mb-1 text-center">Status</label>
        <select
          className="w-full text-center border rounded px-2 py-1 text-sm
                     dark:bg-zinc-700 dark:text-white dark:border-zinc-600
                     focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="completed">Completed</option>
          <option value="incomplete">Incomplete</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-2 w-full mt-2">
        <Button 
          variant="secondary" 
          onClick={onCancel}
          size="sm"
          className="text-xs px-3 py-1"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          size="sm"
          className="text-xs px-3 py-1"
        >
          Save
        </Button>
      </div>

      {/* Cancel Button (X) */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          onCancel()
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