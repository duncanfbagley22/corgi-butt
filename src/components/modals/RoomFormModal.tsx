'use client'

import { useState, useEffect } from 'react'
import IconSelector from '@/components/ui/other/IconSelector'
import * as LucideIcons from 'lucide-react'
import { Button } from '@/components/ui/shadcn/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card'
import * as CustomIcons from '@/components/icons/custom/room-icons'

interface RoomFormModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (name: string, icon: string) => void
  onEdit?: (id: string, name: string, icon: string) => void
  editingRoom?: { id: string; name: string; icon?: string } | null
}

// Define icons as before
const ICON_OPTIONS_RAW = [
  { name: 'Balcony', component: 'Balcony' },
  { name: 'Bath', component: 'Bath' },
  { name: 'Bedroom', component: 'Bedroom' },
  { name: 'Car', component: 'Car' },
  { name: 'Chair', component: 'Chair' },
  { name: 'Couch', component: 'Couch' },
  { name: 'Desk', component: 'Desk' },
  { name: 'Footprints', component: 'Footprints' },
  { name: 'Hanger', component: 'Hanger' },
  { name: 'Kitchen', component: 'Kitchen' },
  { name: 'Toilet', component: 'Toilet' }
] as const

type IconOption = {
  name: string
  component: keyof typeof CustomIcons
}
const ICON_OPTIONS: IconOption[] = ICON_OPTIONS_RAW.map(i => ({
  name: i.name,
  component: i.component,
}))

export default function RoomFormModal({ isOpen, onClose, onAdd, onEdit, editingRoom }: RoomFormModalProps) {
  const [roomName, setRoomName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState<string>('Toilet')

  const isEditMode = !!editingRoom

  // Update form when editingRoom changes
  useEffect(() => {
    if (editingRoom) {
      setRoomName(editingRoom.name)
      setSelectedIcon(editingRoom.icon || 'Toilet')
    } else {
      setRoomName('')
      setSelectedIcon('Toilet')
    }
  }, [editingRoom])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (roomName.trim()) {
      if (isEditMode && editingRoom && onEdit) {
        onEdit(editingRoom.id, roomName.trim(), selectedIcon)
      } else {
        onAdd(roomName.trim(), selectedIcon)
      }
      setRoomName('')
      setSelectedIcon('Toilet')
    }
  }

  const handleClose = () => {
    setRoomName('')
    setSelectedIcon('Toilet')
    onClose()
  }

  // Handle clicking outside the modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  // Get the selected icon component for preview
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
          <CardTitle>{isEditMode ? 'Edit Room' : 'Add New Room'}</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {/* Icon Preview */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 flex items-center justify-center border rounded-lg bg-gray-50 dark:bg-zinc-800">
              {IconPreviewComponent ? (
                <IconPreviewComponent size={32} className="text-gray-700 dark:text-gray-300 scale-200" />
              ) : (
                <span className="text-2xl">...</span>
              )}
            </div>
          </div>

          <input
            type="text"
            value={roomName}
            onChange={(e) => {
              const value = e.target.value
              // Capitalize first character
              const capitalized = value.charAt(0).toUpperCase() + value.slice(1)
              setRoomName(capitalized)
            }}
            placeholder="Room name"
            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 
                       rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
                       dark:bg-zinc-800 dark:text-white"
            autoFocus
          />

          {/* Icon Selector */}
          <IconSelector
            icons={ICON_OPTIONS}
            selectedIcon={selectedIcon}
            onSelect={setSelectedIcon}
            customIconFolder="room"
            iconSource="custom"
          />

          <div className="flex gap-2 justify-end">
            <Button 
              type="submit" 
              onClick={handleSubmit}
              disabled={!roomName.trim()}
            >
              {isEditMode ? 'Save Changes' : 'Add Room'}
            </Button>
            <Button variant='secondary' className='cursor-pointer' onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}