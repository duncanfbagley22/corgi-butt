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
import CardContainer from "@/components/v2/ui/cards/CardContainer";
import CardInfo from "@/components/v2/ui/cards/CardInfo";
import CardText from "@/components/v2/ui/cards/CardText";
import FloatingActionButton from "@/components/v2/ui/buttons/FloatingActionButton";
import ProfileSidebar from "@/components/v2/ui/modals/ProfileSideBar";
import Modal from "@/components/v2/ui/modals/Modal";
import Floorplan2 from "@/components/v2/other/Floorplan2";
import { getRoomStatusFromAreas, type RoomStatus } from "@/utils/roomstatus";
import RoomGrid2 from "@/components/v2/other/RoomGrid2";

import { useNavigation } from "@/app/contexts/NavigationContext";

import {
  SquarePen,
  User,
  LayoutList,
  LayoutGrid,
  Plus,
  ListTodo,
} from "lucide-react";

import { RoomData } from "@/types/floorplan";

import * as CustomIcons from "@/components/icons/custom/room-icons";
import { ROOM_ICONS } from "@/utils/iconConfig";

// Render icons for the modal
const icons = ROOM_ICONS.map((option) => {
  const IconComponent =
    CustomIcons[option.component as keyof typeof CustomIcons];
  return <IconComponent key={option.name} className="w-12 h-12" />;
});

// Helper function to get icon component by name
const getIconComponent = (iconName?: string) => {
  if (!iconName) return CustomIcons.Bedroom; // Default icon
  const IconComponent = CustomIcons[iconName as keyof typeof CustomIcons];
  return IconComponent || CustomIcons.Bedroom;
};

