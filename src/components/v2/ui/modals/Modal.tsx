"use client";

import React, { useState, useEffect } from "react";
import { clsx } from "clsx";
import { supabase } from "@/lib/supabase/supabase";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Input from "@/components/v2/ui/inputs/Input";
import Dropdown from "@/components/v2/ui/inputs/Dropdown";
import FrequencySelector from "@/components/v2/ui/inputs/FrequencySelector";
import IconButton from "@/components/v2/ui/buttons/IconButton";
import PrimaryButton from "@/components/v2/ui/buttons/PrimaryButton";
import { theme } from "../../../../../config/theme";

export interface TaskLike {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  frequency?: number;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  level: "room" | "area" | "task";
  closeButtonPosition?: "left" | "right";
  icons: React.ReactNode[];
  selectedIconIndex?: number;
  onIconChange?: (index: number) => void;
  nameValue?: string;
  onNameChange?: (value: string) => void;
  descriptionValue?: string;
  onDescriptionChange?: (value: string) => void;
  rooms?: Array<{ id: string; name: string }>;
  areas?: Array<{ id: string; name: string; room_id: string }>;
  roomValue?: string;
  areaValue?: string;
  tagsValue?: string;
  onRoomChange?: (value: string) => void;
  onAreaChange?: (value: string) => void;
  onTagsChange?: (value: string) => void;
  onPrimaryAction?: (
    tags: { id: string; name: string; name_short: string }[]
  ) => void;
  onSecondaryAction?: () => void;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  maxWidth?: string;
  className?: string;
  editingTask?: TaskLike | null;
  frequency?: number;
  onFrequencyChange?: (value: number) => void;
  currentUserId: string;
}

