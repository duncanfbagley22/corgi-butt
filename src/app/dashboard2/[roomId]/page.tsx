"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/supabase";
import { useRouter, useParams } from "next/navigation";
import { theme } from "../../../../config/theme";
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
import { SquarePen, User, Plus, House } from "lucide-react";
import { getMultipleAreaStatuses, type AreaStatus } from "@/utils/areastatus";

import * as CustomIcons from "@/components/icons/custom/area-icons";
import { AREA_ICONS } from "@/utils/iconConfig";
import Modal from "@/components/v2/ui/modals/Modal";

// Render icons for the modal
const icons = AREA_ICONS.map((option) => {
  const IconComponent =
    CustomIcons[option.component as keyof typeof CustomIcons];
  return <IconComponent key={option.name} className="w-12 h-12" />;
});

// Helper function to get icon component by name
const getIconComponent = (iconName?: string) => {
  if (!iconName) return CustomIcons.Items; // Default icon
  const IconComponent = CustomIcons[iconName as keyof typeof CustomIcons];
  return IconComponent || CustomIcons.Items;
};

interface Area {
  id: string;
  name: string;
  icon?: string;
  room_id: string;
}

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params?.roomId as string;

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [roomName, setRoomName] = useState<string>("Loading...");
  const [areas, setAreas] = useState<Area[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(0);
  const [userId, setUserId] = useState<string>("");
  const [areaStatuses, setAreaStatuses] = useState<Map<string, AreaStatus>>(
    new Map()
  );
  const [editingArea, setEditingArea] = useState<{
    id: string;
    name: string;
    icon?: string;
  } | null>(null);

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
      // Get the user ID
      const userId = session.user.id;
      setUserId(userId); // or pass it down as prop;
    };

    checkAuth();
  }, [router]);


  // Exit edit mode when profile opens
  useEffect(() => {
    if (isProfileOpen) {
      setIsEditMode(false);
    }
  }, [isProfileOpen]);

  // Fetch room name and areas
  // Fetch room name and areas
