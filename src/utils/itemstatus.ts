export function getItemStatus(
  lastCompleted: string | null | undefined, 
  frequency: string | null | undefined
): "due" | "up-to-date" | "upcoming" | "due-soon" | "overdue" | "way-overdue" {
  if (!lastCompleted) return "due"

  const last = new Date(lastCompleted)
  const now = new Date()
  
  // Special handling for daily tasks
  if (frequency === "daily") {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const lastDate = new Date(last)
    lastDate.setHours(0, 0, 0, 0)
    
    if (lastDate.getTime() === today.getTime()) {
      return "up-to-date"
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
    return "up-to-date"
  } else if (daysSinceCompleted <= upcomingThreshold) {
    return "upcoming"
  } else if (daysSinceCompleted <= dueSoonThreshold) {
    return "due-soon"
  } else if (daysSinceCompleted <= wayOverdueThreshold) {
    return "overdue"
  } else {
    return "way-overdue"
  }
}