export default function DashboardPage() {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [selectedIcon, setSelectedIcon] = useState(0);
  const [editingRoom, setEditingRoom] = useState<{
    id: string;
    name: string;
    icon?: string;
  } | null>(null);
  const [isGridView, setIsGridView] = useState(false);

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
      setUserId(userId); // or pass it down as prop;
      setIsAuthenticated(true);
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (isProfileOpen) {
      setIsEditMode(false);
    }
  }, [isProfileOpen]);

  // Fetch rooms only if authenticated
  useEffect(() => {
  if (!isAuthenticated) return;
  const fetchRooms = async () => {
    setLoading(true);
    const startTime = Date.now(); // Track when loading started
    
    const { data, error } = await supabase.from("rooms").select(`
      *,
      areas (
        id,
        name,
        icon,
        tasks (
          id,
          last_completed,
          frequency,
          forced_marked_incomplete,
          forced_completion_status
        )
      )
    `);
    
    if (error) {
      console.error("Error fetching rooms:", error);
      console.error("Error code:", error.code);
      console.error("Error details:", error.details);
      console.error("Error hint:", error.hint);
      alert(`Error loading rooms: ${error.message}`);
    } else {
      const roomsWithStatus = (data || []).map((room) => {
        const status = getRoomStatusFromAreas(room.areas || []);
        return {
          ...room,
          status,
        };
      });
      setRooms(roomsWithStatus);
    }
    
    // Ensure loading shows for at least 500ms (adjust as needed)
    const elapsed = Date.now() - startTime;
    const minLoadingTime = 500; // milliseconds
    const remainingTime = Math.max(0, minLoadingTime - elapsed);
    
    setTimeout(() => {
      setLoading(false);
    }, remainingTime);
  };

  fetchRooms();
}, [isAuthenticated]);

  const handleUpdate = async (
    id: string,
    left: number,
    top: number,
    width: number,
    height: number
  ) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              left_percent: left,
              top_percent: top,
              width_percent: width,
              height_percent: height,
            }
          : r
      )
    );
    await supabase
      .from("rooms")
      .update({
        left_percent: left,
        top_percent: top,
        width_percent: width,
        height_percent: height,
      })
      .eq("id", id);
  };

  const handleDeleteRoom = async (id: string) => {
    const roomToDelete = rooms.find((r) => r.id === id);
    const roomName = roomToDelete?.name || "this room";

    const isConfirmed = window.confirm(
      `Are you sure you want to delete "${roomName}"? This action cannot be undone.`
    );

    if (!isConfirmed) {
      return; // User cancelled, do nothing
    }

    const { error } = await supabase.from("rooms").delete().eq("id", id);
    if (error) {
      console.error("Error deleting room:", error);
      alert("Failed to delete room. Please try again.");
    } else {
      setRooms((prev) => prev.filter((r) => r.id !== id));
      alert("Room deleted successfully.");
    }
  };

  const handleRoomClick = (
    roomId: string,
    roomName: string,
    roomIcon?: string,
    event?: React.MouseEvent // Add the event parameter as optional
  ) => {
    if (isEditMode) {
      // Open edit modal with current room data
      const room = rooms.find((r) => r.id === roomId);
      if (room) {
        setEditingRoom({ id: roomId, name: roomName, icon: roomIcon });
        setSectionName(roomName);

        // Find the icon index
        const iconIndex = ROOM_ICONS.findIndex(
          (icon) => icon.component === roomIcon
        );
        setSelectedIcon(iconIndex !== -1 ? iconIndex : 0);

        setIsEditOpen(true);
      }
    } else {
          console.log('Click event:', event);
    if (event) {
      console.log('Click position:', event.clientX, event.clientY);
    } else {
      console.log('No event received!');
    }
      // Navigate to the room's page
      setTransition("zoom", "forward", event); // Pass the event

      router.push(`/dashboard2/${roomId}`);
    }
  };

  const handleAddRoom = async (name: string, icon: string) => {
    // First get the user's household_id
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("Authentication error. Please log in again.");
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("household_id")
      .eq("id", user.id)
      .single();

    if (userError || !userData?.household_id) {
      alert("You must be part of a household to create rooms.");
      console.error("Error fetching household:", userError);
      return;
    }

    const newRoom = {
      name,
      icon,
      household_id: userData.household_id, // Add this line
      left_percent: 10,
      top_percent: 10,
      width_percent: 20,
      height_percent: 15,
    };

    const { data, error } = await supabase
      .from("rooms")
      .insert([newRoom])
      .select()
      .single();

    if (error) {
      console.error("Error adding room:", error);
      alert("Failed to create room. Please try again.");
      return;
    }

    if (data) {
      const roomWithStatus = {
        ...data,
        status: "critical",
        areas: [],
      };
      setRooms((prev) => [...prev, roomWithStatus]);
    }
  };

  const handleEditRoom = async (id: string, name: string, icon: string) => {
    const { error } = await supabase
      .from("rooms")
      .update({ name, icon })
      .eq("id", id);

    if (error) {
      console.error("Error updating room:", error);
      alert("Failed to update room. Please try again.");
    } else {
      // Update local state
      setRooms((prev) =>
        prev.map((r) => (r.id === id ? { ...r, name, icon } : r))
      );
      alert("Room updated successfully.");
    }

    // Close modal and reset
    setIsEditOpen(false);
    setEditingRoom(null);
    setSectionName("");
    setSelectedIcon(0);
  };

  // Toggle between grid and list view
  const toggleView = () => {
    setIsGridView(!isGridView);
  };

  const handleAddClick = () => {
    // Exit edit mode and open add modal
    setIsEditMode(false);
    setIsAddOpen(true);
  };

  const handleEditClick = () => {
    // Toggle edit mode
    setIsEditMode(!isEditMode);
  };

  // Helper function to get background color based on room status
  const getRoomStatusColor = (status: RoomStatus) => {
    switch (status) {
      case "complete":
        return theme.colors.cardGreen;
      case "soon":
        return theme.colors.cardYellow;
      case "due":
        return theme.colors.cardRed;
      case "overdue":
        return theme.colors.cardDarkRed;
      case "neutral":
      default:
        return theme.colors.cardWhite;
    }
  };

  return (
    <div className="min-h-screen">
      <MainBackground color={theme.colors.background}>
        <FloatingActionButton
          color={theme.colors.secondary}
          icons={[<Plus key="add" />, <SquarePen key="edit" />]}
          onOption1Click={handleAddClick}
          onOption2Click={handleEditClick}
          cancelMode={isEditMode}
          onCancelClick={() => setIsEditMode(false)}
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
        <NavBar
          text="Corgi Butt"
          fixed
          narrowScreenTextAlign="left"
          backgroundColor={theme.colors.primary}
          rightButtons={[
            <IconButton
              key="calendar"
              icon={<ListTodo size={24} color="white" />}
              color={theme.colors.accent}
              onClick={() => router.push("/calendar-view")}
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
              <PageTitle text="My Rooms" />

              {/* Hide this on mobile */}
              <div className="hidden sm:block">
                <IconButton
                  icon={
                    isGridView ? (
                      <LayoutList size={24} color="white" />
                    ) : (
                      <LayoutGrid size={24} color="white" />
                    )
                  }
                  color={theme.colors.secondary}
                  onClick={toggleView}
                />
              </div>
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
              level="room"
              closeButtonPosition="right"
              icons={icons}
              selectedIconIndex={selectedIcon}
              onIconChange={(index) => setSelectedIcon(index)}
              nameValue={sectionName}
              onNameChange={(value) => setSectionName(value)}
              roomValue={"room"}
              areaValue={"area"}
              onPrimaryAction={() => {
                handleAddRoom(
                  sectionName,
                  ROOM_ICONS[selectedIcon]?.component || "Bedroom"
                );
                // Your save logic here
                setIsAddOpen(false);
                setSectionName(""); // Reset
                setSelectedIcon(0);
              }}
              onSecondaryAction={() => {
                setIsAddOpen(false);
                setSectionName(""); // Reset
                setSelectedIcon(0);
              }}
              primaryButtonText="Create Room"
              secondaryButtonText="Cancel"
              currentUserId={userId}
            />

            <Modal
              isOpen={isEditOpen}
              onClose={() => {
                setIsEditOpen(false);
                setEditingRoom(null);
                setSectionName("");
                setSelectedIcon(0);
              }}
              mode="edit"
              level="room"
              closeButtonPosition="right"
              icons={icons}
              selectedIconIndex={selectedIcon}
              onIconChange={(index) => setSelectedIcon(index)}
              nameValue={sectionName}
              onNameChange={(value) => setSectionName(value)}
              roomValue={"room"}
              areaValue={"area"}
              // tagsValue={"tags"}
              onPrimaryAction={() => {
                if (editingRoom) {
                  handleEditRoom(
                    editingRoom.id,
                    sectionName,
                    ROOM_ICONS[selectedIcon]?.component || "Bedroom"
                  );
                }
              }}
              onSecondaryAction={() => {
                setIsEditOpen(false);
                setEditingRoom(null);
                setSectionName("");
                setSelectedIcon(0);
              }}
              primaryButtonText="Save"
              secondaryButtonText="Cancel"
              currentUserId={userId}
            />

            {/* Conditionally render based on view */}
            {isGridView ? (
              <Floorplan2
                gridSize={20}
                width={800}
                height={600}
                backgroundColor="#3E74A3"
              >
                <RoomGrid2
                  rooms={rooms}
                  onUpdate={handleUpdate}
                  onDelete={handleDeleteRoom}
                  onClick={handleRoomClick}
                  gridSize={10}
                  editMode={isEditMode}
                />
              </Floorplan2>
            ) : (
              <div className="w-full max-w-4xl p-4">
                {/* List View - Now properly mapped */}
{loading ? null : rooms.length === 0 ? (
  <p className="text-white text-center">
    No rooms yet. Add one to get started!
  </p>
) : (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center w-full">
                    {[...rooms]
                      .sort((a, b) => {
                        const getRoomStatusValue = (room: RoomData) => {
                          const status =
                            (room.status as RoomStatus) || "neutral";

                          // Define sort order: lower number = appears first
                          const statusOrder: Record<string, number> = {
                            overdue: 0,
                            due: 1,
                            soon: 2,
                            neutral: 3,
                            complete: 4,
                          };

                          return statusOrder[status] ?? 5;
                        };

                        return getRoomStatusValue(a) - getRoomStatusValue(b);
                      })
                      .map((room) => {
                        const IconComponent = getIconComponent(room.icon);
                        const bgColor = getRoomStatusColor(
                          (room.status as RoomStatus) || "neutral"
                        );

                        return (
                          <CardContainer
                            key={room.id}
                            backgroundColor={theme.colors.primary}
                            hoverEffect
                            shadow
                            padding=".5rem"
                            editMode={isEditMode}
                            onClick={(e) =>
                              handleRoomClick(room.id, room.name, room.icon, e)
                            }
                            onDelete={() => handleDeleteRoom(room.id)}
                            className="h-[140px] w-[140px] sm:h-[180px] sm:w-[180px] "
                          >
                            <CardInfo
                              frontContent={
                                <div className="w-12 h-12 sm:w-16 sm:h-16">
                                  <IconComponent className="w-full h-full" />
                                </div>
                              }
                              bgColor={bgColor}
                            />
                            <CardText text={room.name} />
                          </CardContainer>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </MainBackground>
    </div>
  );
}
