'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/shadcn/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card"
import { supabase } from "@/lib/supabase/supabase"
import type { Item } from "@/types/floorplan"
import IconSelector from '@/components/ui/other/IconSelector'
import * as CustomIcons from '@/components/icons/custom/task-icons'

interface ItemFormModalProps {
  item: Item
  subsectionId: string
  isOpen: boolean
  onClose: () => void
  onSaved: (savedData: Partial<Item>) => void
}

export function ItemFormModal({ item, subsectionId, isOpen, onClose, onSaved }: ItemFormModalProps) {
  const [name, setName] = useState(item.name || '')
  const [description, setDescription] = useState(item.description || "")
  // const [icon, setIcon] = useState(item.icon || "")
  const [frequency, setFrequency] = useState(item.frequency || 'weekly')
  const [saving, setSaving] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState<string>('Arrange')

  useEffect(() => {
    setName(item.name || '')
    setDescription(item.description || '')
    // setIcon(item.icon || '')
    setFrequency(item.frequency || 'weekly')
  }, [item])

  if (!isOpen) return null

  const handleSave = async () => {
    if (!name.trim()) return

    setSaving(true)

    const itemData: Partial<Item> = {
      name: name.trim(),
      description: description.trim(),
      icon: selectedIcon,
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
// Icon options
const ICON_OPTIONS_RAW = [
{ name: 'Arrange', component: 'Arrange' },
{ name: 'CarWash', component: 'CarWash' },
{ name: 'Check', component: 'Check' },
{ name: 'Dryer', component: 'Dryer' },
{ name: 'Fold', component: 'Fold' },
{ name: 'Mop', component: 'Mop' },
{ name: 'Other', component: 'Other' },
{ name: 'Purchase', component: 'Purchase' },
{ name: 'Spray', component: 'Spray' },
{ name: 'Sweep', component: 'Sweep' },
{ name: 'Tidy', component: 'Tidy' },
{ name: 'Tire', component: 'Tire' },
{ name: 'ToiletPaper', component: 'ToiletPaper' },
{ name: 'TrashOut', component: 'TrashOut' },
{ name: 'Vacuum1', component: 'Vacuum1' },
{ name: 'Vacuum2', component: 'Vacuum2' },
{ name: 'Washer', component: 'Washer' },
{ name: 'Water', component: 'Water' },
{ name: 'Wipe', component: 'Wipe' }

] as const

type IconOption = {
  name: string
  component: keyof typeof CustomIcons
}

const ICON_OPTIONS: IconOption[] = ICON_OPTIONS_RAW.map(i => ({
  name: i.name,
  component: i.component,
}))

  // Get the selected icon component for preview
const IconPreviewComponent = selectedIcon
  ? (CustomIcons[selectedIcon as keyof typeof CustomIcons] as React.ComponentType<{ size?: number; className?: string }>)
  : null


  const isNewItem = !item.id

  // Handle clicking outside the modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-[60]"
      onClick={handleBackdropClick}
    >
      <Card className="md:w-full max-w-md p-6 relative bg-white dark:bg-zinc-900">

        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isNewItem ? 'Create New Item' : 'Edit Item'}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Icon Preview */}
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 flex items-center justify-center border rounded-lg bg-gray-50 dark:bg-zinc-800">
              {IconPreviewComponent ? (
                <IconPreviewComponent size={32} className="text-gray-700 dark:text-gray-300 scale-200" />
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
                        focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={2}
            />
          </div>

          {/* Icon Selector */}
          <IconSelector
            icons={ICON_OPTIONS}
            selectedIcon={selectedIcon}
            onSelect={setSelectedIcon}
            customIconFolder="task"
          />

          {/* Frequency Select */}
          <div>
            <label className="block text-sm font-medium mb-2">Frequency</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm
                         dark:bg-zinc-700 dark:text-white dark:border-zinc-600
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="flex gap-2 pt-4 justify-end">
            <Button onClick={handleSave} disabled={!name.trim() || saving}>
              {saving ? 'Saving...' : isNewItem ? 'Create' : 'Save'}
            </Button>
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}