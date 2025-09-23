import { useRef } from 'react'
import Room from '@/components/ui/floorplan/room'
import { RoomData } from '@/types/floorplan'
import * as Icons from 'lucide-react'

interface RoomGridProps {
  rooms: RoomData[]
  onUpdate: (id: string, left: number, top: number, width: number, height: number) => void
  onDelete: (id: string) => void
  onClick: (roomId: string, roomName: string) => void
  gridSize: number
}

export default function RoomGrid({ rooms, onUpdate, onDelete, onClick, gridSize }: RoomGridProps) {
  const containerRef = useRef(null)

  return (
    <div ref={containerRef} className="absolute inset-0">
      {rooms.map((room) => {
        // Get the Lucide icon component by name
         const IconComponent = room.icon ? (Icons as any)[room.icon] : undefined

        return (
          <Room
            key={room.id}
            id={room.id}
            name={room.name}
            icon={IconComponent} // pass it here
            leftPercent={room.left_percent}
            topPercent={room.top_percent}
            widthPercent={room.width_percent}
            heightPercent={room.height_percent}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onClick={onClick}
            gridSize={gridSize}
          />
        )
      })}
    </div>
  )
}