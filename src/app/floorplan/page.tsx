'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/supabase'
import Floorplan from '@/components/ui/floorplan/floorplan'
import Room from '@/components/ui/floorplan/room'
import RoomDetail from '@/components/ui/floorplan/roomdetail'


type RoomData = {
  id: string
  name: string
  size?: string
  left_percent: number
  top_percent: number
  width_percent: number
  height_percent: number
}

export default function FloorplanPage() {
  const [rooms, setRooms] = useState<RoomData[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<{ 
    id: string; 
    name: string;
  } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch rooms from Supabase
  useEffect(() => {
    const fetchRooms = async () => {
      const { data, error } = await supabase.from('rooms').select('*')
      if (error) console.error('Error fetching rooms:', error)
      else setRooms(data)
    }

    fetchRooms()
  }, [])

  // Handle adding a new room
  const handleAddRoom = async (name: string) => {
    const newRoom = {
      name,
      left_percent: 10, // default position
      top_percent: 10,
      width_percent: 20, // default size
      height_percent: 15,
    }

    // Add to database
    const { data, error } = await supabase
      .from('rooms')
      .insert([newRoom])
      .select()
      .single()

    if (error) {
      console.error('Error adding room:', error)
      return
    }

    // Add to local state
    if (data) {
      setRooms((prev) => [...prev, data])
    }

    setShowAddForm(false)
  }

  // Handle room click for navigation
  const handleRoomClick = (roomId: string, roomName: string) => {
    const room = rooms.find(r => r.id === roomId)
    if (room) {
      console.log('Room found:', room) // Debug log
      setSelectedRoom({ 
        id: roomId, 
        name: roomName
      })
    } else {
      console.error('Room not found:', roomId) // Debug log
      // Fallback - still open the room but with default dimensions
      setSelectedRoom({ 
        id: roomId, 
        name: roomName
      })
    }
  }

  // Handle going back to main floorplan
  const handleBackToFloorplan = () => {
    setSelectedRoom(null)
  }
  const handleDeleteRoom = async (id: string) => {
    // Remove from database
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting room:', error)
      return
    }

    // Remove from local state
    setRooms((prev) => prev.filter(room => room.id !== id))
  }
  const handleUpdate = async (
    id: string,
    left: number,
    top: number,
    width: number,
    height: number
  ) => {
    // Update local state
    setRooms((prev) =>
      prev.map((room) =>
        room.id === id
          ? {
              ...room,
              left_percent: left,
              top_percent: top,
              width_percent: width,
              height_percent: height,
            }
          : room
      )
    )

    // Update database
    await supabase
      .from('rooms')
      .update({
        left_percent: left,
        top_percent: top,
        width_percent: width,
        height_percent: height,
      })
      .eq('id', id)
  }

if (selectedRoom) {
  console.log('Rendering RoomDetailPage for:', selectedRoom)
  return (
    <RoomDetail 
      roomId={selectedRoom.id} 
      roomName={selectedRoom.name} 
      onBack={handleBackToFloorplan} 
    />
  )
}

  return (
    <div>
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Add Room
        </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Add New Room</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const name = formData.get('name') as string
                if (name.trim()) {
                  handleAddRoom(name.trim())
                }
              }}
            >
              <input
                type="text"
                name="name"
                placeholder="Room name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded mb-4 dark:bg-zinc-700"
                autoFocus
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add Room
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Floorplan gridSize={20}>
        <div ref={containerRef} className="absolute inset-0">
          {rooms.map((room) => (
            <Room
              key={room.id}
              id={room.id}
              name={room.name}
              leftPercent={room.left_percent}
              topPercent={room.top_percent}
              widthPercent={room.width_percent}
              heightPercent={room.height_percent}
              onUpdate={handleUpdate}
              onDelete={handleDeleteRoom}
              onClick={handleRoomClick}
              gridSize={20} // match Floorplan grid
            />
          ))}
        </div>
      </Floorplan>
    </div>
  )
}