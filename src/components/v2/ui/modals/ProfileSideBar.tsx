"use client";

import React, { useState, useEffect } from "react";
import PrimaryButton from "@/components/v2/ui/buttons/PrimaryButton";
import ChevronButton from "@/components/v2/ui/buttons/ChevronButton";
import Input from "@/components/v2/ui/inputs/Input";
import { theme } from "../../../../../config/theme";
import PageTitle from "@/components/v2/headings/PageTitle";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/supabase";
import Loader from "@/components/v2/other/Loader";
import Image from "next/image";

interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatarUrl?: string;
  onEditAvatar?: () => void;
}

export default function ProfileSidebar({
  isOpen,
  onClose,
  avatarUrl,
  onEditAvatar,
}: ProfileSidebarProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    displayName: "",
  });
  const [householdName, setHouseholdName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTooltip, setShowTooltip] = useState<{
    field: string | null;
    show: boolean;
  }>({ field: null, show: false });
  const [tooltipFading, setTooltipFading] = useState(false);

  // Fetch user data from Supabase
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Error fetching user:", userError?.message);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("first_name, last_name, display_name, household_id")
        .eq("id", user.id)
        .single();

      if (error) console.error("Error fetching profile:", error.message);

      if (data) {
        setFormData({
          firstName: data.first_name ?? "",
          lastName: data.last_name ?? "",
          displayName: data.display_name ?? "",
        });

        // Fetch household name if household_id exists
        if (data.household_id) {
          const { data: householdData, error: householdError } = await supabase
            .from("households")
            .select("name")
            .eq("id", data.household_id)
            .single();

          if (householdError) {
            console.error("Error fetching household:", householdError.message);
          } else if (householdData) {
            setHouseholdName(householdData.name);
          }
        }
      }

      setLoading(false);
    }

    if (isOpen) fetchProfile();
  }, [isOpen]);

  // Handle First Name change with constraints
  const handleFirstNameChange = (value: string) => {
    // Show tooltip if trying to exceed limit
    if (value.length > 14) {
      setShowTooltip({ field: "firstName", show: true });
      setTooltipFading(false);
      setTimeout(() => {
        setTooltipFading(true);
        setTimeout(() => setShowTooltip({ field: null, show: false }), 300);
      }, 1700);
      return;
    }

    // Enforce max 14 characters
    let trimmed = value.slice(0, 14);

    // Auto-capitalize only the first character if the field was empty
    if (formData.firstName.length === 0 && trimmed.length > 0) {
      trimmed = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    }

    setFormData({ ...formData, firstName: trimmed });
  };

  // Handle Last Name change with constraints
  const handleLastNameChange = (value: string) => {
    // Show tooltip if trying to exceed limit
    if (value.length > 14) {
      setShowTooltip({ field: "lastName", show: true });
      setTooltipFading(false);
      setTimeout(() => {
        setTooltipFading(true);
        setTimeout(() => setShowTooltip({ field: null, show: false }), 300);
      }, 1700);
      return;
    }

    // Enforce max 14 characters
    let trimmed = value.slice(0, 14);

    // Auto-capitalize only the first character if the field was empty
    if (formData.lastName.length === 0 && trimmed.length > 0) {
      trimmed = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    }

    setFormData({ ...formData, lastName: trimmed });
  };

  // Handle Display Name change with constraints
  const handleDisplayNameChange = (value: string) => {
    // Show tooltip if trying to exceed limit
    if (value.length > 14) {
      setShowTooltip({ field: "displayName", show: true });
      setTooltipFading(false);
      setTimeout(() => {
        setTooltipFading(true);
        setTimeout(() => setShowTooltip({ field: null, show: false }), 300);
      }, 1700);
      return;
    }

    // Enforce max 14 characters
    let trimmed = value.slice(0, 14);

    // Auto-capitalize only the first character if the field was empty
    if (formData.displayName.length === 0 && trimmed.length > 0) {
      trimmed = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    }

    setFormData({ ...formData, displayName: trimmed });
  };

  const handleSave = async () => {
    setSaving(true);
    
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Error getting user:", userError?.message);
      alert("Authentication error. Please log in again.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({
        first_name: formData.firstName,
        last_name: formData.lastName,
        display_name: formData.displayName,
      })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      console.error("Error updating profile:", error.message);
      alert("Error saving profile changes.");
    } else {
      alert("Profile updated successfully!");
      onClose();
    }
  };

  // Logout handler
  const handleLogout = async () => {
    const confirmLogout = confirm("Are you sure you want to log out?");
    if (!confirmLogout) return;

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
      alert("There was a problem logging out. Please try again.");
      return;
    }

    onClose();
    router.push("/login2");
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Show loader only on initial load
  if (loading && isOpen) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 transition-opacity"
      >
        <Loader
          primaryColor={theme.colors.secondary}
          secondaryColor={theme.colors.accent}
        />
      </div>
    );
  }

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
          <div className="relative flex items-center justify-center mb-4">
            <div className="absolute left-0">
              <ChevronButton
                onClick={onClose}
                color={theme.colors.secondary}
                size={48}
              />
            </div>
            <PageTitle text="Profile" margin="0" color="black" />
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-3">
            {/* Household Pill */}
            {householdName && (
              <div
                className="mb-4 px-4 py-2 rounded-full shadow-md"
                style={{ backgroundColor: theme.colors.accent }}
              >
                <span className="text-white font-medium text-sm">
                  {householdName}
                </span>
              </div>
            )}
            
            <div className="relative mb-2">
              <div
                className="w-36 h-36 rounded-full flex items-center justify-center overflow-hidden shadow-lg"
                style={{ backgroundColor: theme.colors.primary }}
              >
                {avatarUrl ? (
<Image
  src={avatarUrl}
  alt="Profile"
  fill
  className="object-cover"
  sizes="100vw"
/>
                ) : (
                  <div className="text-6xl text-white">👤</div>
                )}
              </div>
            </div>
            <PrimaryButton
              text="Edit"
              type="button"
              onClick={onEditAvatar}
              color={theme.colors.secondary}
              className="px-6 mx-auto text-xs"
            />
          </div>

          {/* Form */}
          <div
            className="rounded-2xl p-6 mb-6 flex-1"
            style={{ backgroundColor: theme.colors.primary }}
          >
            <div className="space-y-5">
              <div className="relative">
                <Input
                  label="First Name:"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleFirstNameChange(e.target.value)}
                  placeholder="First Name"
                  focusRingColor={theme.colors.secondary}
                  disabled={saving}
                />
                {showTooltip.field === "firstName" && showTooltip.show && (
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

              <div className="relative">
                <Input
                  label="Last Name:"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleLastNameChange(e.target.value)}
                  placeholder="Last Name"
                  focusRingColor={theme.colors.secondary}
                  disabled={saving}
                />
                {showTooltip.field === "lastName" && showTooltip.show && (
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

              <div className="relative">
                <Input
                  label="Display Name:"
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleDisplayNameChange(e.target.value)}
                  placeholder="Display Name"
                  focusRingColor={theme.colors.secondary}
                  disabled={saving}
                />
                {showTooltip.field === "displayName" && showTooltip.show && (
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
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-center gap-4 mt-auto pb-6">
            <div className="w-full max-w-xs flex flex-col gap-3">
              <PrimaryButton
                text={saving ? "Saving..." : "Save"}
                type="submit"
                onClick={handleSave}
                color={theme.colors.secondary}
                className="w-full"
                disabled={saving}
              />
              <PrimaryButton
                text="Log Out"
                type="button"
                onClick={handleLogout}
                color={theme.colors.cardRed}
                className="w-full"
                disabled={saving}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}