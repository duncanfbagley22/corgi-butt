'use client'

import { useState } from 'react'
import IconSelector from '@/components/ui/other/IconSelector'
import * as LucideIcons from 'lucide-react'
import { Button } from '@/components/ui/shadcn/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card'

interface AddSubsectionModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (name: string, icon: string) => void
}

// Icon options (reuse from rooms or define new)
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
] as const

type IconOption = {
  name: string
  component: keyof typeof LucideIcons
}

const ICON_OPTIONS: IconOption[] = ICON_OPTIONS_RAW.map(i => ({
  name: i.name,
  component: i.component,
}))

export default function AddSubsectionModal({ isOpen, onClose, onAdd }: AddSubsectionModalProps) {
  const [subName, setSubName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState<string>('Home')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (subName.trim()) {
      onAdd(subName.trim(), selectedIcon)
      setSubName('')
      setSelectedIcon('Home')
    }
  }

  const handleClose = () => {
    setSubName('')
    setSelectedIcon('Home')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <Card className="w-full max-w-sm p-6">
        <CardHeader>
          <CardTitle>Add New Subsection</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <input
            type="text"
            value={subName}
            onChange={(e) => setSubName(e.target.value)}
            placeholder="Subsection name"
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
              Add Subsection
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
