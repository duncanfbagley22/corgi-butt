'use client'

import { useState, useEffect } from 'react'
import IconSelector from '@/components/ui/other/IconSelector'
import { Button } from '@/components/ui/shadcn/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card'
import * as CustomIcons from '@/components/icons/custom/area-icons'

interface Subsection {
  id: string
  name: string
  icon?: string
  items?: any[]
}

interface SubsectionFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string, icon: string) => void
  subsection?: Subsection | null
  mode: 'add' | 'edit'
}

const ICON_OPTIONS_RAW = [
  { name: 'Appliance', component: 'Appliance' },
  { name: 'Art', component: 'Art' },
  { name: 'Bath', component: 'Bath' },
  { name: 'Bed', component: 'Bed' },
  { name: 'Blanket', component: 'Blanket' },
  { name: 'Book', component: 'Book' },
  { name: 'Box', component: 'Box' },
  { name: 'Cabinet', component: 'Cabinet' },
  { name: 'Chair', component: 'Chair' },
  { name: 'Clothing', component: 'Clothing' },
  { name: 'ClothingRack', component: 'ClothingRack' },
  { name: 'Couch', component: 'Couch' },
  { name: 'Desk', component: 'Desk' },
  { name: 'Dishes', component: 'Dishes' },
  { name: 'Dishwasher', component: 'Dishwasher' },
  { name: 'Dryer', component: 'Dryer' },
  { name: 'Electrical', component: 'Electrical' },
  { name: 'Exterior', component: 'Exterior' },
  { name: 'Floor', component: 'Floor' },
  { name: 'Games', component: 'Games' },
  { name: 'Interior', component: 'Interior' },
  { name: 'Items', component: 'Items' },
  { name: 'Lamp', component: 'Lamp' },
  { name: 'Microwave', component: 'Microwave' },
  { name: 'Miscellaneous', component: 'Miscellaneous' },
  { name: 'Other', component: 'Other' },
  { name: 'Oven', component: 'Oven' },
  { name: 'Plants', component: 'Plants' },
  { name: 'Refrigerator', component: 'Refrigerator' },
  { name: 'Shelves', component: 'Shelves' },
  { name: 'Shoes', component: 'Shoes' },
  { name: 'Shower', component: 'Shower' },
  { name: 'Sink', component: 'Sink' },
  { name: 'Table', component: 'Table' },
  { name: 'Toilet', component: 'Toilet' },
  { name: 'TrashCan', component: 'TrashCan' },
  { name: 'TV', component: 'Tv' },
  { name: 'VideoGame', component: 'VideoGame' },
  { name: 'Wall', component: 'Wall' },
  { name: 'Washer', component: 'Washer' },
  { name: 'Window', component: 'Window' },
] as const

type IconOption = {
  name: string
  component: keyof typeof CustomIcons
}

const ICON_OPTIONS: IconOption[] = ICON_OPTIONS_RAW.map(i => ({
  name: i.name,
  component: i.component,
}))

export default function SubsectionFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  subsection, 
  mode 
}: SubsectionFormModalProps) {
  const [subName, setSubName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState<string>('Appliance')

  // Update form when subsection changes (edit mode) or reset (add mode)
  useEffect(() => {
    if (mode === 'edit' && subsection) {
      setSubName(subsection.name)
      setSelectedIcon(subsection.icon || 'Appliance')
    } else if (mode === 'add') {
      setSubName('')
      setSelectedIcon('Appliance')
    }
  }, [subsection, mode, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (subName.trim()) {
      onSubmit(subName.trim(), selectedIcon)
      if (mode === 'add') {
        setSubName('')
        setSelectedIcon('Appliance')
      }
    }
  }

  const handleClose = () => {
    if (mode === 'add') {
      setSubName('')
      setSelectedIcon('Appliance')
    }
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const IconPreviewComponent = selectedIcon
    ? (CustomIcons[selectedIcon as keyof typeof CustomIcons] as any)
    : null

  return (
    <div 
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <Card className="w-full max-w-sm p-6">
        <CardHeader>
          <CardTitle>
            {mode === 'add' ? 'Add New Subsection' : 'Edit Subsection'}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 flex items-center justify-center border rounded-lg bg-gray-50 dark:bg-zinc-800">
              {IconPreviewComponent ? (
                <IconPreviewComponent size={48} className="text-gray-700 dark:text-gray-300 scale-200" />
              ) : (
                <span className="text-2xl">...</span>
              )}
            </div>
          </div>

          <input
            type="text"
            value={subName}
            onChange={(e) => {
              const value = e.target.value
              const capitalized = value.charAt(0).toUpperCase() + value.slice(1)
              setSubName(capitalized)
            }}
            placeholder="Subsection name"
            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 
                       rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
                       dark:bg-zinc-800 dark:text-white"
            autoFocus
          />

          <IconSelector
            icons={ICON_OPTIONS}
            selectedIcon={selectedIcon}
            onSelect={setSelectedIcon}
            customIconFolder="area"
            iconSource="custom"
          />

          <div className="flex gap-2 justify-end">
            <Button 
              type="submit" 
              onClick={handleSubmit}
              disabled={!subName.trim()}
            >
              {mode === 'add' ? 'Add Subsection' : 'Save Changes'}
            </Button>
            <Button variant="secondary" className="cursor-pointer" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}