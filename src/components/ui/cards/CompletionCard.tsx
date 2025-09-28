// components/ui/floorplan/CompletionCard.tsx
import * as LucideIcons from "lucide-react"
import { Calendar, CircleUserRound, Clock } from "lucide-react"
import type { Item } from "@/types/floorplan"

interface CompletionCardProps {
  item: Item
}

export function CompletionCard({ item }: CompletionCardProps) {
  // Render Lucide icon from item.icon string, fallback to Package
  const IconComponent = item.icon && LucideIcons[item.icon as keyof typeof LucideIcons]
    ? (LucideIcons[item.icon as keyof typeof LucideIcons] as any)
    : LucideIcons.Package // fallback icon

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

  // Get the most recent completion from history, fallback to last_completed for backwards compatibility
  const lastCompleted = item.last_completed || null

  return (
    <div className="relative w-36 h-36 cursor-pointer group">
      <div
        className={`flex flex-col items-center justify-center hover:scale-105 transform transition-transform duration-200 border rounded-2xl bg-gray-50 dark:bg-zinc-800 shadow-sm ${
          lastCompleted
            ? 'border-green-500 border-6 bg-green-50'
            : 'border-gray-300 dark:border-zinc-700'
        } w-full h-full p-4`}
      >
        {/* Icon and Name */}
        <div className="flex flex-col items-center mb-2">
          <h3 className="font-semibold text-center text-sm leading-tight">
            {item.name}
          </h3>
        </div>

        {/* Pills Container */}
        <div className="flex flex-col gap-1 w-full items-center">
          {/* Frequency Pill */}
          <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 
                          rounded-full text-xs font-medium flex items-center gap-1">
            <Clock size={12} />
            {item.frequency}
          </div>

          {/* Last Completed Pill */}
          <div className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 
                          rounded-full text-xs font-medium text-center flex items-center gap-1">
            <Calendar size={12} />
            {formatDate(lastCompleted)}
          </div>

          {/* Completed By Pill */}
          {lastCompleted && item.last_completed_by_user && (
            <div className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 
                            rounded-full text-xs font-medium text-center flex items-center gap-1 max-w-full">
              <CircleUserRound size={12} />
              <span className="truncate">
                {getCompletedByName()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}