"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/supabase"
import type { Subsection, Item } from "@/types/floorplan"
import ItemCard from "@/components/ui/floorplan/itemcard"
import { CompletionCard } from "@/components/ui/floorplan/CompletionCard"
import { ItemEditCard } from "@/components/ui/floorplan/ItemEditCard"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SubsectionModalProps {
  subsection: Subsection
  onClose: () => void
  refresh: () => void
}

export default function SubsectionModal({ subsection, onClose, refresh }: SubsectionModalProps) {
  const { user } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [showCompletion, setShowCompletion] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

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

  const renameItem = async (id: string, updates: Partial<Item>) => {
    await supabase.from("items").update(updates).eq("id", id)
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

  if (!subsection) return null

  const renderItems = () => {
    if (items.length === 0) {
      return (
        <p className="text-gray-500 dark:text-gray-400 text-center col-span-2">
          No items yet. Add one below.
        </p>
      )
    }

    if (editingItemId) {
      return items.map((item) => (
        <ItemEditCard
          key={item.id}
          item={item}
          onCancel={() => setEditingItemId(null)}
          onSave={(updates) => {
            renameItem(item.id, updates)
            setEditingItemId(null)
          }}
        />
      ))
    }

    if (showCompletion) {
      return items.map((item) => (
        <CompletionCard key={item.id} item={item} />
      ))
    }

    return items.map((item) => (
      <ItemCard
        key={item.id}
        item={item}
        onRename={(id, name) => renameItem(id, { name })}
        onDelete={deleteItem}
        onMarkCompleted={markCompleted}
      />
    ))
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <Card className="w-full max-w-lg p-6 relative">
        {/* Close X */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-white"
        >
          ✕
        </button>

        <CardHeader className="mb-4">
          <CardTitle>{subsection.name}</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-4">
          {editingItemId
            ? items.map((item) => (
                <ItemEditCard
                  key={item.id}
                  item={item}
                  onCancel={() => setEditingItemId(null)}
                  onSave={(updates) => {
                    renameItem(item.id, updates)
                    setEditingItemId(null)
                  }}
                />
              ))
            : showCompletion
            ? items.map((item) => <CompletionCard key={item.id} item={item} />)
            : items.length > 0
            ? items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onRename={(id, name) => renameItem(id, { name })}
                  onDelete={deleteItem}
                  onMarkCompleted={markCompleted}
                />
              ))
            : (
                <p className="text-gray-500 dark:text-gray-400 text-center col-span-2">
                  No items yet. Add one below.
                </p>
              )}
        </CardContent>

        {/* Bottom Buttons */}
        <div className="flex justify-between mt-4 gap-2">
          <Button size="sm" onClick={() => setShowCompletion(!showCompletion)}>
            {showCompletion ? "Hide Completion" : "Show Completion"}
          </Button>
          <Button size="sm" onClick={() => setEditingItemId(editingItemId ? null : "editing")}>
            Edit Items
          </Button>
          {!showCompletion && (
            <Button size="sm" onClick={addItem}>
              + Add Item
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}