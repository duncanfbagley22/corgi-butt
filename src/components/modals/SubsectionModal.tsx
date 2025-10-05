"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/supabase"
import type { Subsection, Item } from "@/types/floorplan"
import { ItemCard } from "@/components/ui/cards/ItemCard"
import { ItemEditModal } from "@/components/modals/ItemEditModal"
import { ForcedCompletionModal } from "@/components/modals/ForcedCompletionModal"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card"
import {
  X,
  TextSearch,
  SquarePen,
  Plus,
  Eye,
  SquareStar
} from "lucide-react"

interface SubsectionModalProps {
  subsection: Subsection
  onClose: () => void
  refresh: () => void
}

export default function SubsectionModal({
  subsection,
  onClose,
  refresh,
}: SubsectionModalProps) {
  const { user } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [showCompletion, setShowCompletion] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [showItemEditModal, setShowItemEditModal] = useState(false)
  
  // States for forced completion modal
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [selectedItemName, setSelectedItemName] = useState<string>('')

  useEffect(() => {
    fetchItems()
  }, [subsection.id])

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("items")
      .select(
        `
        *,
        last_completed_by_user:users(id, display_name, full_name)
      `
      )
      .eq("subsection_id", subsection.id)
      .order("created_at", { ascending: true })

    if (error) console.error("Error fetching items:", error)
    else setItems(data || [])
  }

  const addItem = async () => {
    // Always open modal to create new item
    setEditingItem({
      id: '',
      subsection_id: subsection.id,
      name: '',
      frequency: 'weekly',
      last_completed: null,
      last_completed_by: undefined,
      description: '',
      icon: '',
    } as Item)
    setShowItemEditModal(true)
  }

  const deleteItem = async (id: string) => {
    await supabase.from("items").delete().eq("id", id)
    fetchItems()
  }

  const renameItem = async (id: string, newName: string) => {
    await supabase.from("items").update({ name: newName }).eq("id", id)
    fetchItems()
  }

  const handleItemSaved = (savedData: Partial<Item>) => {
    if (editingItem?.id) {
      // Update existing item in local state immediately
      setItems(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...savedData }
          : item
      ))
    } else {
      // For new items, just refetch since we don't have the new ID
      fetchItems()
    }
  }

  const markCompleted = async (id: string) => {
    if (!user || editMode) return // Don't mark completed in edit mode
    const now = new Date().toISOString()
    await supabase
      .from("items")
      .update({ last_completed: now, last_completed_by: user.id, forced_marked_incomplete: false, forced_completion_status: null })
      .eq("id", id)

    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, last_completed: now, last_completed_by_user: user }
          : i
      )
    )
    await fetchItems()
    refresh()
  }

  const markIncomplete = async (id: string) => {
    const item = items.find(i => i.id === id)
    if (!item) return
    
    setSelectedItemId(id)
    setSelectedItemName(item.name)
    setModalOpen(true)
  }

  const handleStatusUpdate = async (status: string) => {
    if (!selectedItemId) return
    
    await supabase
      .from("items")
      .update({ 
        last_completed: null, 
        last_completed_by: null, 
        forced_marked_incomplete: true,
        forced_completion_status: status 
      })
      .eq("id", selectedItemId)
    
    setItems((prev) => {
      const updated = prev.map((i) =>
        i.id === selectedItemId
          ? { ...i, last_completed: null, last_completed_by_user: undefined }
          : i
      )
      return updated
    })
    await fetchItems()
    refresh()
  }

  const handleItemClick = (item: Item) => {
    if (editMode) {
      setEditingItem(item)
      setShowItemEditModal(true)
    } else {
      markCompleted(item.id)
    }
  }

  if (!subsection) return null

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
        <Card className="w-full max-w-2xl p-6 relative pb-8">
          {/* Close Button - isolated top right */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X size={22} />
          </button>

          <CardHeader className="flex flex-row items-center justify-between mb-4">
            {/* Left side: Title + Action Icons */}
            <div className="flex items-center gap-3">
              <CardTitle className="text-4xl">{subsection.name}</CardTitle>
              <div className="flex gap-2">
            <span
              title={showCompletion ? "Hide details" : "Show details"}
              className={`p-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-purple-100 dark:hover:bg-purple-700 cursor-pointer transition ${
                showCompletion ? 'bg-purple-200 dark:bg-purple-800' : ''
              }`}
              onClick={() => setShowCompletion(!showCompletion)}
            >
              {showCompletion ? (
                <SquareStar size={36} className="text-gray-600 dark:text-gray-300" />
              ) : (
                <TextSearch size={36} className="text-gray-600 dark:text-gray-300" />
              )}
            </span>

                <span
                  title={editMode ? "Exit edit mode" : "Edit items"}
                  className={`p-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-purple-100 dark:hover:bg-purple-700 cursor-pointer transition ${
                    editMode ? 'bg-purple-200 dark:bg-purple-800' : ''
                  }`}
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? (
                    <Eye size={36} className="text-gray-600 dark:text-gray-300" />
                  ) : (
                    <SquarePen size={36} className="text-gray-600 dark:text-gray-300" />
                  )}
                </span>

                <span
                  title="Add item"
                  className="p-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-purple-100 dark:hover:bg-purple-700 cursor-pointer transition"
                  onClick={addItem}
                >
                  <Plus size={36} className="text-gray-600 dark:text-gray-300" />
                </span>
              </div>
            </div>
          </CardHeader>

        <CardContent className="grid grid-cols-2 gap-4 place-items-center">
          {items.length > 0 ? (
            items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                showCompletion={showCompletion}
                onRename={renameItem}
                onDelete={deleteItem}
                onItemClick={handleItemClick}
                onMarkIncomplete={markIncomplete}
                editMode={editMode}
              />
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center col-span-2">
              No items yet. Add one below.
            </p>
          )}
        </CardContent>
        </Card>
      </div>

      {/* Item Edit Modal */}
      {showItemEditModal && editingItem && (
        <ItemEditModal
          item={editingItem}
          subsectionId={subsection.id}
          isOpen={showItemEditModal}
          onClose={() => {
            setShowItemEditModal(false)
            setEditingItem(null)
          }}
          onSaved={handleItemSaved}
        />
      )}

      {/* Forced Completion Modal */}
      <ForcedCompletionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleStatusUpdate}
        itemName={selectedItemName}
      />
    </>
  )
}