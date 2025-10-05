'use client'

import { useState, useEffect } from 'react'
import * as LucideIcons from 'lucide-react'
import { supabase } from '@/lib/supabase/supabase'
import SubsectionCard from '@/components/ui/cards/SubsectionCard'
import SubsectionModal from '@/components/modals/SubsectionModal'
import AddSubsectionModal from '@/components/modals/AddSubsectionModal'
import type { Subsection } from '@/types/floorplan'
import { Button } from '@/components/ui/shadcn/button'
import GeometricBackground from '@/components/ui/other/background/Background'

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
  const [showAddModal, setShowAddModal] = useState(false)

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

  return (
    <div className="p-6">
      <GeometricBackground />
      <div className="max-w-5xl mx-auto">
        {/* Back Button + Room Title */}
        <div className="mb-6 flex items-center gap-4">
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
              className="text-2xl font-bold leading-tight cursor-pointer"
              onClick={() => setEditingName(true)}
            >
              {name}
            </h1>
          )}

          <div className="ml-10 inline-block bg-white dark:bg-zinc-800 px-3 py-1 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {new Date().toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Add Subsection Button */}
        <Button onClick={() => setShowAddModal(true)} className="mb-4">
          + Add Subsection
        </Button>

        {/* Subsection Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {subsections.map((sub) => {
            const IconComponent = sub.icon
              ? (LucideIcons[sub.icon as keyof typeof LucideIcons] as any)
              : null

            return (
              <SubsectionCard
                key={sub.id}
                subsection={sub}
                onClick={() => setSelectedSubsection(sub)}
                onDelete={() => deleteSubsection(sub.id)}
                onRename={(newName) => renameSubsection(sub.id, newName)}
              />
            )
          })}
        </div>
      </div>

      {/* Add Subsection Modal */}
      <AddSubsectionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(subName, icon) => {
          addSubsection(subName, icon)
          setShowAddModal(false)
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
