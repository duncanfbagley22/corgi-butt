// taskStatusChecker.ts
import { supabase } from "@/lib/supabase/supabase";

// Define possible status values
export type TaskStatus = 
  | "complete" 
  | "soon" 
  | "due" 
  | "overdue"
  | "neutral";

// Define status thresholds as percentages of frequency
export interface StatusThresholds {
  complete: number;   // <= this percentage
  soon: number;       // <= this percentage
  due: number;    // <= this percentage
  overdue: number;    // <= this percentage
}

// Default thresholds (can be customized)
const DEFAULT_THRESHOLDS: StatusThresholds = {
  complete: 75,      // 0% - just completed
  soon: 90,         // <= 50% of frequency elapsed
  due: 95,      // <= 80% of frequency elapsed
  overdue: 110,     // <= 100% of frequency elapsed
};

export interface TaskData {
  id: string;
  last_completed: string | null;
  frequency: number;
  forced_marked_incomplete?: boolean;
  forced_completion_status?: TaskStatus | null;
}

/**
 * Calculate the number of days between two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.floor((utc2 - utc1) / msPerDay);
}

/**
 * Determine task status based on days elapsed and frequency
 */
export function calculateTaskStatus(
  daysSinceCompletion: number,
  frequency: number,
  thresholds: StatusThresholds = DEFAULT_THRESHOLDS
): TaskStatus {
  const percentageElapsed = (daysSinceCompletion / frequency) * 100;

  // Console log the calculation
  // console.log('=== Task Status Calculation ===');
  // console.log('Days Since Completion:', daysSinceCompletion);
  // console.log('Frequency (days):', frequency);
  // console.log('Percentage Elapsed:', percentageElapsed.toFixed(2) + '%');
  // console.log('Thresholds:', thresholds);

  let status: TaskStatus;

  if (percentageElapsed <= thresholds.complete) {
    status = "complete";
  } else if (percentageElapsed <= thresholds.soon) {
    status = "soon";
  } else if (percentageElapsed <= thresholds.due) {
    status = "due";
  } else {
    status = "overdue";
  }

  // console.log('Calculated Status:', status);
  // console.log('==============================\n');

  return status;
}

/**
 * Get task status by task ID
 * @param taskId - The ID of the task to check
 * @param customThresholds - Optional custom thresholds
 * @returns The current status of the task
 */
export async function getTaskStatus(
  taskId: string,
  customThresholds?: StatusThresholds
): Promise<TaskStatus | null> {
  try {
    // Query the task from the database
    const { data: task, error } = await supabase
      .from("tasks")
      .select("id, last_completed, frequency, forced_marked_incomplete, forced_completion_status")
      .eq("id", taskId)
      .single();

    if (error) {
      console.error("Error fetching task:", error);
      return null;
    }

    if (!task) {
      console.error("Task not found");
      return null;
    }

    return getTaskStatusFromData(task, customThresholds);
  } catch (error) {
    console.error("Error in getTaskStatus:", error);
    return null;
  }
}

/**
 * Get task status from task data (useful when you already have the task data)
 * @param task - The task data
 * @param customThresholds - Optional custom thresholds
 * @returns The current status of the task
 */
export function getTaskStatusFromData(
  task: TaskData,
  customThresholds?: StatusThresholds
): TaskStatus {
  const thresholds = customThresholds || DEFAULT_THRESHOLDS;

  // console.log('=== getTaskStatusFromData Called ===');
  // console.log('Task ID:', task.id);
  // console.log('Last Completed:', task.last_completed);
  // console.log('Frequency:', task.frequency);
  // console.log('Forced Incomplete:', task.forced_marked_incomplete);

  // Check for forced incomplete status
  if (task.forced_marked_incomplete) {
    // console.log('Returning forced incomplete status:', task.forced_completion_status || "overdue");
    // console.log('====================================\n');
    return task.forced_completion_status || "overdue";
  }

  // If never completed, return neutral
  if (!task.last_completed) {
    // console.log('Task never completed - returning neutral');
    // console.log('====================================\n');
    return "neutral";
  }

  // Calculate days since completion
  const lastCompletedDate = new Date(task.last_completed);
  const today = new Date();
  const daysSinceCompletion = daysBetween(lastCompletedDate, today);

  // console.log('Last Completed Date:', lastCompletedDate.toISOString());
  // console.log('Today:', today.toISOString());
  // console.log('====================================\n');

  // Calculate and return status
  return calculateTaskStatus(daysSinceCompletion, task.frequency, thresholds);
}

/**
 * Get status for multiple tasks at once
 * @param taskIds - Array of task IDs
 * @param customThresholds - Optional custom thresholds
 * @returns Map of task IDs to their statuses
 */
export async function getMultipleTaskStatuses(
  taskIds: string[],
  customThresholds?: StatusThresholds
): Promise<Map<string, TaskStatus>> {
  const statusMap = new Map<string, TaskStatus>();

  try {
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("id, last_completed, frequency, forced_marked_incomplete, forced_completion_status")
      .in("id", taskIds);

    if (error) {
      console.error("Error fetching tasks:", error);
      return statusMap;
    }

    if (!tasks) {
      return statusMap;
    }

    tasks.forEach((task) => {
      const status = getTaskStatusFromData(task, customThresholds);
      statusMap.set(task.id, status);
    });

    return statusMap;
  } catch (error) {
    console.error("Error in getMultipleTaskStatuses:", error);
    return statusMap;
  }
}

/**
 * Get detailed status information
 */
export interface DetailedStatus {
  status: TaskStatus;
  daysSinceCompletion: number | null;
  percentageElapsed: number | null;
  daysUntilDue: number | null;
}

export function getDetailedTaskStatus(
  task: TaskData,
  customThresholds?: StatusThresholds
): DetailedStatus {
  const thresholds = customThresholds || DEFAULT_THRESHOLDS;

  if (task.forced_marked_incomplete) {
    return {
      status: task.forced_completion_status || "overdue",
      daysSinceCompletion: null,
      percentageElapsed: null,
      daysUntilDue: null,
    };
  }

  if (!task.last_completed) {
    return {
      status: "neutral",
      daysSinceCompletion: null,
      percentageElapsed: null,
      daysUntilDue: null,
    };
  }

  const lastCompletedDate = new Date(task.last_completed);
  const today = new Date();
  const daysSinceCompletion = daysBetween(lastCompletedDate, today);
  const percentageElapsed = (daysSinceCompletion / task.frequency) * 100;
  const daysUntilDue = task.frequency - daysSinceCompletion;

  return {
    status: calculateTaskStatus(daysSinceCompletion, task.frequency, thresholds),
    daysSinceCompletion,
    percentageElapsed,
    daysUntilDue,
  };
}