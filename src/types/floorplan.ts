// src/types/floorplan.ts
import * as RoomIcons from '@/components/icons/custom/room-icons'
import * as AreaIcons from '@/components/icons/custom/area-icons'
import * as TaskIcons from '@/components/icons/custom/task-icons'

export const CustomIcons = {
  ...RoomIcons,
  ...AreaIcons,
  ...TaskIcons,
}

export interface Task {
  id: string
  name: string
  icon?: string
  description?: string
  frequency: string
  last_completed_by?: string
  last_completed?: string | null
  last_completed_by_user?: {
    id: string
    display_name?: string
    full_name: string
  }
  forced_completion_status?: string  // Changed from boolean to string
  forced_marked_incomplete?: boolean
  area_id?: string  // Also good to add this
}

export interface Area {
  id: string
  name: string
  icon: string
  tasks: Task[]
  room_id?: string  // Also good to add this
}

export type RoomData = {
  id: string
  name: string
  icon?: string
  size?: string
  status?: string
  left_percent: number
  top_percent: number
  width_percent: number
  height_percent: number
  areas: Area[]
}

export type IconOption = {
  name: string
  component: keyof typeof CustomIcons
}