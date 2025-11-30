// areaStatus.ts
import { supabase } from "@/lib/supabase/supabase";
import { getTaskStatusFromData, type TaskStatus } from "./taskstatus";

// Define possible area status values
export type AreaStatus = 
  | "complete" 
  | "soon" 
  | "due" 
  | "overdue"
  | "neutral"; // For areas with no tasks or tasks with no status

// Thresholds for area status based on weighted score
export interface AreaStatusThresholds {
  complete: number;   // >= this percentage
  soon: number;       // >= this percentage
  due: number;        // >= this percentage
  // overdue is anything below due threshold
}

const DEFAULT_AREA_THRESHOLDS: AreaStatusThresholds = {
  complete: 90,  // >= 90%
  soon: 70,      // >= 70%
  due: 40,     // >= 40%
};

// Weight values for each task status
const TASK_STATUS_WEIGHTS: Record<TaskStatus, number> = {
  complete: 1.0,   // 100%
  soon: 0.75,      // 75%
  due: 0.5,        // 50%
  overdue: 0.0,    // 0%
  neutral: 0.5,   // 50% for neutral tasks
};

interface TaskData {
  id: string;
  last_completed: string | null;
  area_id?: string; // only needed for multiple-area mapping
  frequency: number;
  forced_marked_incomplete?: boolean;
  forced_completion_status?: TaskStatus | null;
}

/**
 * Calculate area status based on the weighted scores of all tasks
 */
export function calculateAreaStatus(
  tasks: TaskData[],
  thresholds: AreaStatusThresholds = DEFAULT_AREA_THRESHOLDS
): AreaStatus {
  // If no tasks, return neutral
  if (tasks.length === 0) {
    return "neutral";
  }

  // Calculate weighted score
  let totalWeight = 0;
  let hasAnyStatus = false;

  tasks.forEach((task) => {
    const taskStatus = getTaskStatusFromData(task);
    
    // Check if task has meaningful status (forced or completed)
    if (task.forced_marked_incomplete || task.last_completed) {
      hasAnyStatus = true;
    }
    
    totalWeight += TASK_STATUS_WEIGHTS[taskStatus];
  });

  // If no tasks have been completed or set, return neutral
  if (!hasAnyStatus) {
    return "neutral";
  }

  // Calculate percentage score
  const percentageScore = (totalWeight / tasks.length) * 100;

  // console.log('=== Area Status Calculation ===');
  // console.log('Total Tasks:', tasks.length);
  // console.log('Total Weight:', totalWeight);
  // console.log('Percentage Score:', percentageScore.toFixed(2) + '%');
  // console.log('Thresholds:', thresholds);

  // Determine status based on thresholds
  let status: AreaStatus;
  if (percentageScore >= thresholds.complete) {
    status = "complete";
  } else if (percentageScore >= thresholds.soon) {
    status = "soon";
  } else if (percentageScore >= thresholds.due) {
    status = "due";
  } else {
    status = "overdue";
  }

  // console.log('Calculated Area Status:', status);
  // console.log('==============================\n');

  return status;
}

/**
 * Get area status by fetching all tasks for that area
 */
export async function getAreaStatus(
  areaId: string,
  customThresholds?: AreaStatusThresholds
): Promise<AreaStatus> {
  try {
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("id, last_completed, frequency, forced_marked_incomplete, forced_completion_status")
      .eq("area_id", areaId);

    if (error) {
      console.error("Error fetching tasks for area:", error);
      return "neutral";
    }

    if (!tasks || tasks.length === 0) {
      return "neutral";
    }

    return calculateAreaStatus(tasks, customThresholds);
  } catch (error) {
    console.error("Error in getAreaStatus:", error);
    return "neutral";
  }
}

/**
 * Get area status from already-fetched task data
 */
export function getAreaStatusFromTasks(
  tasks: TaskData[],
  customThresholds?: AreaStatusThresholds
): AreaStatus {
  return calculateAreaStatus(tasks, customThresholds);
}

/**
 * Get status for multiple areas at once
 */
export async function getMultipleAreaStatuses(
  areaIds: string[],
  customThresholds?: AreaStatusThresholds
): Promise<Map<string, AreaStatus>> {
  const statusMap = new Map<string, AreaStatus>();

  // Return empty map if no area IDs provided
  if (!areaIds || areaIds.length === 0) {
    return statusMap;
  }

  try {
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("id, area_id, last_completed, frequency, forced_marked_incomplete, forced_completion_status")
      .in("area_id", areaIds);

    if (error) {
      console.error("Error fetching tasks for areas:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error details:", error.details);
      console.error("Area IDs:", areaIds);
      return statusMap;
    }

    // Group tasks by area_id
    const tasksByArea = new Map<string, TaskData[]>();
    
(tasks as TaskData[]).forEach((task) => {
  if (!task.area_id) return; // safety check

  if (!tasksByArea.has(task.area_id)) {
    tasksByArea.set(task.area_id, []);
  }
  tasksByArea.get(task.area_id)!.push(task);
});

    // Calculate status for each area
    areaIds.forEach((areaId) => {
      const areaTasks = tasksByArea.get(areaId) || [];
      const status = calculateAreaStatus(areaTasks, customThresholds);
      statusMap.set(areaId, status);
    });

    return statusMap;
  } catch (error) {
    console.error("Exception in getMultipleAreaStatuses:", error);
    return statusMap;
  }
}

/**
 * Get detailed area status information
 */
export interface DetailedAreaStatus {
  status: AreaStatus;
  totalTasks: number;
  completeTasks: number;
  soonTasks: number;
  dueTasks: number;
  overdueTasks: number;
  percentageScore: number;
}

export async function getDetailedAreaStatus(
  areaId: string,
  customThresholds?: AreaStatusThresholds
): Promise<DetailedAreaStatus> {
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("id, last_completed, frequency, forced_marked_incomplete, forced_completion_status")
    .eq("area_id", areaId);

  if (error || !tasks || tasks.length === 0) {
    return {
      status: "neutral",
      totalTasks: 0,
      completeTasks: 0,
      soonTasks: 0,
      dueTasks: 0,
      overdueTasks: 0,
      percentageScore: 0,
    };
  }

  let completeTasks = 0;
  let soonTasks = 0;
  let dueTasks = 0;
  let overdueTasks = 0;
  let totalWeight = 0;

  tasks.forEach((task) => {
    const taskStatus = getTaskStatusFromData(task);
    totalWeight += TASK_STATUS_WEIGHTS[taskStatus];

    switch (taskStatus) {
      case "complete":
        completeTasks++;
        break;
      case "soon":
        soonTasks++;
        break;
      case "due":
        dueTasks++;
        break;
      case "overdue":
        overdueTasks++;
        break;
    }
  });

  const percentageScore = (totalWeight / tasks.length) * 100;
  const status = calculateAreaStatus(tasks, customThresholds);

  return {
    status,
    totalTasks: tasks.length,
    completeTasks,
    soonTasks,
    dueTasks,
    overdueTasks,
    percentageScore,
  };
}