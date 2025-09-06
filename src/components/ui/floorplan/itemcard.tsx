"use client"

import { useState } from "react"
import { getItemStatus } from "@/utils/itemstatus"
import type { Item } from "@/types/floorplan"

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
  const status = getItemStatus(item.last_completed, item.frequency)

  const saveName = () => {
    onRename(item.id, name)
    setEditing(false)
  }

  return (
    <div className="border p-3 rounded bg-gray-50 dark:bg-zinc-800">
      <div className="flex justify-between items-center mb-2">
        {editing ? (
          <input
            className="border rounded px-1 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => e.key === "Enter" && saveName()}
            autoFocus
          />
        ) : (
          <span
            className="cursor-pointer hover:underline"
            onDoubleClick={() => setEditing(true)}
          >
            {item.name}
          </span>
        )}
        <button
          onClick={() => onDelete(item.id)}
          className="text-red-500 hover:text-red-700"
        >
          ✕
        </button>
      </div>

      <div className="text-sm text-gray-600 space-y-1">
        <div>
          <span className="font-medium">Last Completed:</span>{" "}
          {item.last_completed
            ? new Date(item.last_completed).toLocaleString()
            : "Never"}
        </div>
        {item.last_completed_by_user && (
          <div>
            <span className="font-medium">By:</span>{" "}
            {item.last_completed_by_user.display_name ||
              item.last_completed_by_user.full_name ||
              "Unknown"}
          </div>
        )}
        <div>
          <span className="font-medium">Frequency:</span> {item.frequency}
        </div>
        <div>
          <span className="font-medium">Status:</span>{" "}
          <span
            className={
              status === "overdue"
                ? "text-red-600"
                : status === "due"
                ? "text-yellow-600"
                : "text-green-600"
            }
          >
            {status}
          </span>
        </div>
      </div>

      <button
        onClick={() => onMarkCompleted(item.id)}
        className="mt-2 px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
      >
        Mark Completed
      </button>
    </div>
  )
}
