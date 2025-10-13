'use client'

import { useRef } from 'react'
import Room from '@/components/ui/floorplan/Room-temp'
import { RoomData } from '@/types/floorplan'

interface RoomGridProps {
  rooms: RoomData[]
  onUpdate: (id: string, left: number, top: number, width: number, height: number) => void
  onDelete: (id: string) => void
  onClick: (roomId: string, roomName: string) => void
  gridSize: number
  editMode: boolean
}

export default function RoomGrid({ rooms, onUpdate, onDelete, onClick, gridSize, editMode }: RoomGridProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  return (
    <div ref={containerRef} className="absolute inset-0">
      {rooms.map((room) => (
        <Room
          key={room.id}
          id={room.id}
          name={room.name}
          icon={room.icon} // <-- just pass the string now
          leftPercent={room.left_percent}
          topPercent={room.top_percent}
          widthPercent={room.width_percent}
          heightPercent={room.height_percent}
          subsections={room.subsections}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onClick={onClick}
          gridSize={gridSize}
          editMode={editMode}
        />
      ))}
    </div>
  )
}
