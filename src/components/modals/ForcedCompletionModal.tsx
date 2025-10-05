// components/ui/floorplan/ForcedCompletionModal.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/shadcn/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card'

interface ForcedCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (status: string) => void
  itemName: string
}

const COMPLETION_STATUSES = [
  { value: 'due-soon', label: 'Low' },
  { value: 'overdue', label: 'Medium' },
  { value: 'way-overdue', label: 'High' },
]

export function ForcedCompletionModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
}: ForcedCompletionModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(COMPLETION_STATUSES[0].value)

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm(selectedStatus)
    setSelectedStatus(COMPLETION_STATUSES[0].value)
    onClose()
  }

  const handleClose = () => {
    setSelectedStatus(COMPLETION_STATUSES[0].value)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <Card className="w-full max-w-sm p-6">
        <CardHeader>
          <CardTitle>Update Completion Status</CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {itemName}
          </p>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Completion Priority:
            </label>
            <select
              id="status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 
                         rounded-lg focus:outline-none focus:ring-2 focus:ring-black-500 
                         dark:bg-zinc-800 dark:text-white"
            >
              {COMPLETION_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 justify-end">
            <Button onClick={handleConfirm}>
              Confirm
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