'use client'

import type { ComponentType, SVGProps } from 'react'
import * as LucideIcons from 'lucide-react'
import * as CustomRoomIcons from '@/components/icons/custom/room-icons'
import * as CustomAreaIcons from '@/components/icons/custom/area-icons'
import * as CustomTaskIcons from '@/components/icons/custom/task-icons'

export type CustomIconFolder = 'room' | 'area' | 'task'

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number
  strokeWidth?: number
}

export function getIconComponent(
  iconName: string,
  folder: CustomIconFolder = 'room'
): ComponentType<IconProps> | null {
  let CustomIcons: Record<string, ComponentType<IconProps>>

  switch (folder) {
    case 'area':
      CustomIcons = CustomAreaIcons
      break
    case 'task':
      CustomIcons = CustomTaskIcons
      break
    case 'room':
    default:
      CustomIcons = CustomRoomIcons
  }

  return CustomIcons[iconName] || (LucideIcons as unknown as Record<string, ComponentType<IconProps>>)[iconName] || null
}
