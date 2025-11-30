"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/supabase";
import { RoomData } from "@/types/floorplan";
import { getRoomStatus } from "@/utils/itemstatus";

import Floorplan from "@/components/page-view/Floorplan-temp";
import RoomDetail from "@/components/page-view/RoomDetail-temp";
import Background from "@/components/ui/other/background/Background";
import RoomGrid from "@/components/ui/floorplan/RoomGrid-temp";
import RoomFormModal from "@/components/modals/RoomFormModal";
import RoomCard from "@/components/ui/cards/RoomCard";
import { Button } from "@/components/ui/shadcn/button";
import { Plus, Layout, List, Lock, LockOpen, User, X } from "lucide-react";

import LoadSpinner from "@/components/ui/other/LoadSpinner";

export default function FloorplanPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<{
    id: string;
    name: string;
    icon?: string;
  } | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [listView, setListView] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [cardSize, setCardSize] = useState(160);
  const [loading, setLoading] = useState(true);

  // Check authentication first
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setIsAuthenticated(true);

      // Get user email or metadata
      const userEmail = session.user.email || "User";
      const displayName =
        session.user.user_metadata?.full_name ||
        session.user.user_metadata?.name ||
        userEmail;
      setUserName(displayName);
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    const handleResize = () => {
      setCardSize(window.innerWidth < 768 ? 110 : 160);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch rooms only if authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchRooms = async () => {

      setLoading(true);
      const { data, error } = await supabase.from("rooms").select(`
          *,
          subsections (
            id,
            name,
            icon,
            items (
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
      } else {
        const roomsWithStatus = (data || []).map((room) => {
          const statusResult = getRoomStatus(room.subsections || []);
          return {
            ...room,
            status: statusResult.overallStatus,
          };
        });
        setRooms(roomsWithStatus);
      }
      setLoading(false);
    };

    fetchRooms();
  }, [isAuthenticated]);

  const handleAddRoom = async (name: string, icon: string) => {
    const newRoom = {
      name,
      icon,
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
    if (error) console.error("Error adding room:", error);
    if (data) {
      const roomWithStatus = {
        ...data,
        status: "critical",
        subsections: [],
      };
      setRooms((prev) => [...prev, roomWithStatus]);
    }
    setShowAddForm(false);
  };

  const handleEditRoom = async (id: string, name: string, icon: string) => {
    const { error } = await supabase
      .from("rooms")
      .update({ name, icon })
      .eq("id", id);
    if (error) {
      console.error("Error updating room:", error);
    } else {
      setRooms((prev) =>
        prev.map((r) => (r.id === id ? { ...r, name, icon } : r))
      );
    }
    setShowAddForm(false);
    setEditingRoom(null);
  };

  const handleRoomClick = (
    roomId: string,
    roomName: string,
    roomIcon?: string
  ) => {
    if (editMode) {
      setEditingRoom({ id: roomId, name: roomName, icon: roomIcon });
      setShowAddForm(true);
    } else {
      setSelectedRoom({ id: roomId, name: roomName });
    }
  };

  const handleBackToFloorplan = () => setSelectedRoom(null);

  const handleDeleteRoom = async (id: string) => {
    const { error } = await supabase.from("rooms").delete().eq("id", id);
    if (error) console.error("Error deleting room:", error);
    else setRooms((prev) => prev.filter((r) => r.id !== id));
  };

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

  // Show loading while checking auth
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadSpinner text="Checking authentication..." />
      </div>
    );
  }

  // Render Room Detail if selected
  if (selectedRoom) {
    return (
      <RoomDetail
        roomId={selectedRoom.id}
        roomName={selectedRoom.name}
        onBack={handleBackToFloorplan}
      />
    );
  }

  return (
    <div className="touch-none" style={{ touchAction: "pan-y" }}>
      <Background />

      <RoomFormModal
        isOpen={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          setEditingRoom(null);
        }}
        onAdd={handleAddRoom}
        onEdit={handleEditRoom}
        editingRoom={editingRoom}
      />

      {/* User Info Popup */}
      {showUserPopup && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowUserPopup(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">User Info</h2>
              <button
                onClick={() => setShowUserPopup(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Logged in as:</span>
              <br />
              {userName}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div
        className={`sticky top-0 z-10 md:backdrop-blur-none backdrop-blur-md pt-6 pb-4 flex justify-between items-center px-4 ${
          listView ? "max-w-4xl" : "max-w-4xl"
        } mx-auto w-full`}
      >
        <h1
          className="text-4xl font-bold"
          style={{ fontFamily: "DM Sans, sans-serif" }}
        >
          {listView ? "Rooms" : "Floorplan"}
        </h1>

        <div className="flex gap-2">
          <Button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2"
            style={{ width: "50px", height: "40px" }}
          >
            <Plus size={16} />
          </Button>

          <Button
            onClick={() => {
              setListView(!listView);
              setEditMode(false);
            }}
            className="hidden md:flex items-center gap-2"
            style={{ width: "50px", height: "40px" }}
          >
            {listView ? <Layout size={16} /> : <List size={16} />}
          </Button>

          <Button
            onClick={() => setEditMode(!editMode)}
            className="flex items-center gap-2 cursor-pointer"
            variant={editMode ? "outline" : "default"}
            style={{ width: "50px", height: "40px" }}
          >
            {editMode ? <LockOpen size={16} /> : <Lock size={16} />}
          </Button>

          <Button
            onClick={() => setShowUserPopup(true)}
            style={{ width: "50px", height: "40px" }}
          >
            <User size={16} />
          </Button>
        </div>
      </div>

      {/* Toggle between list and floorplan */}
      <div className="max-w-4xl mx-auto my-4 px-4 min-h-[400px] flex items-center justify-center">
        {loading ? (
          <LoadSpinner text="Loading rooms..." />
        ) : listView ? (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 justify-items-center w-full">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={{
                  id: room.id,
                  name: room.name,
                  icon: room.icon,
                  subsections: room.subsections || [],
                }}
                size={cardSize}
                onClick={() => handleRoomClick(room.id, room.name)}
                onDelete={() => handleDeleteRoom(room.id)}
                onRename={(newName) => {
                  setRooms((prev) =>
                    prev.map((r) =>
                      r.id === room.id ? { ...r, name: newName } : r
                    )
                  );
                  supabase
                    .from("rooms")
                    .update({ name: newName })
                    .eq("id", room.id);
                }}
                editMode={editMode}
              />
            ))}
          </div>
        ) : (
          <Floorplan gridSize={20} width={1000} height={600}>
            <RoomGrid
              rooms={rooms}
              onUpdate={handleUpdate}
              onDelete={handleDeleteRoom}
              onClick={handleRoomClick}
              gridSize={10}
              editMode={editMode}
            />
          </Floorplan>
        )}
      </div>
    </div>
  );
}
