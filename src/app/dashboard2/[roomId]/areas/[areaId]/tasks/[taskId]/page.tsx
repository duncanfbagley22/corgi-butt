"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/supabase";
import { useRouter, useParams } from "next/navigation";
import { theme } from "../../../../../../../../config/theme";
import Loader from "@/components/v2/other/Loader";
import PageTitle from "@/components/v2/headings/PageTitle";
import MainBackground from "@/components/v2/other/MainBackground";
import ChevronButton from "@/components/v2/ui/buttons/ChevronButton";
import NavBar from "@/components/v2/ui/navigation/NavBar";
import IconButton from "@/components/v2/ui/buttons/IconButton";
import FloatingActionButton from "@/components/v2/ui/buttons/FloatingActionButton";
import TextDisplay from "@/components/v2/headings/TextDisplay";
import ProfileSidebar from "@/components/v2/ui/modals/ProfileSideBar";
import TagDisplay from "@/components/v2/headings/TagDisplay";
import Modal from "@/components/v2/ui/modals/Modal";
import { getTaskStatusFromData, type TaskStatus } from "@/utils/taskstatus";
import {
  Calendar,
  SquarePen,
  User,
  CalendarCheck2,
  AlignLeft,
  House,
} from "lucide-react";

import * as CustomIcons from "@/components/icons/custom/task-icons";
import { TASK_ICONS } from "@/utils/iconConfig";

import { useNavigation } from '@/app/contexts/NavigationContext'

// Define icons as before
const icons = TASK_ICONS.map((option) => {
  const IconComponent =
    CustomIcons[option.component as keyof typeof CustomIcons];
  return <IconComponent key={option.name} className="w-12 h-12" />;
});



