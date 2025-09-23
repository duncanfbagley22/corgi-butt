// components/ui/floorplan/CompletionCard.tsx
import * as LucideIcons from "lucide-react"
import { Calendar, CircleUserRound, Clock } from "lucide-react"
import type { Item } from "@/types/floorplan"

interface CompletionCardProps {
  item: Item
}

export function CompletionCard({ item }: CompletionCardProps) {
  // Render Lucide icon from item.icon string, fallback to emoji
  const IconComponent = item.icon
    ? (LucideIcons[item.icon as keyof typeof LucideIcons] as any)
    : null

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleDateString()
  }

  const getCompletedByName = () => {
    if (!item.last_completed_by_user) return "Unknown"
    return item.last_completed_by_user.display_name || 
           item.last_completed_by_user.full_name || 
           "Unknown"
  }

  return (
    <div className="group relative p-4 border rounded-lg shadow bg-white dark:bg-zinc-800 
                    flex flex-col items-center justify-center h-full">

      {/* Item Name */}
      <h3 className="font-semibold text-center mb-3 text-sm">
        {item.name}
      </h3>

      {/* Pills Container */}
      <div className="flex flex-col gap-3 w-full items-center">
        {/* Frequency Pill */}
        <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 
                        rounded-full text-sm font-medium flex items-center gap-2">
          <Clock size={16} />
          {item.frequency}
        </div>

        {/* Last Completed Pill */}
        <div className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 
                        rounded-full text-sm font-medium text-center flex items-center gap-2">
          <Calendar size={16} />
          {formatDate(item.last_completed)}
        </div>

        {/* Completed By Pill */}
        {item.last_completed && (
          <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 
                          rounded-full text-sm font-medium text-center flex items-center gap-2">
            <CircleUserRound size={16} />
            by {getCompletedByName()}
          </div>
        )}
      </div>
    </div>
  )
}