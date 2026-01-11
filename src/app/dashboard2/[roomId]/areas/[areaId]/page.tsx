"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/supabase";
import { useRouter, useParams } from "next/navigation";
import { theme } from "../../../../../../config/theme";
import Loader from "@/components/v2/other/Loader";
import PageTitle from "@/components/v2/headings/PageTitle";
import MainBackground from "@/components/v2/other/MainBackground";
import ChevronButton from "@/components/v2/ui/buttons/ChevronButton";
import NavBar from "@/components/v2/ui/navigation/NavBar";
import IconButton from "@/components/v2/ui/buttons/IconButton";
import CardContainer from "@/components/v2/ui/cards/CardContainer";
import CardInfo from "@/components/v2/ui/cards/CardInfo";
import CardText from "@/components/v2/ui/cards/CardText";
import FloatingActionButton from "@/components/v2/ui/buttons/FloatingActionButton";
import ProfileSidebar from "@/components/v2/ui/modals/ProfileSideBar";
import Modal from "@/components/v2/ui/modals/Modal";
import { SquarePen, User, Plus, House, UndoDot } from "lucide-react";

import * as CustomIcons from "@/components/icons/custom/task-icons";
import { TASK_ICONS } from "@/utils/iconConfig";
import { getTaskStatusFromData, type TaskStatus } from "@/utils/taskstatus";

// Render icons for the modal
const icons = TASK_ICONS.map((option) => {
  const IconComponent =
    CustomIcons[option.component as keyof typeof CustomIcons];
  return <IconComponent key={option.name} className="w-12 h-12" />;
});

// Helper function to get icon component by name
const getIconComponent = (iconName?: string) => {
  if (!iconName) return CustomIcons.Other;
  const IconComponent = CustomIcons[iconName as keyof typeof CustomIcons];
  return IconComponent || CustomIcons.Other;
};

interface Task {
  id: string;
  name: string;
  icon?: string;
  area_id: string;
  last_completed?: string;
  description?: string;
  frequency?: number;
  forced_marked_incomplete?: boolean;
  forced_completion_status?: string | null;
}

interface TaskLike {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  frequency?: number;
}

interface Room {
  id: string;
  name: string;
}

interface Area {
  id: string;
  name: string;
  room_id: string;
}

type ForcedStatus = "default" | "soon" | "due" | "overdue";

