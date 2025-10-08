'use client'

import { useState, useEffect } from 'react'
import { Plus, Lock, LockOpen } from 'lucide-react'
import { supabase } from '@/lib/supabase/supabase'
import SubsectionCard from '@/components/ui/cards/SubsectionCard'
import SubsectionModal from '@/components/modals/SubsectionModal'
import AddSubsectionModal from '@/components/modals/AddSubsectionModal'
import EditSubsectionModal from '@/components/modals/EditSubsectionModal'
import type { Subsection } from '@/types/floorplan'
import { Button } from '@/components/ui/shadcn/button'
import GeometricBackground from '@/components/ui/other/background/Background'
import * as CustomIcons from '@/components/icons/custom/room-icons'
import * as LucideIcons from 'lucide-react'
import SubsectionFormModal from '@/components/modals/SubsectionFormModal'

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

  // --- Fetch Room Data ---
  const fetchData = async () => {
    const { data: subsectionsData, error: subError } = await supabase
      .from('subsections')
      .select('*')
      .eq('room_id', roomId)

    if (subError) {
      console.error('Error fetching subsections:', subError)
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
  }

  useEffect(() => {
    fetchData()
  }, [roomId])

  // ---- Subsections ----
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
      await fetchData() // Refresh to get updated data
    }
  }

  const handleCardClick = (sub: Subsection) => {
    if (editMode) {
      // In edit mode, open edit modal
      setEditingSubsection(sub)
    } else {
      // Normal mode, open subsection detail
      setSelectedSubsection(sub)
    }
  }

  return (
    <div className="p-6">
      <GeometricBackground />
      <div className="max-w-5xl mx-auto">
        {/* Header with Title and Buttons */}
        <div className="flex justify-between items-center mb-4">
          {/* Left side: Back Button + Room Title */}
          <div className="flex items-center gap-4">
            <Button onClick={onBack}>← Back</Button>

            {editingName ? (
              <input
                className="border px-3 py-2 rounded-lg dark:bg-zinc-800 dark:text-white 
                           focus:outline-none focus:ring-2 focus:ring-purple-500 text-2xl font-bold"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setEditingName(false)}
                autoFocus
              />
            ) : (
              <h1
                className="text-2xl font-bold leading-tight cursor-pointer font-sans"
                onClick={() => setEditingName(true)}
              >
                {name}
              </h1>
            )}
          </div>

          {/* Right side: Buttons */}
          <div className="flex gap-2">
            <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
              <Plus size={16} />
            </Button>

            <Button 
              onClick={() => setEditMode(!editMode)} 
              className="flex items-center gap-2"
              variant={editMode ? "outline" : "default"}
            >
              {editMode ? <LockOpen size={16} /> : <Lock size={16} />}
            </Button>
          </div>
        </div>

        <div className="text-2xl font-bold leading-tight cursor-pointer font-sans mb-4">
          Areas
        </div>

        {/* Subsection Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {subsections.map((sub) => {
            const IconComponent = sub.icon
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
              />
            )
          })}
        </div>
      </div>

      {/* Add Subsection Modal */}
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

      {/* Subsection Detail Modal */}
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