export default function Modal({
  isOpen,
  onClose,
  mode,
  level,
  closeButtonPosition = "right",
  icons,
  selectedIconIndex = 0,
  onIconChange,
  nameValue = "",
  onNameChange,
  descriptionValue = "",
  onDescriptionChange,
  rooms = [],
  areas = [],
  roomValue = "",
  areaValue = "",
  onRoomChange,
  onAreaChange,
  onTagsChange,
  onPrimaryAction,
  onSecondaryAction,
  primaryButtonText = "Save",
  secondaryButtonText = "Cancel",
  maxWidth = "500px",
  className,
  editingTask = null,
  frequency = 7,
  onFrequencyChange,
  currentUserId,
}: ModalProps) {
  const [currentIconIndex, setCurrentIconIndex] = useState(selectedIconIndex);
  const [localFrequency, setLocalFrequency] = useState(frequency);
  const [showAllIcons, setShowAllIcons] = useState(false);
  const [showMaxTooltip, setShowMaxTooltip] = useState(false);
  const [tooltipFading, setTooltipFading] = useState(false);
  const [selectedtags, setSelectedtags] = useState<
    { id: string; name: string; name_short: string }[]
  >([]);
  const [availableTags, setAvailableTags] = useState<
    { id: string; name: string; name_short: string }[]
  >([]);

  const filteredAreas = areas.filter((area) => area.room_id === roomValue);

  useEffect(() => {
    if (!currentUserId) return;
    async function fetchTags() {
      const { data } = await supabase
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

      if (data) setAvailableTags(data);
    }
    fetchTags();
  }, [currentUserId]);

  useEffect(() => {
    if (!editingTask?.id) {
      setSelectedtags([]);
      return;
    }

    const taskId = editingTask.id;
    async function fetchTaskTags() {
      const { data, error } = await supabase
        .from("task_tags")
        .select(`tag:tag_id (id, name, name_short)`)
        .eq("task_id", taskId);

      if (error) {
        console.error("Error fetching task tags:", error);
      } else if (data) {
        // data items have shape: { tag: { id, name, name_short } }
        // cast via unknown first to satisfy TypeScript when upstream typings are loose
        const tags = (data as unknown as Array<{
          tag: { id: string; name: string; name_short: string };
        }>).map((t) => t.tag);
        setSelectedtags(tags);
      }
    }

    fetchTaskTags();
  }, [editingTask]);

useEffect(() => {
  if (isOpen) {
    const freq = editingTask?.frequency ?? frequency ?? 7;
    const numericFreq = typeof freq === "number" ? freq : Number(freq) || 7;
    setLocalFrequency(numericFreq);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [editingTask, isOpen]);

  useEffect(() => {
    const numericFreq =
      typeof localFrequency === "number"
        ? localFrequency
        : Number(localFrequency) || 7;
    onFrequencyChange?.(numericFreq);
  }, [localFrequency, onFrequencyChange]);

  useEffect(() => {
  setCurrentIconIndex(selectedIconIndex);
}, [selectedIconIndex]);

  // Lock scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }

    // Cleanup on unmount
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrevIcon = () => {
    const newIndex =
      currentIconIndex === 0 ? icons.length - 1 : currentIconIndex - 1;
    setCurrentIconIndex(newIndex);
    onIconChange?.(newIndex);
  };

  const handleNextIcon = () => {
    const newIndex =
      currentIconIndex === icons.length - 1 ? 0 : currentIconIndex + 1;
    setCurrentIconIndex(newIndex);
    onIconChange?.(newIndex);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handletagSelect = (tagId: string) => {
    const tag = availableTags.find((t) => t.id === tagId);
    if (tag && !selectedtags.some((t) => t.id === tagId)) {
      setSelectedtags([...selectedtags, tag]);
      onTagsChange?.(tagId);
    }
  };

  const isTask = level === "task";
  const title = `${mode === "add" ? "Add" : "Edit"} ${
    level.charAt(0).toUpperCase() + level.slice(1)
  }`;

  const handleNameChange = (value: string) => {
    // If user tries typing the 15th character → show tooltip
    if (value.length > 14) {
      setShowMaxTooltip(true);
      setTooltipFading(false);
      setTimeout(() => {
        setTooltipFading(true);
        setTimeout(() => setShowMaxTooltip(false), 300);
      }, 1700);
      return;
    }

    // If user clears field
    if (!value) {
      onNameChange?.("");
      return;
    }

    // Auto-cap uppercase for first character only
    let updated = value;
    if (nameValue.length === 0 && updated.length > 0) {
      updated = updated.charAt(0).toUpperCase() + updated.slice(1);
    }

    onNameChange?.(updated);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        className={clsx(
          "relative bg-white rounded-lg shadow-xl p-6 m-4 overflow-y-auto max-h-[90vh]",
          "animate-in fade-in zoom-in-95 duration-200",
          className
        )}
        style={{ maxWidth, width: "100%" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          {closeButtonPosition === "left" && (
            <IconButton
              icon={<X size={24} color="white" />}
              color={theme.colors.secondary}
              onClick={onClose}
            />
          )}
          {closeButtonPosition === "right" && <div className="w-10" />}
          <h2 className="text-xl font-semibold text-gray-900 flex-1 text-center">
            {title}
          </h2>
          {closeButtonPosition === "right" && (
            <IconButton
              icon={<X size={24} color="white" />}
              color={theme.colors.secondary}
              onClick={onClose}
            />
          )}
          {closeButtonPosition === "left" && <div className="w-10" />}
        </div>
        {/* Icon Selector */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <button
            onClick={handlePrevIcon}
            className="text-black hover:bg-white/10 rounded-full p-2 transition-colors cursor-pointer"
            aria-label="Previous icon"
          >
            <ChevronLeft className="w-16 h-16" />
          </button>
          <div
            className="rounded-lg p-2 flex items-center justify-center"
            style={{ backgroundColor: theme.colors.primary }}
          >
            <div className="bg-white rounded-lg p-6 w-24 h-24 flex items-center justify-center">
              {icons[currentIconIndex]}
            </div>
          </div>
          <button
            onClick={handleNextIcon}
            className="text-black hover:bg-white/10 rounded-full p-2 transition-colors cursor-pointer"
            aria-label="Next icon"
          >
            <ChevronRight className="w-16 h-16" />
          </button>
        </div>
        {/* Icon Suggestions */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Suggestions</p>
          <div className="flex gap-3 justify-center">
            {icons.slice(0, 3).map((icon, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIconIndex(index);
                  onIconChange?.(index);
                }}
                className={clsx(
                  "p-0.5 rounded-lg transition-all cursor-pointer",
                  index === currentIconIndex
                    ? "border-4"
                    : "border-4 border-transparent hover:border-gray-300"
                )}
                style={{
                  backgroundColor: theme.colors.primary,
                  ...(index === currentIconIndex
                    ? { borderColor: theme.colors.secondary }
                    : {}),
                }}
              >
                <div className="p-2 w-12 h-12 rounded-lg flex items-center justify-center transition-all bg-white">
                  {icon}
                </div>
              </button>
            ))}
            <button
              onClick={() => setShowAllIcons(true)}
              className="p-0.5 rounded-lg border-4 border-transparent hover:border-gray-300 transition-all cursor-pointer"
              style={{ backgroundColor: theme.colors.primary }}
            >
              <div className="p-2 w-12 h-12 rounded-lg flex items-center justify-center bg-white text-gray-700 font-semibold text-xs">
                View All
              </div>
            </button>
          </div>
        </div>
        {showAllIcons && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative bg-white rounded-lg shadow-xl p-6 m-4 overflow-y-auto max-h-[90vh] w-[80%] max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  All Icons
                </h2>
                <IconButton
                  icon={<X size={24} color="white" />}
                  color={theme.colors.secondary}
                  onClick={() => setShowAllIcons(false)}
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {icons.map((icon, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIconIndex(index);
                      onIconChange?.(index);
                      setShowAllIcons(false);
                    }}
                    className={clsx(
                      "p-0.5 rounded-lg transition-all w-fit mx-auto cursor-pointer",
                      index === currentIconIndex
                        ? "border-4"
                        : "border-4 border-transparent hover:border-gray-300"
                    )}
                    style={{
                      backgroundColor: theme.colors.primary,
                      ...(index === currentIconIndex
                        ? { borderColor: theme.colors.secondary }
                        : {}),
                    }}
                  >
                    <div className="p-2 w-12 h-12 rounded-lg flex items-center justify-center bg-white">
                      {icon}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Form Fields */}
        <div className="space-y-4 mb-6">
          <div
            className="rounded-2xl space-y-4 p-6"
            style={{ backgroundColor: theme.colors.primary }}
          >
            <div className="relative">
              <Input
                label="Name:"
                type="text"
                value={nameValue}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Name"
                focusRingColor={theme.colors.secondary}
              />
              {showMaxTooltip && (
                <div
                  className={`absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-2 rounded-lg shadow-lg text-white text-sm whitespace-nowrap z-10 transition-opacity duration-300 ${
                    tooltipFading ? "opacity-0" : "opacity-100"
                  }`}
                  style={{ backgroundColor: theme.colors.secondary }}
                >
                  Maximum 14 characters
                  <div
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45"
                    style={{ backgroundColor: theme.colors.secondary }}
                  />
                </div>
              )}
            </div>

            {isTask && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Dropdown
                    label="Room:"
                    placeholder="Select Room"
                    value={roomValue}
                    onChange={(e) => onRoomChange?.(e.target.value)}
                    options={rooms.map((room) => ({
                      value: room.id,
                      label: room.name,
                    }))}
                    focusRingColor={theme.colors.secondary}
                  />
                  <Dropdown
                    label="Area:"
                    placeholder="Select Area"
                    value={areaValue}
                    onChange={(e) => onAreaChange?.(e.target.value)}
                    options={filteredAreas.map((area) => ({
                      value: area.id,
                      label: area.name,
                    }))}
                    focusRingColor={theme.colors.secondary}
                  />
                </div>
                <Input
                  label="Description:"
                  type="textarea"
                  value={descriptionValue}
                  onChange={(e) => onDescriptionChange?.(e.target.value)}
                  placeholder="Optional description"
                  focusRingColor={theme.colors.secondary}
                />
                <Dropdown
                  label="Tag(s):"
                  placeholder="Select a tag"
                  value=""
                  onChange={(e) => handletagSelect(e.target.value)}
                  options={[
                    { value: "", label: "Select a tag" },
                    ...availableTags.map((tag) => ({
                      value: tag.id,
                      label: tag.name,
                    })),
                  ]}
                  focusRingColor={theme.colors.secondary}
                />

                {selectedtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedtags.map((tag) => (
                      <div
                        key={tag.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-white text-base font-medium"
                        style={{ backgroundColor: theme.colors.secondary }}
                      >
                        <button
                          onClick={() =>
                            setSelectedtags(
                              selectedtags.filter((t) => t.id !== tag.id)
                            )
                          }
                          className="hover:bg-white/20 rounded-full p-0.5 transition-colors cursor-pointer"
                          aria-label="Remove tag"
                        >
                          <X size={16} />
                        </button>
                        <span>{tag.name_short}</span>
                      </div>
                    ))}
                  </div>
                )}
                <FrequencySelector
                  label={
                    <>
                      <span className="hidden sm:inline">How often?</span>
                      <span className="inline sm:hidden">
                        How often (in days)?
                      </span>
                    </>
                  }
                  value={localFrequency}
                  onChange={setLocalFrequency}
                  focusRingColor={theme.colors.secondary}
                />
              </>
            )}
          </div>
        </div>
        {/* Action Buttons */}
        <div className="space-y-4 mt-0">
          <PrimaryButton
            text={primaryButtonText}
            type="button"
            onClick={() => {
              if (!nameValue || nameValue.trim() === "") {
                // You can show a toast, tooltip, error message — whatever you want
                alert("Name is required.");
                return;
              }
              onPrimaryAction?.(selectedtags);
            }}
            color={theme.colors.secondary}
            className="mx-auto w-60 sm:w-75"
          />
          <PrimaryButton
            text={secondaryButtonText}
            type="button"
            onClick={() => {
              onSecondaryAction?.();
            }}
            color={theme.colors.cardRed}
            className="mx-auto w-60 sm:w-75"
          />
        </div>
      </div>
    </div>
  );
}
