'use client'

import { useState, useEffect } from 'react'
import { Plus, Lock, LockOpen } from 'lucide-react'
import { supabase } from '@/lib/supabase/supabase'
import SubsectionCard from '@/components/ui/cards/SubsectionCard'
import SubsectionModal from '@/components/modals/SubsectionModal'
import type { Subsection } from '@/types/floorplan'
import { Button } from '@/components/ui/shadcn/button'
import GeometricBackground from '@/components/ui/other/background/Background'
import * as CustomIcons from '@/components/icons/custom/room-icons'
import * as LucideIcons from 'lucide-react'
import SubsectionFormModal from '@/components/modals/SubsectionFormModal'
import LoadSpinner from '@/components/ui/other/LoadSpinner'

interface RoomDetailProps {
  roomId: string
  roomName: string
  onBack: () => void
}

export default function RoomDetail({ roomId, roomName, onBack }: RoomDetailProps) {
  const [subsections, setSubsections] = useState<Subsection[]>([])
  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState(roomName)
  const [selectedSubsection, setSelectedSubsection] = useState<Subsection | null>(null)
  const [editingSubsection, setEditingSubsection] = useState<Subsection | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [cardSize, setCardSize] = useState(160)
  const [loading, setLoading] = useState(true) // 🌀 new loading state

  useEffect(() => {
    const handleResize = () => {
      setCardSize(window.innerWidth < 768 ? 110 : 160)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // --- Fetch Room Data ---
  const fetchData = async () => {
    setLoading(true)
    const { data: subsectionsData, error: subError } = await supabase
      .from('subsections')
      .select('*')
      .eq('room_id', roomId)

    if (subError) {
      console.error('Error fetching subsections:', subError)
      setLoading(false)
      return
    }

    const subsectionsWithItems: Subsection[] = await Promise.all(
      (subsectionsData || []).map(async (sub: any) => {
        const { data: itemsData, error: itemsError } = await supabase
          .from('items')
          .select('id, icon, name, last_completed, frequency, forced_marked_incomplete, forced_completion_status')
          .eq('subsection_id', sub.id)

        if (itemsError) console.error('Error fetching items:', itemsError)
        return { ...sub, items: itemsData || [] }
      })
    )

    setSubsections(subsectionsWithItems)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [roomId])

  // ---- Subsection CRUD ----
  const addSubsection = async (subName: string, icon: string) => {
    const { data, error } = await supabase
      .from('subsections')
      .insert([{ room_id: roomId, name: subName, icon }])
      .select()
      .single()

    if (error) return console.error('Error adding subsection:', error)
    setSubsections([...subsections, { ...data, items: [] }])
  }

  const deleteSubsection = async (id: string) => {
    const { error } = await supabase.from('subsections').delete().eq('id', id)
    if (error) console.error('Error deleting subsection:', error)
    else setSubsections(subsections.filter((s) => s.id !== id))
  }

  const renameSubsection = async (id: string, newName: string) => {
    const { error } = await supabase.from('subsections').update({ name: newName }).eq('id', id)
    if (error) console.error('Error renaming subsection:', error)
    else setSubsections(subsections.map((s) => (s.id === id ? { ...s, name: newName } : s)))
  }

  const updateSubsection = async (id: string, name: string, icon: string) => {
    const { error } = await supabase.from('subsections').update({ name, icon }).eq('id', id)
    if (error) console.error('Error updating subsection:', error)
    else {
      setSubsections(subsections.map((s) => (s.id === id ? { ...s, name, icon } : s)))
      await fetchData()
    }
  }

  const handleCardClick = (sub: Subsection) => {
    if (editMode) setEditingSubsection(sub)
    else setSelectedSubsection(sub)
  }

  return (
    <div>
      <GeometricBackground />
      <div className="max-w-4xl mx-auto w-full">
        {/* Header with Title and Buttons */}
        <div className="sticky top-0 z-10 grid grid-cols-3 items-center px-4 mb-2 pt-6 pb-4 md:backdrop-blur-none backdrop-blur-md">
          <div className="flex justify-start">
            <Button onClick={onBack} style={{ height: '40px' }}>← Back</Button>
          </div>

          <h1
            className="text-3xl font-bold leading-tight cursor-pointer text-center"
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 'clamp(0.875rem, 3vw, 1.5rem)',
              maxWidth: '100%',
            }}
            onClick={() => setEditingName(true)}
          >
            {name}
          </h1>

          <div className="flex gap-2 justify-end">
            <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2"
              style={{ width: '50px', height: '40px' }}>
              <Plus size={16} />
            </Button>

            <Button 
              onClick={() => setEditMode(!editMode)} 
              className="flex items-center gap-2"
              variant={editMode ? "outline" : "default"}
              style={{ width: '50px', height: '40px' }}
            >
              {editMode ? <LockOpen size={16} /> : <Lock size={16} />}
            </Button>
          </div>
        </div>

        <div className="text-2xl font-bold leading-tight mb-4 px-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          Areas
        </div>

        {/* 🌀 Loading Spinner or Subsection Grid */}
        <div className="px-4 my-4 flex justify-center items-center">
          {loading ? (
            <LoadSpinner text="Loading sections..." />
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4 justify-items-center w-full">
              {subsections.map((sub) => {
                const IconComponent =
                  sub.icon
                    ? (CustomIcons[sub.icon as keyof typeof CustomIcons] as any) ||
                      (LucideIcons[sub.icon as keyof typeof LucideIcons] as any)
                    : null

                return (
                  <SubsectionCard
                    key={sub.id}
                    subsection={sub}
                    onClick={() => handleCardClick(sub)}
                    onDelete={() => deleteSubsection(sub.id)}
                    onRename={(newName) => renameSubsection(sub.id, newName)}
                    editMode={editMode}
                    size={cardSize}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modals */}
      <SubsectionFormModal
        isOpen={showAddModal}
        mode="add"
        onClose={() => setShowAddModal(false)}
        onSubmit={(subName, icon) => {
          addSubsection(subName, icon)
          setShowAddModal(false)
        }}
      />

      <SubsectionFormModal
        isOpen={!!editingSubsection}
        mode="edit"
        subsection={editingSubsection}
        onClose={() => setEditingSubsection(null)}
        onSubmit={(name, icon) => {
          if (editingSubsection) {
            updateSubsection(editingSubsection.id, name, icon)
          }
          setEditingSubsection(null)
        }}
      />

      {selectedSubsection && (
        <SubsectionModal
          subsection={selectedSubsection}
          onClose={() => setSelectedSubsection(null)}
          refresh={fetchData}
        />
      )}
    </div>
  )
}
