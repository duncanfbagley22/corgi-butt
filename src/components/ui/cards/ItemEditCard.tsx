// components/ui/floorplan/ItemEditCard.tsx
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import * as LucideIcons from "lucide-react"
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

  return (
    <Card className="p-4 border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 space-y-2">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          type="text"
          className="mt-1 w-full rounded border px-2 py-1 dark:bg-zinc-700 dark:text-white"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <input
          type="text"
          className="mt-1 w-full rounded border px-2 py-1 dark:bg-zinc-700 dark:text-white"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Icon</label>
        <select
          className="mt-1 w-full rounded border px-2 py-1 dark:bg-zinc-700 dark:text-white"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
        >
          <option value="">Select an icon</option>
          {iconOptions.map((ic) => (
            <option key={ic} value={ic}>
              {ic}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Status</label>
        <select
          className="mt-1 w-full rounded border px-2 py-1 dark:bg-zinc-700 dark:text-white"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="completed">Completed</option>
          <option value="incomplete">Incomplete</option>
        </select>
      </div>

      <div className="flex justify-end gap-2 mt-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </Card>
  )
}