'use client'

// Floorplan Page - Displays the floorplan with rooms and allows adding/editing rooms
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/supabase'
import { RoomData } from '@/types/floorplan'
import { getRoomStatus } from '@/utils/itemstatus'

import Floorplan from '@/components/page-view/Floorplan'
import RoomDetail from '@/components/page-view/RoomDetail'

import Background from '@/components/ui/other/background/Background'

import RoomGrid from '@/components/ui/floorplan/RoomGrid'

import AddRoomModal from '@/components/modals/AddRoomModal'

import RoomCard from '@/components/ui/cards/RoomCard'

import { Button } from '@/components/ui/shadcn/button'
import { Plus, Layout, List, Lock, LockOpen } from 'lucide-react'

export default function FloorplanPage() {
  const [rooms, setRooms] = useState<RoomData[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<{ id: string; name: string } | null>(null)
  const [listView, setListView] = useState(true)
  const [editMode, setEditMode] = useState(false)

  // Fetch rooms from Supabase on mount
  useEffect(() => {
    const fetchRooms = async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          subsections (
            id,
            name,
            icon,
            items (
              id,
              last_completed,
              frequency,
              forced_marked_incomplete,
              forced_completion_status
            )
          )
        `)
      
      console.log('Fetched rooms with subsections:', data) // Debug log
      
      if (error) {
        console.error('Error fetching rooms:', error)
      } else {
        // Calculate status for each room
        const roomsWithStatus = (data || []).map(room => {
          const statusResult = getRoomStatus(room.subsections || [])
          return {
            ...room,
            status: statusResult.overallStatus
          }
        })
        
        console.log('Rooms with calculated status:', roomsWithStatus) // Debug log
        setRooms(roomsWithStatus)
      }
    }
    fetchRooms()
  }, [])

  // Handlers
  // Add Room
  const handleAddRoom = async (name: string, icon: string) => {
    const newRoom = { name, icon, left_percent: 10, top_percent: 10, width_percent: 20, height_percent: 15 }
    const { data, error } = await supabase.from('rooms').insert([newRoom]).select().single()
    if (error) console.error('Error adding room:', error)
    if (data) {
      const roomWithStatus = {
        ...data,
        status: 'critical', // New rooms start with critical status (no items)
        subsections: []
      }
      setRooms((prev) => [...prev, roomWithStatus])
    }
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
      <Background />

      <AddRoomModal isOpen={showAddForm} onClose={() => setShowAddForm(false)} onAdd={handleAddRoom} />

      {/* Header with Title and Buttons */}
      <div className={`flex justify-between items-center mt-6 mb-4 ${listView ? 'max-w-md mx-auto' : 'mx-auto'}`} style={!listView ? { width: '800px' } : {}}>
        {/* Page Title */}
        <h1 className="text-2xl font-bold font-sans">
          {listView ? 'Rooms' : 'Floorplan'}
        </h1>

        {/* Buttons */}
        <div className="flex gap-2">
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <Plus size={16} />
          </Button>

          <Button onClick={() => {setListView(!listView); setEditMode(false)}} className="flex items-center gap-2">
            {listView ? <Layout size={16} /> : <List size={16} />}
          </Button>
          
          {/* Edit Mode Toggle - only show when not in list view */}
            <Button 
              onClick={() => setEditMode(!editMode)} 
              className="flex items-center gap-2 cursor-pointer"
              variant={editMode ? "outline" : "default"}
            >
              {editMode ? <LockOpen size={16} /> : <Lock size={16} />}
            </Button>
        </div>
      </div>

      {/* Toggle between list and floorplan */}
      {listView ? (
        <div className="max-w-md mx-auto grid grid-cols-3 gap-4 my-4 justify-items-center">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={{ id: room.id, name: room.name, icon: room.icon, subsections: room.subsections || [] }}
              size={120} // smaller size for list view
              onClick={() => handleRoomClick(room.id, room.name)}
              onDelete={() => handleDeleteRoom(room.id)}
              onRename={(newName) => {
                setRooms(prev => prev.map(r => r.id === room.id ? { ...r, name: newName } : r))
                supabase.from('rooms').update({ name: newName }).eq('id', room.id)
              }}
              editMode={editMode}
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
            gridSize={10}
            editMode={editMode}
          />
        </Floorplan>
      )}
    </div>
  )
}