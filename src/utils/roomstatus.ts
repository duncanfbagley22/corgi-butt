// roomStatus.ts
import { supabase } from "@/lib/supabase/supabase";
import { getAreaStatusFromTasks, type AreaStatus } from "./areastatus";
import type { TaskStatus } from "./taskstatus";

// Define possible room status values
export type RoomStatus =
  | "complete"
  | "soon"
  | "due"
  | "overdue"
  | "neutral"; // For rooms with no areas or areas with no tasks

// Thresholds for room status based on weighted score
export interface RoomStatusThresholds {
  complete: number; // >= this percentage
  soon: number; // >= this percentage
  due: number; // >= this percentage
  // overdue is anything below due threshold
}

const DEFAULT_ROOM_THRESHOLDS: RoomStatusThresholds = {
  complete: 90,
  soon: 70,
  due: 40,
};

// Weight values for each area status
const AREA_STATUS_WEIGHTS: Record<AreaStatus, number> = {
  complete: 1.0,
  soon: 0.75,
  due: 0.5,
  overdue: 0.0,
  neutral: 0.5,
};

// Task type
interface TaskData {
  id: string;
  last_completed: string | null;
  frequency: number;
  forced_marked_incomplete?: boolean;
  forced_marked_complete?: boolean;
  forced_completion_status?: TaskStatus | null;
}

// Area type
export interface AreaWithTasks {
  id: string;
  name: string;
  room_id: string;
  tasks: TaskData[];
}

/**
 * Calculate room status based on the weighted scores of all areas
 */
export function calculateRoomStatus(
  areas: AreaWithTasks[],
  thresholds: RoomStatusThresholds = DEFAULT_ROOM_THRESHOLDS
): RoomStatus {
  if (areas.length === 0) {
    return "neutral";
  }

  let totalWeight = 0;
  let hasAnyTasks = false;

  areas.forEach((area) => {
    if (area.tasks && area.tasks.length > 0) {
      hasAnyTasks = true;
      const areaStatus = getAreaStatusFromTasks(area.tasks);
      totalWeight += AREA_STATUS_WEIGHTS[areaStatus];
    } else {
      totalWeight += AREA_STATUS_WEIGHTS.neutral;
    }
  });

  if (!hasAnyTasks) {
    return "neutral";
  }

  const percentageScore = (totalWeight / areas.length) * 100;

  let status: RoomStatus;
  if (percentageScore >= thresholds.complete) {
    status = "complete";
  } else if (percentageScore >= thresholds.soon) {
    status = "soon";
  } else if (percentageScore >= thresholds.due) {
    status = "due";
  } else {
    status = "overdue";
  }

  return status;
}

/**
 * Get room status by fetching all areas and tasks for that room
 */
export async function getRoomStatus(
  roomId: string,
  customThresholds?: RoomStatusThresholds
): Promise<RoomStatus> {
  try {
    const { data: areas, error } = await supabase
      .from("areas")
      .select(`
        id,
        name,
        room_id,
        tasks (
          id,
          last_completed,
          frequency,
          forced_marked_incomplete,
          forced_marked_complete,
          forced_completion_status
        )
      `)
      .eq("room_id", roomId);

    if (error) {
      console.error("Error fetching areas for room:", error);
      return "neutral";
    }

    if (!areas || areas.length === 0) {
      return "neutral";
    }

    return calculateRoomStatus(areas as AreaWithTasks[], customThresholds);
  } catch (error) {
    console.error("Error in getRoomStatus:", error);
    return "neutral";
  }
}

/**
 * Get room status from already-fetched area data
 */
export function getRoomStatusFromAreas(
  areas: AreaWithTasks[],
  customThresholds?: RoomStatusThresholds
): RoomStatus {
  return calculateRoomStatus(areas, customThresholds);
}

/**
 * Get status for multiple rooms at once
 */
export async function getMultipleRoomStatuses(
  roomIds: string[],
  customThresholds?: RoomStatusThresholds
): Promise<Map<string, RoomStatus>> {
  const statusMap = new Map<string, RoomStatus>();

  try {
    const { data: areas, error } = await supabase
      .from("areas")
      .select(`
        id,
        name,
        room_id,
        tasks (
          id,
          last_completed,
          frequency,
          forced_marked_incomplete,
          forced_marked_complete,
          forced_completion_status
        )
      `)
      .in("room_id", roomIds);

    if (error) {
      console.error("Error fetching areas for rooms:", error);
      return statusMap;
    }

    const areasData = areas as AreaWithTasks[];

    const areasByRoom = new Map<string, AreaWithTasks[]>();

    areasData.forEach((area) => {
      if (!areasByRoom.has(area.room_id)) {
        areasByRoom.set(area.room_id, []);
      }
      areasByRoom.get(area.room_id)!.push({
        id: area.id,
        name: area.name,
        room_id: area.room_id,
        tasks: area.tasks || [],
      });
    });

    roomIds.forEach((roomId) => {
      const roomAreas = areasByRoom.get(roomId) || [];
      const status = calculateRoomStatus(roomAreas, customThresholds);
      statusMap.set(roomId, status);
    });

    return statusMap;
  } catch (error) {
    console.error("Error in getMultipleRoomStatuses:", error);
    return statusMap;
  }
}

/**
 * Get detailed room status information
 */
export interface DetailedRoomStatus {
  status: RoomStatus;
  totalAreas: number;
  completeAreas: number;
  soonAreas: number;
  dueAreas: number;
  overdueAreas: number;
  neutralAreas: number;
  percentageScore: number;
}

export async function getDetailedRoomStatus(
  roomId: string,
  customThresholds?: RoomStatusThresholds
): Promise<DetailedRoomStatus> {
  const { data: areas, error } = await supabase
    .from("areas")
    .select(`
      id,
      name,
      room_id,
      tasks (
        id,
        last_completed,
        frequency,
        forced_marked_incomplete,
        forced_marked_complete,
        forced_completion_status
      )
    `)
    .eq("room_id", roomId);

  if (error || !areas || areas.length === 0) {
    return {
      status: "neutral",
      totalAreas: 0,
      completeAreas: 0,
      soonAreas: 0,
      dueAreas: 0,
      overdueAreas: 0,
      neutralAreas: 0,
      percentageScore: 0,
    };
  }

  const areasData = areas as AreaWithTasks[];

  let completeAreas = 0;
  let soonAreas = 0;
  let dueAreas = 0;
  let overdueAreas = 0;
  let neutralAreas = 0;
  let totalWeight = 0;

  areasData.forEach((area) => {
    const areaStatus = getAreaStatusFromTasks(area.tasks || []);
    totalWeight += AREA_STATUS_WEIGHTS[areaStatus];

    switch (areaStatus) {
      case "complete":
        completeAreas++;
        break;
      case "soon":
        soonAreas++;
        break;
      case "due":
        dueAreas++;
        break;
      case "overdue":
        overdueAreas++;
        break;
      case "neutral":
        neutralAreas++;
        break;
    }
  });

  const percentageScore = (totalWeight / areasData.length) * 100;
  const status = calculateRoomStatus(areasData, customThresholds);

  return {
    status,
    totalAreas: areasData.length,
    completeAreas,
    soonAreas,
    dueAreas,
    overdueAreas,
    neutralAreas,
    percentageScore,
  };
}
