"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/supabase"
import type { Subsection, Item } from "@/types/floorplan"
import ItemCard from "@/components/ui/floorplan/itemcard"
import { useAuth } from "@/hooks/useAuth"

export default function SubsectionModal({
  subsection,
  onClose,
  refresh,
}: {
  subsection: Subsection
  onClose: () => void
  refresh: () => void
}) {
  const { user } = useAuth()
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    fetchItems()
  }, [subsection.id])

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("items")
      .select(`
        *,
        last_completed_by_user:users(id, display_name, full_name)
      `)
      .eq("subsection_id", subsection.id)

    if (error) console.error("Error fetching items:", error)
    else setItems(data || [])
  }

  const addItem = async () => {
    const { data, error } = await supabase
      .from("items")
      .insert([
        {
          subsection_id: subsection.id,
          name: "New Item",
          frequency: "weekly",
          last_completed: null,
          last_completed_by: null,
        },
      ])
      .select()
      .single()

    if (!error && data) fetchItems()
  }

  const deleteItem = async (id: string) => {
    await supabase.from("items").delete().eq("id", id)
    fetchItems()
  }

  const renameItem = async (id: string, name: string) => {
    await supabase.from("items").update({ name }).eq("id", id)
    fetchItems()
  }

  const markCompleted = async (id: string) => {
    if (!user) return
    const now = new Date().toISOString()
    await supabase
      .from("items")
      .update({ last_completed: now, last_completed_by: user.id })
      .eq("id", id)

    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, last_completed: now, last_completed_by_user: user }
          : i
      )
    )
    refresh()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-2xl">{subsection.icon || "📦"}</span>
          {subsection.name}
        </h2>

        <div className="space-y-4">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onRename={renameItem}
              onDelete={deleteItem}
              onMarkCompleted={markCompleted}
            />
          ))}
        </div>

        <div className="mt-4">
          <button
            onClick={addItem}
            className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
          >
            + Add Item
          </button>
        </div>
      </div>
    </div>
  )
}
