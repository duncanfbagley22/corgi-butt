// Status calculation utilities for items, subsections, and rooms
import type { Item, Subsection } from '@/types/floorplan'

export type ItemStatus = "done" | "soon" | "due" | "overdue"

export type OverallStatus = "done" | "soon" | "due" | "overdue"

export interface StatusResult {
  statusCounts: Record<ItemStatus, number>
  totalItems: number
  overallScore: number
  overallStatus: OverallStatus
}

// Weight mapping for each status
const STATUS_WEIGHTS: Record<ItemStatus, number> = {
  'done': 1.0,
  'soon': 0.9,
  'due': 0.5,
  'overdue': 0.4
}

// Existing item status function
export function getItemStatus(
  lastCompleted: string | null | undefined, 
  frequency: string | null | undefined
): ItemStatus {
  if (!lastCompleted) return "due"
  if (!frequency) return "due"

  const last = new Date(lastCompleted)
  const now = new Date()
  
  // Special handling for daily tasks
  if (frequency === "daily") {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const lastDate = new Date(last)
    lastDate.setHours(0, 0, 0, 0)
    
    if (lastDate.getTime() === today.getTime()) {
      return "done"
    } else {
      return "overdue"
    }
  }

  let frequencyDays: number

  switch (frequency) {
    case "biweekly":
      frequencyDays = 14
      break
    case "quarterly":
      frequencyDays = 90
      break
    case "weekly":
      frequencyDays = 7
      break
    case "monthly":
      frequencyDays = 30
      break
    case "yearly":
      frequencyDays = 365
      break
    default:
      return "due"
  }

  const timeSinceCompleted = now.getTime() - last.getTime()
  const daysSinceCompleted = timeSinceCompleted / (1000 * 60 * 60 * 24)
  
  // Calculate percentage thresholds
  const upToDateThreshold = frequencyDays * 0.75    // 75%
  const upcomingThreshold = frequencyDays * 0.85     // 85% 
  const dueSoonThreshold = frequencyDays * 1.0       // 100% (due date)
  const wayOverdueThreshold = frequencyDays * 1.15   // 115%

  if (daysSinceCompleted <= upToDateThreshold) {
    return "done"
  } else if (daysSinceCompleted <= upcomingThreshold) {
    return "soon"
  } else if (daysSinceCompleted <= dueSoonThreshold) {
    return "due"
  } else if (daysSinceCompleted <= wayOverdueThreshold) {
    return "overdue"
  } else {
    return "overdue"
  }
}

// Helper to determine overall status from score
function getOverallStatusFromScore(score: number): OverallStatus {
  if (score >= 0.9) return "done"
  if (score >= 0.75) return "soon"
  if (score >= 0.6) return "due"
  return "overdue"
}

// Helper to calculate status for a collection of items
function calculateStatusFromItems(items: Item[]): StatusResult {
  // Initialize counts
  const statusCounts: Record<ItemStatus, number> = {
    'done': 0,
    'soon': 0,
    'due': 0,
    'overdue': 0
  }

  // If no items, return empty result
  if (!items || items.length === 0) {
    return {
      statusCounts,
      totalItems: 0,
      overallScore: 0,
      overallStatus: 'overdue'
    }
  }

  // Count statuses for each item
  items.forEach(item => {
    let status: ItemStatus

    // Check for forced incomplete override
    if (item.forced_marked_incomplete === true) {
      // If forced incomplete, check if forced_completion_status is valid, otherwise default to "due"
      const forcedStatus = item.forced_completion_status
      if (forcedStatus && forcedStatus in STATUS_WEIGHTS) {
        status = forcedStatus as ItemStatus
      } else {
        status = "due"
      }
    } else {
      status = getItemStatus(item.last_completed, item.frequency)
    }

    statusCounts[status]++
  })

  // Calculate weighted score
  let totalWeightedScore = 0
  const totalItems = items.length

  Object.entries(statusCounts).forEach(([status, count]) => {
    const weight = STATUS_WEIGHTS[status as ItemStatus]
    totalWeightedScore += weight * count
  })

  const overallScore = totalWeightedScore / totalItems
  const overallStatus = getOverallStatusFromScore(overallScore)

  return {
    statusCounts,
    totalItems,
    overallScore,
    overallStatus
  }
}

// Get subsection status
export function getSubsectionStatus(items: Item[]): StatusResult {
  return calculateStatusFromItems(items)
}

// Get room status (aggregates all items from all subsections)
export function getRoomStatus(subsections: Subsection[]): StatusResult {
  // Flatten all items from all subsections
  const allItems = subsections.flatMap(subsection => subsection.items || [])
  return calculateStatusFromItems(allItems)
}