export default function AreaPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params?.roomId as string;
  const areaId = params?.areaId as string;

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [roomName, setRoomName] = useState<string>("Loading...");
  const [areaName, setAreaName] = useState<string>("Loading...");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isStatusMode, setIsStatusMode] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [descriptionValue, setDescriptionValue] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(0);
  const [editingTask, setEditingTask] = useState<TaskLike | null>(null);
  const [modalFrequency, setModalFrequency] = useState(7);

  // Status mode state
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, ForcedStatus>
  >({});

  const [rooms, setRooms] = useState<Room[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState(roomId);
  const [selectedAreaId, setSelectedAreaId] = useState(areaId);
  const [userId, setUserId] = useState<string>("");

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login2");
        return;
      }

      setIsAuthenticated(true);
      const userId = session.user.id;
      setUserId(userId);
    };

    checkAuth();
  }, [router]);

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "complete":
        return theme.colors.cardGreen;
      case "soon":
        return theme.colors.cardYellow;
      case "due":
        return theme.colors.cardRed;
      case "overdue":
        return theme.colors.cardDarkRed;
      default:
        return theme.colors.cardWhite;
    }
  };

  const getForcedPillStatusColor = (status: ForcedStatus) => {
    switch (status) {
      case "soon":
        return theme.colors.cardYellow;
      case "due":
        return theme.colors.cardRed;
      case "overdue":
        return theme.colors.cardDarkRed;
      case "default":
      default:
        return theme.colors.cardGrey;
    }
  };

  // Exit edit mode when profile opens
  useEffect(() => {
    if (isProfileOpen) {
      setIsEditMode(false);
      setIsStatusMode(false);
    }
  }, [isProfileOpen]);

  // Fetch rooms and areas for dropdowns
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchRoomsAndAreas = async () => {
      const { data: roomsData, error: roomsError } = await supabase
        .from("rooms")
        .select("id, name")
        .order("name");

      if (roomsError) {
        console.error("Error fetching rooms:", roomsError);
      } else if (roomsData) {
        setRooms(roomsData);
      }

      const { data: areasData, error: areasError } = await supabase
        .from("areas")
        .select("id, name, room_id")
        .order("name");

      if (areasError) {
        console.error("Error fetching areas:", areasError);
      } else if (areasData) {
        setAreas(areasData);
      }
    };

    fetchRoomsAndAreas();
  }, [isAuthenticated]);

  // Fetch room, area, and tasks data
  useEffect(() => {
    if (!isAuthenticated || !roomId || !areaId) return;

    const fetchData = async () => {
      setLoading(true);

      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .select("name")
        .eq("id", roomId)
        .single();

      if (roomError) {
        console.error("Error fetching room:", roomError);
        setRoomName("Room Not Found");
      } else {
        setRoomName(roomData?.name || "Unknown Room");
      }

      const { data: areaData, error: areaError } = await supabase
        .from("areas")
        .select("name")
        .eq("id", areaId)
        .single();

      if (areaError) {
        console.error("Error fetching area:", areaError);
        setAreaName("Area Not Found");
      } else {
        setAreaName(areaData?.name || "Unknown Area");
      }

      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select(
          "id, name, icon, area_id, last_completed, description, frequency, forced_marked_incomplete, forced_completion_status"
        )
        .eq("area_id", areaId);

      if (tasksError) {
        console.error("Error fetching tasks:", tasksError);
      } else {
        setTasks(tasksData || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [isAuthenticated, roomId, areaId]);

  useEffect(() => {
    if (editingTask) {
      setSelectedRoomId(roomId);
      setSelectedAreaId(areaId);
    }
  }, [editingTask, roomId, areaId]);

  useEffect(() => {
    if (isAddOpen) {
      setSelectedRoomId(roomId);
      setSelectedAreaId(areaId);
    }
  }, [isAddOpen, roomId, areaId]);

  const handleTaskClick = (
    taskId: string,
    taskName: string,
    taskIcon?: string,
    taskDescription?: string,
    taskFrequency?: number
  ) => {
    if (isStatusMode) {
      // Cycle through statuses
      const currentStatus = statusOverrides[taskId] || "default";
      const statusCycle: ForcedStatus[] = ["default", "soon", "due", "overdue"];
      const currentIndex = statusCycle.indexOf(currentStatus);
      const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];

      setStatusOverrides((prev) => ({
        ...prev,
        [taskId]: nextStatus,
      }));
    } else if (isEditMode) {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        setEditingTask({
          id: taskId,
          name: taskName,
          icon: taskIcon,
          description: taskDescription,
          frequency: taskFrequency,
        });
        setSectionName(taskName);
        setDescriptionValue(task.description || "");
        setModalFrequency(taskFrequency || 7);

        const iconIndex = TASK_ICONS.findIndex(
          (icon) => icon.component === taskIcon
        );
        setSelectedIcon(iconIndex !== -1 ? iconIndex : 0);

        setIsEditOpen(true);
      }
    } else {
      router.push(`/dashboard2/${roomId}/areas/${areaId}/tasks/${taskId}`);
    }
  };

  const handleRoomChange = (newRoomId: string) => {
    setSelectedRoomId(newRoomId);
    setSelectedAreaId("");
  };

  const handleAreaChange = (newAreaId: string) => {
    setSelectedAreaId(newAreaId);
  };

  const handleAddTask = async (
    name: string,
    icon: string,
    description: string,
    frequency: number,
    tags: { id: string; name: string; name_short: string }[]
  ) => {
    if (!selectedAreaId) {
      alert("Please select an area for the task.");
      return;
    }

    const newTask = {
      name,
      icon,
      description,
      area_id: selectedAreaId,
      last_completed: null,
      frequency,
    };

    const { data: taskData, error: taskError } = await supabase
      .from("tasks")
      .insert([newTask])
      .select()
      .single();

    if (taskError) {
      console.error("Error adding task:", taskError);
      alert("Failed to add task. Please try again.");
      return;
    }

    if (taskData) {
      if (tags.length > 0) {
        const tagRows = tags.map((tag) => ({
          task_id: taskData.id,
          tag_id: tag.id,
        }));

        const { error: taskTagsError } = await supabase
          .from("task_tags")
          .insert(tagRows);

        if (taskTagsError) {
          console.error("Error adding task tags:", taskTagsError);
        }
      }

      if (selectedAreaId === areaId) {
        setTasks((prev) => [...prev, taskData]);
      }

      alert("Task added successfully.");
    }
  };

  const handleEditTask = async (
    id: string,
    name: string,
    icon: string,
    description: string,
    frequency: number,
    tags: { id: string; name: string; name_short: string }[]
  ) => {
    if (!selectedAreaId) {
      alert("Please select an area for the task.");
      return;
    }

    const { error: taskError } = await supabase
      .from("tasks")
      .update({ name, icon, area_id: selectedAreaId, description, frequency })
      .eq("id", id);

    if (taskError) {
      console.error("Error updating task:", taskError);
      alert("Failed to update task. Please try again.");
      return;
    }

    const { error: deleteError } = await supabase
      .from("task_tags")
      .delete()
      .eq("task_id", id);

    if (deleteError) {
      console.error("Error deleting existing task_tags:", deleteError);
      alert("Failed to update task tags.");
      return;
    }

    if (tags.length > 0) {
      const newTaskTags = tags.map((tag) => ({
        task_id: id,
        tag_id: tag.id,
      }));

      const { error: insertError } = await supabase
        .from("task_tags")
        .insert(newTaskTags);

      if (insertError) {
        console.error("Error inserting new task_tags:", insertError);
        alert("Failed to save task tags.");
        return;
      }
    }

    if (selectedAreaId !== areaId) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      alert("Task updated and moved to different area.");
    } else {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                name,
                icon,
                area_id: selectedAreaId,
                description,
                frequency,
              }
            : t
        )
      );
      alert("Task updated successfully.");
    }

    setIsEditOpen(false);
    setEditingTask(null);
    setSectionName("");
    setDescriptionValue("");
    setSelectedIcon(0);
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          last_completed: new Date().toISOString(),
          last_completed_by: userId,
          forced_marked_incomplete: false,
          forced_completion_status: null,
        })
        .eq("id", taskId);

      if (error) {
        console.error("Error completing task:", error);
        return;
      }

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                last_completed: new Date().toISOString(),
                last_completed_by: userId,
                forced_marked_incomplete: false,
                forced_completion_status: null,
              }
            : task
        )
      );
    } catch (err: unknown) {
      console.error("Exception completing task:", err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    const taskName = taskToDelete?.name || "this task";

    const isConfirmed = window.confirm(
      `Are you sure you want to delete "${taskName}"? This action cannot be undone.`
    );

    if (!isConfirmed) {
      return;
    }

    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task. Please try again.");
    } else {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      alert("Task deleted successfully.");
    }
  };

  const handleAddClick = () => {
    setIsEditMode(false);
    setIsStatusMode(false);
    setIsAddOpen(true);
  };

  const handleEditClick = () => {
    setIsEditMode(!isEditMode);
    setIsStatusMode(false);
  };

  const handleStatusClick = () => {
    setIsEditMode(false);
    setIsStatusMode(!isStatusMode);
    // Reset overrides when entering status mode
    if (!isStatusMode) {
      setStatusOverrides({});
    }
  };

  const handleSaveStatusChanges = async () => {
    const modifiedTaskIds = Object.keys(statusOverrides);

    if (modifiedTaskIds.length === 0) {
      setIsStatusMode(false);
      return;
    }

    try {
      // Update each modified task
      for (const taskId of modifiedTaskIds) {
        const status = statusOverrides[taskId];

        if (status === "default") {
          // Reset to default
          await supabase
            .from("tasks")
            .update({
              forced_marked_incomplete: false,
              forced_completion_status: null,
            })
            .eq("id", taskId);
        } else {
          // Set forced status
          await supabase
            .from("tasks")
            .update({
              forced_marked_incomplete: true,
              forced_completion_status: status,
            })
            .eq("id", taskId);
        }
      }

      alert("Status changes saved successfully!");

      // Refresh tasks data
      const { data: tasksData } = await supabase
        .from("tasks")
        .select(
          "id, name, icon, area_id, last_completed, description, frequency, forced_marked_incomplete, forced_completion_status"
        )
        .eq("area_id", areaId);

      if (tasksData) {
        setTasks(tasksData);
      }

      setIsStatusMode(false);
      setStatusOverrides({});
    } catch (error) {
      console.error("Error saving status changes:", error);
      alert("Failed to save status changes. Please try again.");
    }
  };

  return (
    <div className="min-h-screen">
      <MainBackground color={theme.colors.background}>
        <FloatingActionButton
          color={theme.colors.secondary}
          icons={[
            <Plus key="add" />,
            <SquarePen key="edit" />,
            <UndoDot key="status" />,
          ]}
          onOption1Click={handleAddClick}
          onOption2Click={handleEditClick}
          onOption3Click={handleStatusClick}
          cancelMode={isEditMode || isStatusMode}
          statusMode={isStatusMode}
          onCancelClick={() => {
            if (isStatusMode) {
              handleSaveStatusChanges();
            } else {
              setIsEditMode(false);
            }
          }}
        />

        {isEditMode && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <div
              className="px-8 py-4 rounded-full shadow-lg"
              style={{ backgroundColor: theme.colors.accent }}
            >
              <p className="text-white text-lg font-semibold">Edit Mode</p>
            </div>
          </div>
        )}

        {isStatusMode && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <div
              className="px-8 py-4 rounded-full shadow-lg"
              style={{ backgroundColor: theme.colors.accent }}
            >
              <p className="text-white text-lg font-semibold">Status Mode</p>
            </div>
          </div>
        )}

        <NavBar
          text={`${roomName} > ${areaName}`}
          fixed
          narrowScreenTextAlign="center"
          backgroundColor={theme.colors.primary}
          leftButtons={[
            <ChevronButton
              key="back"
              color={theme.colors.secondary}
              size={44}
              onClick={() => router.push(`/dashboard2/${roomId}`)}
            />,
          ]}
          rightButtons={[
            <IconButton
              key="dashboard"
              icon={<House size={24} color="white" />}
              color={theme.colors.accent}
              onClick={() => router.push("/dashboard2")}
            />,
            <IconButton
              key="profile"
              icon={<User size={24} color="white" />}
              color={theme.colors.accent}
              onClick={() => setIsProfileOpen(true)}
            />,
          ]}
        />
        {loading ? (
          <Loader
            primaryColor={theme.colors.secondary}
            secondaryColor={theme.colors.accent}
          />
        ) : (
          <div className="flex flex-col items-center justify-start min-h-screen pb-20">
            <div className="flex items-center gap-4">
              <PageTitle text="Tasks" />
            </div>

            <ProfileSidebar
              isOpen={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
              firstName="Corgi"
              lastName="Butt"
              displayName="Corgi Butt"
              onEditAvatar={() => console.log("Edit avatar")}
            />

            <Modal
              isOpen={isAddOpen}
              onClose={() => setIsAddOpen(false)}
              mode="add"
              level="task"
              closeButtonPosition="right"
              icons={icons}
              selectedIconIndex={selectedIcon}
              frequency={modalFrequency}
              onFrequencyChange={setModalFrequency}
              onIconChange={(index) => setSelectedIcon(index)}
              nameValue={sectionName}
              onNameChange={(value) => setSectionName(value)}
              descriptionValue={descriptionValue}
              onDescriptionChange={(value) => setDescriptionValue(value)}
              rooms={rooms}
              areas={areas}
              roomValue={selectedRoomId}
              areaValue={selectedAreaId}
              onRoomChange={handleRoomChange}
              onAreaChange={handleAreaChange}
              onPrimaryAction={(tags) => {
                handleAddTask(
                  sectionName,
                  TASK_ICONS[selectedIcon]?.component || "Other",
                  descriptionValue,
                  modalFrequency,
                  tags
                );
                setIsAddOpen(false);
                setSectionName("");
                setDescriptionValue("");
                setSelectedIcon(0);
              }}
              onSecondaryAction={() => {
                setIsAddOpen(false);
                setSectionName("");
                setDescriptionValue("");
                setSelectedIcon(0);
              }}
              primaryButtonText="Create Task"
              secondaryButtonText="Cancel"
              currentUserId={userId}
            />

            <Modal
              isOpen={isEditOpen}
              onClose={() => {
                setIsEditOpen(false);
                setEditingTask(null);
                setSectionName("");
                setDescriptionValue("");
                setSelectedIcon(0);
              }}
              mode="edit"
              level="task"
              closeButtonPosition="right"
              icons={icons}
              selectedIconIndex={selectedIcon}
              frequency={modalFrequency}
              onFrequencyChange={setModalFrequency}
              onIconChange={(index) => setSelectedIcon(index)}
              nameValue={sectionName}
              onNameChange={(value) => setSectionName(value)}
              descriptionValue={descriptionValue}
              onDescriptionChange={(value) => setDescriptionValue(value)}
              rooms={rooms}
              areas={areas}
              roomValue={selectedRoomId}
              areaValue={selectedAreaId}
              editingTask={editingTask}
              onRoomChange={handleRoomChange}
              onAreaChange={handleAreaChange}
              onPrimaryAction={(tags) => {
                if (editingTask) {
                  handleEditTask(
                    editingTask.id,
                    sectionName,
                    TASK_ICONS[selectedIcon]?.component || "Other",
                    descriptionValue,
                    modalFrequency,
                    tags
                  );
                }
              }}
              onSecondaryAction={() => {
                setIsEditOpen(false);
                setEditingTask(null);
                setSectionName("");
                setDescriptionValue("");
                setSelectedIcon(0);
              }}
              primaryButtonText="Save"
              secondaryButtonText="Cancel"
              currentUserId={userId}
            />

            <div className="w-full max-w-4xl p-4">
              {tasks.length === 0 ? (
                <p className="text-white text-center">
                  No tasks yet. Add one to get started!
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 justify-items-center w-full">
                  {[...tasks]
                    .sort((a, b) => {
                      const getTaskStatusValue = (task: Task) => {
                        const status = getTaskStatusFromData({
                          id: task.id,
                          last_completed: task.last_completed || null,
                          frequency: task.frequency || 7,
                          forced_marked_incomplete:
                            task.forced_marked_incomplete,
                          forced_completion_status:
                            task.forced_completion_status as TaskStatus | null,
                        });

                        // Define sort order: lower number = appears first
                        const statusOrder: Record<TaskStatus, number> = {
                          overdue: 0,
                          due: 1,
                          soon: 2,
                          neutral: 3,
                          complete: 4,
                        };

                        return statusOrder[status] ?? 3; // anything else gets 4
                      };

                      return getTaskStatusValue(a) - getTaskStatusValue(b);
                    })
                    .map((task) => {
                      const IconComponent = getIconComponent(task.icon);
                      const taskStatus = getTaskStatusFromData({
                        id: task.id,
                        last_completed: task.last_completed || null,
                        frequency: task.frequency || 7,
                        forced_marked_incomplete: task.forced_marked_incomplete,
                        forced_completion_status:
                          task.forced_completion_status as TaskStatus | null,
                      });
                      const bgColor = getStatusColor(taskStatus);
                      const overrideStatus = statusOverrides[task.id];

                      return (
                        <div key={task.id} className="relative">
                          <CardContainer
                            backgroundColor={theme.colors.primary}
                            hoverEffect={!isEditMode && !isStatusMode}
                            shadow
                            padding=".5rem"
                            editMode={isEditMode}
                            enableLongPress={!isStatusMode}
                            onLongPress={() => handleCompleteTask(task.id)}
                            onClick={() =>
                              handleTaskClick(
                                task.id,
                                task.name,
                                task.icon,
                                task.description,
                                task.frequency
                              )
                            }
                            onDelete={() => handleDeleteTask(task.id)}
                            className="h-[140px] w-[140px] sm:h-[180px] sm:w-[180px]"
                            showToastOnLongPress={true}
                            toastMessage="Task completed!"
                          >
                            <CardInfo
                              frontContent={
                                <IconComponent className="w-16 h-16" />
                              }
                              bgColor={bgColor}
                            />
                            <CardText text={task.name} />
                          </CardContainer>

                          {isStatusMode && overrideStatus && (
                            <div
                              className="absolute top-3/5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-full shadow-lg pointer-events-none"
                              style={{
                                backgroundColor:
                                  getForcedPillStatusColor(overrideStatus),
                              }}
                            >
                              <p className="text-white text-sm font-semibold capitalize">
                                {overrideStatus}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}
      </MainBackground>
    </div>
  );
}
