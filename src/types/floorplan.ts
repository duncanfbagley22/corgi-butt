// src/types/floorplan.ts
export interface Item {
  id: string
  name: string
  frequency: string
  last_completed: string | null
  last_completed_by?: string
  last_completed_by_user?: {
    id: string
    display_name?: string
    full_name: string
  }
}

export interface Subsection {
  id: string
  name: string
  icon: string
  items: Item[]
}
