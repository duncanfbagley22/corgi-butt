import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/supabase";
import PrimaryButton from "@/components/v2/ui/buttons/PrimaryButton";
import ChevronButton from "@/components/v2/ui/buttons/ChevronButton";
import Dropdown from "@/components/v2/ui/inputs/Dropdown";
import { theme } from "../../../../../config/theme";
import PageTitle from "@/components/v2/headings/PageTitle";

interface FilterTaskSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onApplyFilters?: (filters: {
    room?: string;
    tag?: string;
    assignee?: string;
  }) => void;
  onClearFilters?: () => void;
}

export default function FilterTaskSidebar({
  isOpen,
  onClose,
  currentUserId,
  onApplyFilters,
  onClearFilters,
}: FilterTaskSidebarProps) {
  const [filters, setFilters] = useState({
    room: "",
    tag: "",
    assignee: "",
  });

  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);
  const [tags, setTags] = useState<
    { id: string; name: string; name_short: string }[]
  >([]);
  const [assignees, setAssignees] = useState<
    { id: string; display_name: string }[]
  >([]);

  // Fetch rooms for the user's household
  useEffect(() => {
    if (!currentUserId) return;

    const fetchRooms = async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select(
          `
          id,
          name,
          household:household_id (
            id,
            users (
              id
            )
          )
        `
        )
        .eq("household.users.id", currentUserId);

      if (error) {
        console.error("Error fetching rooms:", error);
      } else if (data) {
        setRooms(data);
      }
    };

    fetchRooms();
  }, [currentUserId]);

  // Fetch tags for the user's household
  useEffect(() => {
    if (!currentUserId) return;

    const fetchTags = async () => {
      const { data, error } = await supabase
        .from("tags")
        .select(
          `
          id,
          name,
          name_short,
          household:household_id (
            id,
            users (
              id
            )
          )
        `
        )
        .eq("household.users.id", currentUserId);

      if (error) {
        console.error("Error fetching tags:", error);
      } else if (data) {
        setTags(data);
      }
    };

    fetchTags();
  }, [currentUserId]);

  // Fetch users in the same household
  useEffect(() => {
    if (!currentUserId) return;

    const fetchAssignees = async () => {
      // First get the user's household_id
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("household_id")
        .eq("id", currentUserId)
        .single();

      if (userError) {
        console.error("Error fetching user household:", userError);
        return;
      }

      // Then get all users in that household
      const { data, error } = await supabase
        .from("users")
        .select("id, display_name")
        .eq("household_id", userData.household_id);

      if (error) {
        console.error("Error fetching assignees:", error);
      } else if (data) {
        setAssignees(data);
      }
    };

    fetchAssignees();
  }, [currentUserId]);

  const handleApply = () => {
    onApplyFilters?.(filters);
    onClose();
  };

  const handleClear = () => {
    setFilters({
      room: "",
      tag: "",
      assignee: "",
    });
    onClearFilters?.();
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-40 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-gradient-to-b from-slate-100 to-slate-200 shadow-2xl transition-transform duration-300 ease-out z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full overflow-y-auto p-6 flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-12 mb-8">
            <ChevronButton
              onClick={onClose}
              color={theme.colors.secondary}
              size={48}
            />
            <div className="flex-1 flex">
              <PageTitle text="Filter Tasks" margin="0" color="black" />
            </div>
          </div>

          {/* Filter Sections */}
          <div className="flex-1 space-y-4">
            {/* Room Filter */}
            <div
              className="rounded-2xl p-6"
              style={{ backgroundColor: theme.colors.primary }}
            >
              <Dropdown
                id="filter-room-dropdown"
                label="Room:"
                placeholder="Select room(s)"
                value={filters.room}
                onChange={(e) =>
                  setFilters({ ...filters, room: e.target.value })
                }
                options={[
                  { value: "", label: "All Rooms" },
                  ...rooms.map((room) => ({
                    value: room.id,
                    label: room.name,
                  })),
                ]}
                focusRingColor={theme.colors.secondary}
              />
            </div>

            {/* Tags Filter */}
            <div
              className="rounded-2xl p-6"
              style={{ backgroundColor: theme.colors.primary }}
            >
              <Dropdown
                id="filter-tags-dropdown"
                label="Tags:"
                placeholder="Select tag(s)"
                value={filters.tag}
                onChange={(e) =>
                  setFilters({ ...filters, tag: e.target.value })
                }
                options={[
                  { value: "", label: "All Tags" },
                  ...tags.map((tag) => ({
                    value: tag.id,
                    label: tag.name,
                  })),
                ]}
                focusRingColor={theme.colors.secondary}
              />
            </div>

            {/* Assignee Filter */}
            <div
              className="rounded-2xl p-6"
              style={{ backgroundColor: theme.colors.primary }}
            >
              <Dropdown
                id="filter-assignee-dropdown"
                label="Assignee:"
                placeholder="Select assignee"
                value={filters.assignee}
                onChange={(e) =>
                  setFilters({ ...filters, assignee: e.target.value })
                }
                options={[
                  { value: "", label: "All Assignees" },
                  ...assignees.map((user) => ({
                    value: user.id,
                    label: user.display_name,
                  })),
                ]}
                focusRingColor={theme.colors.secondary}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 mt-6 flex flex-col items-center">
            <PrimaryButton
              text="Apply Filters"
              type="button"
              onClick={handleApply}
              color={theme.colors.secondary}
              className="w-64" // fixed width
            />
            <PrimaryButton
              text="Clear Filters"
              type="button"
              onClick={handleClear}
              color={theme.colors.cardRed}
              className="w-64" // same fixed width
            />
          </div>
        </div>
      </div>
    </>
  );
}
