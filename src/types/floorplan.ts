// src/types/floorplan.ts
export interface Item {
  id: string
  name: string
  icon?: string
  description?: string
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

export type RoomData = {
  id: string
  name: string
  icon?: string
  size?: string
  left_percent: number
  top_percent: number
  width_percent: number
  height_percent: number
}
