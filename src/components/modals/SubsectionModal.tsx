"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase/supabase"
import type { Subsection, Item } from "@/types/floorplan"
import { ItemCard } from "@/components/ui/cards/ItemCard"
import { ItemFormModal } from "@/components/modals/ItemFormModal"
import { ForcedCompletionModal } from "@/components/modals/ForcedCompletionModal"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card"
import {
  TextSearch,
  Plus,
  Lock,
  LockOpen
} from "lucide-react"
import { Button } from '@/components/ui/shadcn/button'
import { LoadSpinner } from "@/components/ui/other/LoadSpinner"

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
  const [showItemFormModal, setShowItemFormModal] = useState(false)
  const [loading, setLoading] = useState(true)

  // Forced completion modal
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [selectedItemName, setSelectedItemName] = useState<string>('')

  // Lock background scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  // Fetch items function wrapped with useCallback
  const fetchItems = useCallback(async () => {
    setLoading(true)
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
    setLoading(false)
  }, [subsection.id])

  // Call fetchItems when modal opens or subsection changes
  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const [cardSize, setCardSize] = useState(160)

  useEffect(() => {
    const handleResize = () => {
      setCardSize(window.innerWidth < 768 ? 110 : 160)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const addItem = () => {
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
    setShowItemFormModal(true)
  }

  const deleteItem = async (id: string) => {
    setLoading(true)
    await supabase.from("items").delete().eq("id", id)
    await fetchItems()
    setLoading(false)
  }

  const renameItem = async (id: string, newName: string) => {
    setLoading(true)
    await supabase.from("items").update({ name: newName }).eq("id", id)
    await fetchItems()
    setLoading(false)
  }

  const handleItemSaved = (savedData: Partial<Item>) => {
    if (editingItem?.id) {
      setItems(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...savedData }
          : item
      ))
    } else {
      fetchItems()
    }
  }

  const markCompleted = async (id: string) => {
    if (!user || editMode) return
    setLoading(true)
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
    setLoading(false)
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
    setLoading(true)
    await supabase
      .from("items")
      .update({ 
        last_completed: null, 
        last_completed_by: null, 
        forced_marked_incomplete: true,
        forced_completion_status: status 
      })
      .eq("id", selectedItemId)
    
    setItems((prev) =>
      prev.map((i) =>
        i.id === selectedItemId
          ? { ...i, last_completed: null, last_completed_by_user: undefined }
          : i
      )
    )
    await fetchItems()
    refresh()
    setLoading(false)
  }

  const handleItemClick = (item: Item) => {
    if (editMode) {
      setEditingItem(item)
      setShowItemFormModal(true)
    } else {
      markCompleted(item.id)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  if (!subsection) return null

  return (
    <>
      <div
        className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
        onClick={handleBackdropClick}
      >
        <Card className="md:w-full max-w-2xl relative h-130 md:h-170 mb-4">
          <CardHeader className="mb-0 pb-0 sticky z-10 backdrop-blur-md">
            <div className="flex items-center justify-between gap-4">
              <CardTitle
                className="font-bold flex-shrink"
                style={{ fontFamily: 'DM Sans, sans-serif',
                  fontSize: 'clamp(1rem, 2.5vw, 1.5rem)'
                }}
                title={subsection.name}
              >
                {subsection.name}
              </CardTitle>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button title="Add item" size="icon" onClick={addItem}>
                  <Plus size={18} />
                </Button>

                <Button
                  title={showCompletion ? "Hide details" : "Show details"}
                  size="icon"
                  variant={showCompletion ? "outline" : "default"}
                  onClick={() => setShowCompletion(!showCompletion)}
                >
                  <TextSearch size={18} />
                </Button>

                <Button
                  title={editMode ? "Exit edit mode" : "Edit items"}
                  size="icon"
                  variant={editMode ? "outline" : "default"}
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? <LockOpen size={18} /> : <Lock size={18} />}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="grid md:grid-cols-3 grid-cols-2 gap-4 place-items-center pt-2 pb-2 overflow-y-auto max-h-[calc(90vh-4rem)]">
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
                  size={cardSize}
                />
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center col-span-full py-8">
                No items yet. Add one above.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <LoadSpinner size="lg" text="Loading items..." />
        </div>
      )}

      {showItemFormModal && editingItem && (
        <ItemFormModal
          item={editingItem}
          subsectionId={subsection.id}
          isOpen={showItemFormModal}
          onClose={() => {
            setShowItemFormModal(false)
            setEditingItem(null)
          }}
          onSaved={handleItemSaved}
        />
      )}

      <ForcedCompletionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleStatusUpdate}
        itemName={selectedItemName}
      />
    </>
  )
}
