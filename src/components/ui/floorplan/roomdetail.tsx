"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/supabase"
import SubsectionCard from "@/components/ui/floorplan/SubsectionCard"
import SubsectionModal from "@/components/ui/floorplan/SubsectionModal"
import type { Subsection, Item } from "@/types/floorplan"

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

  // --- Fetch Room Data ---
  const fetchData = async () => {
    const { data: subsectionsData, error: subError } = await supabase
      .from("subsections")
      .select("*")
      .eq("room_id", roomId)

    if (subError) {
      console.error("Error fetching subsections:", subError)
      return
    }

    const subsectionsWithItems: Subsection[] = await Promise.all(
      (subsectionsData || []).map(async (sub: any) => {
        const { data: itemsData, error: itemsError } = await supabase
          .from("items")
          .select("id, name, last_completed, frequency")
          .eq("subsection_id", sub.id)

        if (itemsError) console.error("Error fetching items:", itemsError)

        return { ...sub, items: itemsData || [] }
      })
    )

    setSubsections(subsectionsWithItems)
  }

  useEffect(() => {
    fetchData()
  }, [roomId])

  // ---- Subsections ----
  const addSubsection = async () => {
    const { data, error } = await supabase
      .from("subsections")
      .insert([{ room_id: roomId, name: "New Subsection", icon: "📦" }])
      .select()
      .single()

    if (error) return console.error("Error adding subsection:", error)

    setSubsections([...subsections, { ...data, items: [] }])
  }

  const deleteSubsection = async (id: string) => {
    const { error } = await supabase.from("subsections").delete().eq("id", id)
    if (error) console.error("Error deleting subsection:", error)
    else setSubsections(subsections.filter((s) => s.id !== id))
  }

  const renameSubsection = async (id: string, newName: string) => {
    const { error } = await supabase.from("subsections").update({ name: newName }).eq("id", id)
    if (error) console.error("Error renaming subsection:", error)
    else setSubsections(subsections.map((s) => (s.id === id ? { ...s, name: newName } : s)))
  }

  return (
    <div className="p-6">
      {/* Back Button */}
      <div className="mb-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="px-3 py-1 rounded bg-gray-500 text-white hover:bg-gray-600"
        >
          ← Back
        </button>

        {/* Room Title */}
        {editingName ? (
          <input
            className="border p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setEditingName(false)}
            autoFocus
          />
        ) : (
          <span
            className="text-2xl font-bold cursor-pointer"
            onClick={() => setEditingName(true)}
          >
            {name}
          </span>
        )}

        <span className="ml-auto text-sm text-gray-500">
          {new Date().toLocaleDateString()}
        </span>
      </div>

      {/* Add Subsection Button */}
      <button
        onClick={addSubsection}
        className="px-3 py-1 mb-4 rounded bg-blue-500 text-white hover:bg-blue-600"
      >
        + Add Subsection
      </button>

      {/* Subsection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subsections.map((sub) => (
          <SubsectionCard
            key={sub.id}
            subsection={sub}
            onClick={() => setSelectedSubsection(sub)}
            onDelete={() => deleteSubsection(sub.id)}
            onRename={(newName) => renameSubsection(sub.id, newName)}
          />
        ))}
      </div>

      {/* Subsection Modal */}
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
