"use client";

import React, { useState, useEffect } from "react";
// Import createPortal for reliable fixed positioning
import { createPortal } from 'react-dom'; 
import { cn } from "@/lib/utils";
import { X, Sparkles, Check } from "lucide-react";
import { theme } from "../../../../../config/theme";

interface FloatingActionButtonProps {
  color?: string;
  icons: React.ReactNode[];
  onOption1Click?: () => void;
  onOption2Click?: () => void;
  onOption3Click?: () => void;
  cancelMode?: boolean;
  statusMode?: boolean;
  onCancelClick?: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  color = theme.colors.secondary,
  icons,
  onOption1Click,
  onOption2Click,
  onOption3Click,
  cancelMode = false,
  statusMode = false,
  onCancelClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false); 
  const hasMultipleOptions = icons.length > 1;

  useEffect(() => {
    // Set isMounted immediately when the component mounts on the client
    setIsMounted(true); 

    // Start the 1-second delay timer for the fade-in effect
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    // Cleanup function
    return () => clearTimeout(timer);
  }, []);

  const handleMainClick = () => {
    if (cancelMode || statusMode) {
      onCancelClick?.();
    } else if (hasMultipleOptions) {
      setIsOpen(!isOpen);
    } else {
      onOption1Click?.();
    }
  };

  const handleOption1 = () => {
    onOption1Click?.();
    setIsOpen(false);
  };

  const handleOption2 = () => {
    onOption2Click?.();
    setIsOpen(false);
  };

  const handleOption3 = () => {
    onOption3Click?.();
    setIsOpen(false);
  };

  // Content for the button and its options (this will be portal-ed)
  const buttonContent = (
    <div 
      className={cn(
        // Positioning and fade-in classes are applied here
        "fixed bottom-6 right-6 sm:right-10 md:right-12 z-50 transition-opacity duration-500",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >

      {/* Option 1 - 9 o'clock position (directly left) */}
      {hasMultipleOptions && isOpen && !cancelMode && !statusMode && (
        <div
          className="absolute transition-all duration-300 ease-out"
          style={{
            bottom: "8px",
            right: "100px",
            transform: isOpen ? "scale(1)" : "scale(0)",
            opacity: isOpen ? 1 : 0,
          }}
        >
          <button
            onClick={handleOption1}
            className={cn(
              "w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-white text-xl cursor-pointer",
              "transition-all duration-200 hover:scale-105 hover:opacity-90 active:scale-[0.95]"
            )}
            style={{ backgroundColor: color }}
          >
            {icons[0]}
          </button>
        </div>
      )}

      {/* Option 2 - 12 o'clock position (directly above) OR 10 o'clock if 3 options */}
      {hasMultipleOptions && isOpen && !cancelMode && !statusMode && icons.length >= 2 && (
        <div
          className="absolute transition-all duration-300 ease-out"
          style={{
            bottom: icons.length === 2 ? "100px" : "70px",
            right: icons.length === 2 ? "8px" : "70px",
            transform: isOpen ? "scale(1)" : "scale(0)",
            opacity: isOpen ? 1 : 0,
          }}
        >
          <button
            onClick={handleOption2}
            className={cn(
              "w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-white text-xl cursor-pointer",
              "transition-all duration-200 hover:scale-105 hover:opacity-90 active:scale-[0.95]"
            )}
            style={{ backgroundColor: color }}
          >
            {icons[1]}
          </button>
        </div>
      )}

      {/* Option 3 - 12 o'clock position (directly above) */}
      {hasMultipleOptions && isOpen && !cancelMode && !statusMode && icons.length >= 3 && (
        <div
          className="absolute transition-all duration-300 ease-out"
          style={{
            bottom: "100px",
            right: "8px",
            transform: isOpen ? "scale(1)" : "scale(0)",
            opacity: isOpen ? 1 : 0,
          }}
        >
          <button
            onClick={handleOption3}
            className={cn(
              "w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-white text-xl cursor-pointer",
              "transition-all duration-200 hover:scale-105 hover:opacity-90 active:scale-[0.95]"
            )}
            style={{ backgroundColor: color }}
          >
            {icons[2]}
          </button>
        </div>
      )}

      {/* Main Button */}
      <div
        onClick={handleMainClick}
        className={cn(
          "flex items-center justify-center rounded-full shadow-lg cursor-pointer",
          "transition-all duration-200 hover:scale-105 hover:opacity-90 active:scale-[0.95]"
        )}
        style={{
          backgroundColor: statusMode ? theme.colors.cardGreen : (cancelMode ? theme.colors.cardRed : color),
          width: "80px",
          height: "80px",
        }}
      >
        {statusMode ? (
          <div className="text-white text-3xl flex items-center justify-center">
            <Check size={36} />
          </div>
        ) : cancelMode ? (
          <div className="text-white text-3xl flex items-center justify-center">
            <X size={36} />
          </div>
        ) : (
          <div className="text-white text-3xl flex items-center justify-center">
            <Sparkles size={36} />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop (rendered normally, within the component's tree) */}
      {isOpen && !cancelMode && !statusMode && (
        <div
          className="fixed inset-0 bg-black/70 z-40 transition-opacity duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Portal: This renders the buttonContent outside of the main app root, 
          preventing hydration issues on hard reloads. */}
      {isMounted ? createPortal(buttonContent, document.body) : null}
    </>
  );
};

export default FloatingActionButton;