interface TaskData {
  id: string;
  name: string;
  description?: string;
  frequency?: number;
  last_completed?: string;
  last_completed_by?: string;
  forced_marked_incomplete?: boolean;
  forced_completion_status?: string;
  icon?: string;
  area_id: string;
  room_id: string;
  tags?: string[];
}

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params?.roomId as string;
  const areaId = params?.areaId as string;
  const taskId = params?.taskId as string;

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [roomName, setRoomName] = useState<string>("Loading...");
  const [areaName, setAreaName] = useState<string>("Loading...");
  const [taskData, setTaskData] = useState<TaskData | null>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [tags, setTags] = useState<Array<{ id: string; label: string }>>([]);
  const [completedByName, setCompletedByName] = useState<string>("N/A");

  // Modal state
  const [editName, setEditName] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [editIconIndex, setEditIconIndex] = useState<number>(0);
  const [editFrequency, setEditFrequency] = useState<number>(7);
  const [editRoomId, setEditRoomId] = useState<string>("");
  const [editAreaId, setEditAreaId] = useState<string>("");

  const [rooms, setRooms] = useState<Array<{ id: string; name: string }>>([]);
  const [areas, setAreas] = useState<
    Array<{ id: string; name: string; room_id: string }>
  >([]);

  function toProperCase(str: string) {
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  }
  const upperTaskStatus = toProperCase(taskStatus ?? "");

    const { setTransition } = useNavigation();

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
      const userId = session.user.id;
      setUserId(userId);
      setIsAuthenticated(true);
    };
    checkAuth();
  }, [router]);

  // Fetch rooms and areas for the modal
  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    const fetchRoomsAndAreas = async () => {
      // Fetch rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from("rooms")
        .select("id, name, household_id")
        .eq(
          "household_id",
          (
            await supabase
              .from("users")
              .select("household_id")
              .eq("id", userId)
              .single()
          ).data?.household_id
        );

      if (!roomsError && roomsData) {
        setRooms(roomsData);
      }

      // Fetch areas
      const { data: areasData, error: areasError } = await supabase
        .from("areas")
        .select("id, name, room_id");

      if (!areasError && areasData) {
        setAreas(areasData);
      }
    };

    fetchRoomsAndAreas();
  }, [isAuthenticated, userId]);

  // Fetch all data
  useEffect(() => {
    if (!isAuthenticated || !roomId || !areaId || !taskId) return;

    const fetchData = async () => {
      setLoading(true);

      // Fetch room name
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

      // Fetch area name
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

      // Fetch task details
      const { data: taskDataResult, error: taskError } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", taskId)
        .single();

      if (taskError) {
        console.error("Error fetching task:", taskError);
      } else {
        setTaskData(taskDataResult);

        // Set modal edit values
        setEditName(taskDataResult.name);
        setEditDescription(taskDataResult.description || "");
        setEditFrequency(taskDataResult.frequency || 7);
        setEditRoomId(roomId);
        setEditAreaId(areaId);

        // Find icon index
        const iconIndex = TASK_ICONS.findIndex(
          (opt) => opt.component === taskDataResult.icon
        );
        setEditIconIndex(iconIndex >= 0 ? iconIndex : 0);

        // Fetch user who last completed it
        if (taskDataResult?.last_completed_by) {
          const { data: userData } = await supabase
            .from("users")
            .select("first_name, last_name, display_name")
            .eq("id", taskDataResult.last_completed_by)
            .single();

          if (userData) {
            setCompletedByName(
              userData.display_name ||
                `${userData.first_name} ${userData.last_name}` ||
                "Unknown User"
            );
          }
        }
      }

      const { data: tagsData, error: tagsError } = await supabase
        .from("task_tags")
        .select(`tag:tag_id (id, name, name_short)`)
        .eq("task_id", taskId);

      if (tagsError) {
        console.error("Error fetching tags:", tagsError);
      } else if (tagsData) {
        // tagsData comes from Supabase and has shape: [{ tag: { id, name, name_short } }, ...]
        const formattedTags = (
          tagsData as unknown as Array<{
            tag: { id: string; name: string; name_short: string };
          }>
        ).map((t) => ({
          id: t.tag.id,
          label: t.tag.name_short || t.tag.name || "Tag",
        }));
        setTags(formattedTags);
      }

      setLoading(false);
    };

    fetchData();
  }, [isAuthenticated, roomId, areaId, taskId]);

  useEffect(() => {
    if (taskData) {
      const status = getTaskStatusFromData({
        id: taskData.id,
        last_completed: taskData.last_completed || null,
        frequency: taskData.frequency || 7,
        forced_marked_incomplete: taskData.forced_marked_incomplete,
        forced_completion_status:
          taskData.forced_completion_status as TaskStatus | null,
      });
      setTaskStatus(status);
    }
  }, [taskData]);

  // Handle save changes
  const handleSaveTask = async (
    selectedTags: { id: string; name: string; name_short: string }[]
  ) => {
    if (!taskData) return;

    try {
      // Get the selected icon component name
      const selectedIcon = TASK_ICONS[editIconIndex].component;

      // Update the task
      const { error: updateError } = await supabase
        .from("tasks")
        .update({
          name: editName,
          description: editDescription,
          icon: selectedIcon,
          frequency: editFrequency,
          area_id: editAreaId,
        })
        .eq("id", taskId);

      if (updateError) {
        console.error("Error updating task:", updateError);
        alert("Failed to update task. Please try again.");
        return;
      }

      // Delete existing task_tags
      await supabase.from("task_tags").delete().eq("task_id", taskId);

      // Insert new task_tags
      if (selectedTags.length > 0) {
        const taskTagsData = selectedTags.map((tag) => ({
          task_id: taskId,
          tag_id: tag.id,
        }));

        const { error: tagsError } = await supabase
          .from("task_tags")
          .insert(taskTagsData);

        if (tagsError) {
          console.error("Error updating tags:", tagsError);
        }
      }

      // Refresh the page data
      setTaskData({
        ...taskData,
        name: editName,
        description: editDescription,
        icon: selectedIcon,
        frequency: editFrequency,
        area_id: editAreaId,
        forced_completion_status: taskData.forced_completion_status,
      });

      // Update tags display
      setTags(
        selectedTags.map((tag) => ({
          id: tag.id,
          label: tag.name_short || tag.name,
        }))
      );

      alert("Task updated successfully! ✅");
      setIsOpen(false);
    } catch (err) {
      console.error("Exception updating task:", err);
      alert("An error occurred while updating the task.");
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format frequency
  const formatFrequency = (frequency?: number) => {
    if (!frequency) return "Not Set";
    const days = frequency;
    if (days === 1) return "Daily";
    if (days === 7) return "Weekly";
    if (days === 14) return "Bi-weekly";
    if (days === 30) return "Monthly";
    if (days === 90) return "Quarterly";
    return `Every ${days} days`;
  };

  return (
    <div className="min-h-screen">
      <MainBackground color={theme.colors.background}>
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
                            onClick={() => {
                setTransition("zoom", "back");
                router.push(`/dashboard2/${roomId}/areas/${areaId}`);
              }}
            />,
          ]}
          rightButtons={[
            <IconButton
              key="dashboard"
              icon={<House size={24} color="white" />}
              color={theme.colors.accent}
              onClick={() => router.push("/dashboard2")}
            />,
            ,
            <IconButton
              key="profile"
              icon={<User size={24} color="white" />}
              color={theme.colors.accent}
              onClick={() => setIsProfileOpen(true)}
            />,
          ]}
        />

        <FloatingActionButton
          color={theme.colors.secondary}
          icons={[<SquarePen key="edit" />]}
          onOption1Click={() => setIsOpen(true)}
        />
        {loading ? (
          <Loader
            primaryColor={theme.colors.secondary}
            secondaryColor={theme.colors.accent}
          />
        ) : (
          <div className="flex flex-col items-center justify-start min-h-screen pb-20">
            <div className="flex items-center gap-4 pt-0">
              <PageTitle text={taskData?.name || "Task"} />
            </div>

            <Modal
              isOpen={isOpen}
              onClose={() => {
                // Reset all edit fields to current task data
                if (taskData) {
                  setEditName(taskData.name);
                  setEditDescription(taskData.description || "");
                  setEditFrequency(taskData.frequency || 7);
                  setEditRoomId(roomId);
                  setEditAreaId(areaId);
                  // Reset icon index to the saved icon
                  const iconIndex = TASK_ICONS.findIndex(
                    (opt) => opt.component === taskData.icon
                  );
                  setEditIconIndex(iconIndex >= 0 ? iconIndex : 0);
                }
                setIsOpen(false);
              }}
              mode="edit"
              level="task"
              closeButtonPosition="right"
              icons={icons}
              selectedIconIndex={editIconIndex}
              onIconChange={setEditIconIndex}
              nameValue={editName}
              onNameChange={setEditName}
              descriptionValue={editDescription}
              onDescriptionChange={setEditDescription}
              rooms={rooms}
              areas={areas}
              roomValue={editRoomId}
              areaValue={editAreaId}
              onRoomChange={setEditRoomId}
              onAreaChange={setEditAreaId}
              onPrimaryAction={handleSaveTask}
              onSecondaryAction={() => {
                // Reset all edit fields to current task data
                if (taskData) {
                  setEditName(taskData.name);
                  setEditDescription(taskData.description || "");
                  setEditFrequency(taskData.frequency || 7);
                  setEditRoomId(roomId);
                  setEditAreaId(areaId);
                  // Reset icon index to the saved icon
                  const iconIndex = TASK_ICONS.findIndex(
                    (opt) => opt.component === taskData.icon
                  );
                  setEditIconIndex(iconIndex >= 0 ? iconIndex : 0);
                }
                setIsOpen(false);
              }}
              primaryButtonText="Save"
              secondaryButtonText="Cancel"
              currentUserId={userId}
              editingTask={taskData}
              frequency={editFrequency}
              onFrequencyChange={setEditFrequency}
            />

            <div className="mt-6 flex flex-col gap-6 mb-20 w-full max-w-[600px] mx-auto px-4">
              <TextDisplay
                label="Task Name"
                value={taskData?.name || "N/A"}
                icon={true}
                iconComponent={<AlignLeft size={16} color="black" />}
              />

              <TextDisplay
                label="Description"
                value={
                  taskData?.description ||
                  "No description provided for this task."
                }
                icon={true}
                iconComponent={<AlignLeft size={16} color="black" />}
              />

              {/* Frequency and Last Completed on same line */}
              <div className="flex gap-4">
                <TextDisplay
                  label="Frequency"
                  value={formatFrequency(taskData?.frequency)}
                  width="290px"
                  icon={true}
                  iconComponent={<Calendar size={16} color="black" />}
                />
                <TextDisplay
                  label="Last Completed"
                  value={formatDate(taskData?.last_completed)}
                  width="290px"
                  icon={true}
                  iconComponent={<CalendarCheck2 size={16} color="black" />}
                />
              </div>

              <TextDisplay
                label="Last Completed By"
                value={completedByName}
                icon={true}
                iconComponent={<User size={16} color="black" />}
              />

              <TagDisplay
                label="Tags"
                tags={tags.map((tag) => ({
                  id: tag.id,
                  label: tag.label,
                }))}
              />
              <TextDisplay
                label="Status"
                value={upperTaskStatus || "N/A"}
                icon={true}
                iconComponent={<CalendarCheck2 size={16} color="black" />}
              />
            </div>

            <ProfileSidebar
              isOpen={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
              firstName="Corgi"
              lastName="Butt"
              displayName="Corgi Butt"
              onEditAvatar={() => console.log("Edit avatar")}
            />
          </div>
        )}
      </MainBackground>
    </div>
  );
}
