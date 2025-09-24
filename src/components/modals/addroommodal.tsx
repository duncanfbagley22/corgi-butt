'use client'

import { useState } from 'react'
import IconSelector from '@/components/ui/icon-selector'
import * as LucideIcons from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AddRoomModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (name: string, icon: string) => void
}

// Define icons as before
const ICON_OPTIONS_RAW = [
  { name: 'Home', component: 'Home' },
  { name: 'LampDesk', component: 'LampDesk' },
  { name: 'Bed', component: 'Bed' },
  { name: 'Bath', component: 'Bath' },
  { name: 'Armchair', component: 'Armchair' },
  { name: 'Utensils', component: 'Utensils' },
  { name: 'Dumbbell', component: 'Dumbbell' },
  { name: 'Refrigerator', component: 'Refrigerator' },
  { name: 'Car', component: 'Car' },
  { name: 'Footprints', component: 'Footprints' },
  { name: 'Shirt', component: 'Shirt' }
] as const

type IconOption = {
  name: string
  component: keyof typeof LucideIcons
}
const ICON_OPTIONS: IconOption[] = ICON_OPTIONS_RAW.map(i => ({
  name: i.name,
  component: i.component,
}))

export default function AddRoomModal({ isOpen, onClose, onAdd }: AddRoomModalProps) {
  const [roomName, setRoomName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState<string>('Home')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (roomName.trim()) {
      onAdd(roomName.trim(), selectedIcon)
      setRoomName('')
      setSelectedIcon('Home')
    }
  }

  const handleClose = () => {
    setRoomName('')
    setSelectedIcon('Home')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <Card className="w-full max-w-sm p-6">
        <CardHeader>
          <CardTitle>Add New Room</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Room name"
            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 
                       rounded-lg focus:outline-none focus:ring-2 focus:ring-black-500 
                       dark:bg-zinc-800 dark:text-white"
            autoFocus
          />

          {/* Icon Selector */}
          <IconSelector
            icons={ICON_OPTIONS}
            selectedIcon={selectedIcon}
            onSelect={setSelectedIcon}
          />

          <div className="flex gap-2 justify-end">
            <Button type="submit" onClick={handleSubmit}>
              Add Room
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
