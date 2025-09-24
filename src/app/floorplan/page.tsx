'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/supabase'
import Floorplan from '@/components/page-view/floorplan'
import RoomDetail from '@/components/page-view/roomdetail'
import GeometricBackground from '@/components/ui/geometric-background'
import AddRoomModal from '@/components/modals/addroommodal'
import RoomGrid from '@/components/ui/floorplan/roomgrid'
import SubsectionCard from '@/components/ui/cards/SubsectionCard'
import { Button } from '@/components/ui/button'
import { RoomData } from '@/types/floorplan'
import { Plus, Layout, List } from 'lucide-react'

export default function FloorplanPage() {
  const [rooms, setRooms] = useState<RoomData[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<{ id: string; name: string } | null>(null)
  const [listView, setListView] = useState(false)

  useEffect(() => {
    const fetchRooms = async () => {
      const { data, error } = await supabase.from('rooms').select('*')
      if (error) console.error('Error fetching rooms:', error)
      else setRooms(data)
    }
    fetchRooms()
  }, [])

  const handleAddRoom = async (name: string, icon: string) => {
    const newRoom = { name, icon, left_percent: 10, top_percent: 10, width_percent: 20, height_percent: 15 }
    const { data, error } = await supabase.from('rooms').insert([newRoom]).select().single()
    if (error) console.error('Error adding room:', error)
    if (data) setRooms((prev) => [...prev, data])
    setShowAddForm(false)
  }

  const handleRoomClick = (roomId: string, roomName: string) => setSelectedRoom({ id: roomId, name: roomName })
  const handleBackToFloorplan = () => setSelectedRoom(null)

  const handleDeleteRoom = async (id: string) => {
    const { error } = await supabase.from('rooms').delete().eq('id', id)
    if (error) console.error('Error deleting room:', error)
    else setRooms((prev) => prev.filter(r => r.id !== id))
  }

  const handleUpdate = async (id: string, left: number, top: number, width: number, height: number) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, left_percent: left, top_percent: top, width_percent: width, height_percent: height } : r))
    await supabase.from('rooms').update({ left_percent: left, top_percent: top, width_percent: width, height_percent: height }).eq('id', id)
  }

  if (selectedRoom) {
    return <RoomDetail roomId={selectedRoom.id} roomName={selectedRoom.name} onBack={handleBackToFloorplan} />
  }

  return (
    <div>
      <GeometricBackground />

      <AddRoomModal isOpen={showAddForm} onClose={() => setShowAddForm(false)} onAdd={handleAddRoom} />

      {/* Toggle between list and floorplan */}
      {listView ? (
        <div className="max-w-md mx-auto grid grid-cols-2 gap-4 my-4">
          {rooms.map((room) => (
            <SubsectionCard
              key={room.id}
              subsection={{ id: room.id, name: room.name, icon: room.icon, items: [] }}
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
          <RoomGrid rooms={rooms} onUpdate={handleUpdate} onDelete={handleDeleteRoom} onClick={handleRoomClick} gridSize={20} />
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
      </div>
    </div>
  )
}
