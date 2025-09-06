export function getItemStatus(lastCompleted: string | null | undefined, frequency: string | null | undefined): "due" | "up-to-date" | "overdue" {
  if (!lastCompleted) return "due"

  const last = new Date(lastCompleted)
  const now = new Date()

  let nextDue: Date

  switch (frequency) {
    case "daily":
      nextDue = new Date(last)
      nextDue.setDate(last.getDate() + 1)
      break
    case "weekly":
      nextDue = new Date(last)
      nextDue.setDate(last.getDate() + 7)
      break
    case "monthly":
      nextDue = new Date(last)
      nextDue.setMonth(last.getMonth() + 1)
      break
    default:
      return "due"
  }

  if (now >= nextDue) return "overdue"
  return "up-to-date"
}
