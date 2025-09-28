'use client'

// Floorplan Page - Displays the floorplan with rooms and allows adding/editing rooms
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/supabase'
import { RoomData } from '@/types/floorplan'

import Floorplan from '@/components/page-view/Floorplan'
import RoomDetail from '@/components/page-view/RoomDetail'

import GeometricBackground from '@/components/ui/geometric-background'

import RoomGrid from '@/components/ui/floorplan/roomgrid'

import AddRoomModal from '@/components/modals/addroommodal'

import SubsectionCard from '@/components/ui/cards/SubsectionCard'

import { Button } from '@/components/ui/button'
import { Plus, Layout, List, Lock, LockOpen } from 'lucide-react'

export default function FloorplanPage() {
  const [rooms, setRooms] = useState<RoomData[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<{ id: string; name: string } | null>(null)
  const [listView, setListView] = useState(false)
  const [editMode, setEditMode] = useState(false)

  // Fetch rooms from Supabase on mount
  useEffect(() => {
    const fetchRooms = async () => {
      const { data, error } = await supabase.from('rooms').select('*')
      if (error) console.error('Error fetching rooms:', error)
      else setRooms(data)
    }
    fetchRooms()
  }, [])

  // Handlers
    // Add Room
  const handleAddRoom = async (name: string, icon: string) => {
    const newRoom = { name, icon, left_percent: 10, top_percent: 10, width_percent: 20, height_percent: 15 }
    const { data, error } = await supabase.from('rooms').insert([newRoom]).select().single()
    if (error) console.error('Error adding room:', error)
    if (data) setRooms((prev) => [...prev, data])
    setShowAddForm(false)
  }
  // Select Room
  const handleRoomClick = (roomId: string, roomName: string) => setSelectedRoom({ id: roomId, name: roomName })
  // Back to Floorplan
  const handleBackToFloorplan = () => setSelectedRoom(null)
  // Delete Room
  const handleDeleteRoom = async (id: string) => {
    const { error } = await supabase.from('rooms').delete().eq('id', id)
    if (error) console.error('Error deleting room:', error)
    else setRooms((prev) => prev.filter(r => r.id !== id))
  }

  // Update Room Position/Size
  const handleUpdate = async (id: string, left: number, top: number, width: number, height: number) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, left_percent: left, top_percent: top, width_percent: width, height_percent: height } : r))
    await supabase.from('rooms').update({ left_percent: left, top_percent: top, width_percent: width, height_percent: height }).eq('id', id)
  }

  // Render Room Detail if a room is selected
  if (selectedRoom) {
    return <RoomDetail roomId={selectedRoom.id} roomName={selectedRoom.name} onBack={handleBackToFloorplan} />
  }

  return (
    <div>
      <GeometricBackground />

      <AddRoomModal isOpen={showAddForm} onClose={() => setShowAddForm(false)} onAdd={handleAddRoom} />

      {/* Toggle between list and floorplan */}
      {listView ? (
        <div className="max-w-md mx-auto grid grid-cols-3 gap-4 my-4 justify-items-center">
          {rooms.map((room) => (
            <SubsectionCard
              key={room.id}
              subsection={{ id: room.id, name: room.name, icon: room.icon, items: [] }}
              size={120} // smaller size for list view
              onClick={() => handleRoomClick(room.id, room.name)}
              onDelete={() => handleDeleteRoom(room.id)}
              onRename={(newName) => {
                setRooms(prev => prev.map(r => r.id === room.id ? { ...r, name: newName } : r))
                supabase.from('rooms').update({ name: newName }).eq('id', room.id)
              }}
            />
          ))}
        </div>
      ) : (
        <Floorplan gridSize={20}>
          <RoomGrid 
            rooms={rooms} 
            onUpdate={handleUpdate} 
            onDelete={handleDeleteRoom} 
            onClick={handleRoomClick} 
            gridSize={20}
            editMode={editMode}
          />
        </Floorplan>
      )}

      {/* Buttons */}
      <div className="flex justify-center mb-4 gap-2">
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus size={16} />
          Add Room
        </Button>

        <Button onClick={() => setListView(!listView)} className="flex items-center gap-2">
          {listView ? <Layout size={16} /> : <List size={16} />}
          {listView ? 'Floorplan View' : 'List View'}
        </Button>
        
        {/* Edit Mode Toggle - only show when not in list view */}
        {!listView && (
          <Button 
            onClick={() => setEditMode(!editMode)} 
            className="flex items-center gap-2 cursor-pointer"
            variant={editMode ? "outline" : "default"}
          >
            {editMode ? <LockOpen size={16} /> : <Lock size={16} />}
            {editMode ? 'Layout' : 'Layout'}
          </Button>
        )}
      </div>
    </div>
  )
}