useEffect(() => {
  if (!isAuthenticated || !roomId) return;

  const fetchRoomData = async () => {
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

    // Fetch areas (subsections) for this room
    const { data: areasData, error: areasError } = await supabase
      .from("areas")
      .select("id, name, icon, room_id")
      .eq("room_id", roomId);

    if (areasError) {
      console.error("Error fetching areas:", areasError);
    } else {
      setAreas(areasData || []);
      
      // Fetch statuses immediately after setting areas
      if (areasData && areasData.length > 0) {
        const areaIds = areasData.map((area) => area.id);
        const statuses = await getMultipleAreaStatuses(areaIds);
        setAreaStatuses(statuses);
      }
    }

    setLoading(false);
  };

  fetchRoomData();
}, [isAuthenticated, roomId]);

  const handleAreaClick = (
    areaId: string,
    areaName: string,
    areaIcon?: string
  ) => {
    if (isEditMode) {
      // Open edit modal with current area data
      const area = areas.find((a) => a.id === areaId);
      if (area) {
        setEditingArea({ id: areaId, name: areaName, icon: areaIcon });
        setSectionName(areaName);

        // Find the icon index
        const iconIndex = AREA_ICONS.findIndex(
          (icon) => icon.component === areaIcon
        );
        setSelectedIcon(iconIndex !== -1 ? iconIndex : 0);

        setIsEditOpen(true);
      }
    } else {
      // Navigate to area page
      router.push(`/dashboard2/${roomId}/areas/${areaId}`);
    }
  };

  const handleAddArea = async (name: string, icon: string) => {
    const newArea = {
      name,
      icon,
      room_id: roomId,
    };
    const { data, error } = await supabase
      .from("areas")
      .insert([newArea])
      .select()
      .single();

    if (error) {
      console.error("Error adding area:", error);
      alert("Failed to add area. Please try again.");
    } else if (data) {
      setAreas((prev) => [...prev, data]);
      alert("Area added successfully.");
    }
  };

  const handleEditArea = async (id: string, name: string, icon: string) => {
    const { error } = await supabase
      .from("areas")
      .update({ name, icon })
      .eq("id", id);

    if (error) {
      console.error("Error updating area:", error);
      alert("Failed to update area. Please try again.");
    } else {
      // Update local state
      setAreas((prev) =>
        prev.map((a) => (a.id === id ? { ...a, name, icon } : a))
      );
      alert("Area updated successfully.");
    }

    // Close modal and reset
    setIsEditOpen(false);
    setEditingArea(null);
    setSectionName("");
    setSelectedIcon(0);
  };

  const handleDeleteArea = async (id: string) => {
    const areaToDelete = areas.find((a) => a.id === id);
    const areaName = areaToDelete?.name || "this area";

    const isConfirmed = window.confirm(
      `Are you sure you want to delete "${areaName}"? This action cannot be undone.`
    );

    if (!isConfirmed) {
      return;
    }

    const { error } = await supabase.from("areas").delete().eq("id", id);
    if (error) {
      console.error("Error deleting area:", error);
      alert("Failed to delete area. Please try again.");
    } else {
      setAreas((prev) => prev.filter((a) => a.id !== id));
      alert("Area deleted successfully.");
    }
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

  // Helper function to get background color based on area status
  const getAreaStatusColor = (status: AreaStatus) => {
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
          text={roomName}
          fixed
          narrowScreenTextAlign="center"
          backgroundColor={theme.colors.primary}
          leftButtons={[
            <ChevronButton
              key="back"
              color={theme.colors.secondary}
              size={44}
              onClick={() => router.push("/dashboard2")}
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
              <PageTitle text="Areas" />
            </div>

            <ProfileSidebar
              isOpen={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
              firstName="Corgi"
              lastName="Butt"
              displayName="Corgi Butt"
              onEditAvatar={() => console.log("Edit avatar")}
            />

            {/* Add Modal */}
            <Modal
              isOpen={isAddOpen}
              onClose={() => setIsAddOpen(false)}
              mode="add"
              level="area"
              closeButtonPosition="right"
              icons={icons}
              selectedIconIndex={selectedIcon}
              onIconChange={(index) => setSelectedIcon(index)}
              nameValue={sectionName}
              onNameChange={(value) => setSectionName(value)}
              roomValue={roomName}
              areaValue={"area"}
              tagsValue={"tags"}
              onRoomChange={() => console.log("Room change")}
              onAreaChange={() => console.log("Area change")}
              onTagsChange={() => console.log("Tags change")}
              onPrimaryAction={() => {
                handleAddArea(
                  sectionName,
                  AREA_ICONS[selectedIcon]?.component || "Items"
                );
                setIsAddOpen(false);
                setSectionName("");
                setSelectedIcon(0);
              }}
              onSecondaryAction={() => {
                setIsAddOpen(false);
                setSectionName("");
                setSelectedIcon(0);
              }}
              primaryButtonText="Create Area"
              secondaryButtonText="Cancel"
              currentUserId={userId}
            />

            {/* Edit Modal */}
            <Modal
              isOpen={isEditOpen}
              onClose={() => {
                setIsEditOpen(false);
                setEditingArea(null);
                setSectionName("");
                setSelectedIcon(0);
              }}
              mode="edit"
              level="area"
              closeButtonPosition="right"
              icons={icons}
              selectedIconIndex={selectedIcon}
              onIconChange={(index) => setSelectedIcon(index)}
              nameValue={sectionName}
              onNameChange={(value) => setSectionName(value)}
              roomValue={roomName}
              areaValue={"area"}
              tagsValue={"tags"}
              onRoomChange={() => console.log("Room change")}
              onAreaChange={() => console.log("Area change")}
              onTagsChange={() => console.log("Tags change")}
              onPrimaryAction={() => {
                if (editingArea) {
                  handleEditArea(
                    editingArea.id,
                    sectionName,
                    AREA_ICONS[selectedIcon]?.component || "Items"
                  );
                }
              }}
              onSecondaryAction={() => {
                setIsEditOpen(false);
                setEditingArea(null);
                setSectionName("");
                setSelectedIcon(0);
              }}
              primaryButtonText="Save"
              secondaryButtonText="Cancel"
              currentUserId={userId}
            />

            {/* Areas List */}
            <div className="w-full max-w-4xl p-4">
              {areas.length === 0 ? (
                <p className="text-white text-center">
                  No areas yet. Add one to get started!
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 justify-items-center w-full">
                  {areas.map((area) => {
                    const IconComponent = getIconComponent(area.icon);
                    const areaStatus = areaStatuses.get(area.id) || "neutral";
                    const bgColor = getAreaStatusColor(areaStatus);

                    return (
                      <CardContainer
                        key={area.id}
                        backgroundColor={theme.colors.primary}
                        hoverEffect
                        shadow
                        padding=".5rem"
                        editMode={isEditMode}
                        onClick={() =>
                          handleAreaClick(area.id, area.name, area.icon)
                        }
                        onDelete={() => handleDeleteArea(area.id)}
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
                        <CardText text={area.name} />
                      </CardContainer>
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
