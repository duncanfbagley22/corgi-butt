"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/supabase";
import { useRouter } from "next/navigation";
import { theme } from "../../../config/theme";
import Loader from "@/components/v2/other/Loader";
import PageTitle from "@/components/v2/headings/PageTitle";
import MainBackground from "@/components/v2/other/MainBackground";
import NavBar from "@/components/v2/ui/navigation/NavBar";
import IconButton from "@/components/v2/ui/buttons/IconButton";
import FilterTaskSidebar from "@/components/v2/ui/modals/FilterTaskSideBar";
import TaskCard from "@/components/v2/ui/cards/TaskCard";
import CalendarSelect from "@/components/v2/ui/buttons/CalendarSelect";
import ProfileSidebar from "@/components/v2/ui/modals/ProfileSideBar";
import { getTaskStatusFromData, type TaskStatus } from "@/utils/taskstatus";
import { LayoutDashboard, User, Settings2 } from "lucide-react";

import * as CustomIcons from "@/components/icons/custom/task-icons";

// Define the Task type based on your query
interface Task {
  id: string;
  icon: string;
  taskname: string;
  areaname: string;
  roomname: string;
  room_id: string;
  householdname: string;
  display_name: string;
  userid: string;
  last_completed: string | null;
  frequency: number;
  assignee: string | null;
  forced_marked_incomplete?: boolean;
  forced_completion_status?: string | null;
  tags: Array<{
    id: string;
    name: string;
    name_short: string;
  }> | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState<"soon" | "due" | "overdue">(
    "soon"
  );
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [activeFilters, setActiveFilters] = useState<{
    room?: string;
    tag?: string;
    assignee?: string;
  }>({});

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
      setUserId(session.user.id);
    };
    checkAuth();
  }, [router]);

  // Fetch tasks with the custom query
  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    const fetchTasks = async () => {
      setLoading(true);

      try {
        // Call the RPC function with the user_id parameter
        const { data, error } = await supabase.rpc("get_user_tasks_with_tags", {
          user_id: userId,
        });

        if (error) {
          console.error("Error fetching tasks:", error);
          setError(error.message);
        } else {
          setTasks(data || []);
          setFilteredTasks(data || []);
        }
      } catch (err: unknown) {
        console.error("Exception fetching tasks:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [isAuthenticated, userId]);

  // Apply filters whenever tasks or activeFilters change
  useEffect(() => {
    let filtered = [...tasks];

    if (activeFilters.room) {
      filtered = filtered.filter((task) => task.room_id === activeFilters.room);
    }

    if (activeFilters.tag) {
      filtered = filtered.filter((task) =>
        task.tags?.some((tag) => tag.id === activeFilters.tag)
      );
    }

    if (activeFilters.assignee) {
      filtered = filtered.filter(
        (task) => task.assignee === activeFilters.assignee
      );
    }

    setFilteredTasks(filtered);
  }, [tasks, activeFilters]);

  const handleApplyFilters = (filters: {
    room?: string;
    tag?: string;
    assignee?: string;
  }) => {
    setActiveFilters(filters);
  };

  const handleClearFilters = () => {
    setActiveFilters({});
  };

  // Handle task completion
  // Handle task completion
  const handleCompleteTask = async (taskId: string) => {
    try {
      // Update the last_completed timestamp and reset forced status fields in the database
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
        setError("Failed to complete task. Please try again.");
        return;
      }

      alert("Task completed! 🎉");

      // Optimistically update the local state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                last_completed: new Date().toISOString(),
                forced_marked_incomplete: false,
                forced_completion_status: null,
              }
            : task
        )
      );
    } catch (err: unknown) {
      console.error("Exception completing task:", err);
      setError("An error occurred while completing the task.");
    }
  };

  // Helper function to get the icon component based on icon name
  const getIconComponent = (iconName: string) => {
    const IconComponent = CustomIcons[iconName as keyof typeof CustomIcons];
    return IconComponent ? <IconComponent /> : <CustomIcons.Other />;
  };

  return (
    <MainBackground color={theme.colors.background}>
      <NavBar
        text="Corgi Butt"
        fixed
        narrowScreenTextAlign="left"
        backgroundColor={theme.colors.primary}
        rightButtons={[
          <IconButton
          key="dashboard"
            icon={<LayoutDashboard size={24} color="white" />}
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
        <div className="flex flex-col items-center justify-start min-h-screen">
          <ProfileSidebar
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            firstName="Corgi"
            lastName="Butt"
            displayName="Corgi Butt"
            onEditAvatar={() => console.log("Edit avatar")}
          />

          <FilterTaskSidebar
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            currentUserId={userId}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
          />

          <div className="flex items-center gap-4">
            <PageTitle text="Tasks" />
            <IconButton
              icon={<Settings2 size={24} color="white" />}
              color={theme.colors.secondary}
              onClick={() => setIsFilterOpen(true)}
            />
          </div>
          <CalendarSelect
            value={statusFilter}
            onChange={(val) =>
              setStatusFilter(val as "soon" | "due" | "overdue")
            }
            bgColor={theme.colors.primary}
            unselectedBgColor={theme.colors.background}
          />

          {error && (
            <div className="w-full max-w-4xl p-4 text-red-500 text-center">
              Error: {error}
            </div>
          )}

          <div className="w-full max-w-4xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center">
            {(() => {
              // First apply status filter
              const statusFilteredTasks = filteredTasks.filter((task) => {
                const taskStatus = getTaskStatusFromData({
                  id: task.id,
                  last_completed: task.last_completed || null,
                  frequency: task.frequency || 7,
                  forced_marked_incomplete: task.forced_marked_incomplete,
                  forced_completion_status:
                    task.forced_completion_status as TaskStatus | null,
                });

                return taskStatus === statusFilter;
              });

              // Check if we have any tasks to display
              if (statusFilteredTasks.length === 0) {
                return (
                  <div className="col-span-full text-center text-white">
                    {tasks.length === 0
                      ? "No tasks found! You're up to date!"
                      : "No tasks found! You're up to date!"}
                  </div>
                );
              }

              // Render the tasks
              return statusFilteredTasks.map((task) => {
                const taskStatus = getTaskStatusFromData({
                  id: task.id,
                  last_completed: task.last_completed || null,
                  frequency: task.frequency || 7,
                  forced_marked_incomplete: task.forced_marked_incomplete,
                  forced_completion_status:
                    task.forced_completion_status as TaskStatus | null,
                });

                return (
                  <TaskCard
                    key={task.id}
                    icon={getIconComponent(task.icon)}
                    onComplete={() => handleCompleteTask(task.id)}
                    taskName={task.taskname}
                    roomArea={`${task.roomname} / ${task.areaname}`}
                    backgroundColor={theme.colors.primary}
                    status={taskStatus}
                    height={90}
                    width={360}
                    padding=".75rem"
                  />
                );
              });
            })()}
          </div>
        </div>
      )}
    </MainBackground>
  );
}
