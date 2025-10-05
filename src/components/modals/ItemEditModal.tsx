'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/shadcn/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card"
import * as LucideIcons from "lucide-react"
import { X, LucideIcon } from "lucide-react"
import { supabase } from "@/lib/supabase/supabase"
import type { Item } from "@/types/floorplan"

interface ItemEditModalProps {
  item: Item
  subsectionId: string
  isOpen: boolean
  onClose: () => void
  onSaved: (savedData: Partial<Item>) => void
}

export function ItemEditModal({ item, subsectionId, isOpen, onClose, onSaved }: ItemEditModalProps) {
  const [name, setName] = useState(item.name || '')
  const [description, setDescription] = useState(item.description || "")
  const [icon, setIcon] = useState(item.icon || "")
  const [frequency, setFrequency] = useState(item.frequency || 'weekly')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setName(item.name || '')
    setDescription(item.description || '')
    setIcon(item.icon || '')
    setFrequency(item.frequency || 'weekly')
  }, [item])

  if (!isOpen) return null

  const handleSave = async () => {
    if (!name.trim()) return

    setSaving(true)

    const itemData: Partial<Item> = {
      name: name.trim(),
      description: description.trim(),
      icon,
      frequency,
    }

    try {
      if (item.id) {
        const { data, error } = await supabase
          .from("items")
          .update(itemData)
          .eq("id", item.id)
          .select()
          .single()

        if (error) throw error
        onSaved(data)
      } else {
        const newItemData = { ...itemData, subsection_id: subsectionId }
        const { data, error } = await supabase
          .from("items")
          .insert([newItemData])
          .select()
          .single()
        if (error) throw error
        onSaved(data)
      }
      onClose()
    } catch (error) {
      console.error("Error saving item:", error)
    } finally {
      setSaving(false)
    }
  }

  // --- Curated icons for selection ---
  const allowedIcons = [
    "BrushCleaning",
    "Bubbles",
    "SoapDispenserDroplet",
    "WashingMachine",
    "Trash",
    "Hand",
    "Replace",
    "Utensils",
    "Star",
    "Locate",
    "Activity",
    "Paintbrush",
    "SprayCan",
    "ToolCase"
    
  ] as const

  const IconPreviewComponent = icon
    ? (LucideIcons[icon as keyof typeof LucideIcons] as LucideIcon)
    : null

  const isNewItem = !item.id

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[60]">
      <Card className="w-full max-w-md p-6 relative bg-white dark:bg-zinc-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
          aria-label="Close modal"
        >
          <X size={22} />
        </button>

        <CardHeader className="pb-4">
          <CardTitle className="text-2xl text-center">
            {isNewItem ? 'Create New Item' : 'Edit Item'}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Icon Preview */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 flex items-center justify-center border rounded-lg bg-gray-50 dark:bg-zinc-800">
              {IconPreviewComponent ? (
                <IconPreviewComponent size={32} className="text-black-500" />
              ) : (
                <span className="text-2xl">...</span>
              )}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Name *</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 text-sm
                        dark:bg-zinc-700 dark:text-white dark:border-zinc-600
                        focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={name}
              onChange={(e) => {
                const properCase = e.target.value
                  .toLowerCase()
                  .replace(/\b\w/g, (char) => char.toUpperCase());
                setName(properCase);
              }}
              placeholder="Enter item name"
              required
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none
                         dark:bg-zinc-700 dark:text-white dark:border-zinc-600
                         focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={2}
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-sm font-medium mb-2">Icon</label>
            <div className="grid grid-cols-5 gap-2">
              {allowedIcons.map((iconName) => {
                const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as LucideIcon
                const isSelected = icon === iconName
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={`p-2 border rounded-lg flex items-center justify-center transition
                      ${isSelected
                        ? "bg-purple-100 border-purple-500 dark:bg-purple-900 dark:border-purple-400"
                        : "bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700"
                      }`}
                  >
                    <IconComponent
                      size={20}
                      className={`${isSelected ? "text-purple-600 dark:text-purple-300" : "text-gray-500"}`}
                    />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Frequency Select */}
          <div>
            <label className="block text-sm font-medium mb-2">Frequency</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm
                         dark:bg-zinc-700 dark:text-white dark:border-zinc-600
                         focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim() || saving}>
              {saving ? 'Saving...' : isNewItem ? 'Create' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
