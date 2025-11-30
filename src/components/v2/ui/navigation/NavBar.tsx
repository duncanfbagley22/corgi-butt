"use client";

import React from "react";
import { clsx } from "clsx";

interface NavBarProps {
  text?: string;
  textColor?: string;
  backgroundColor?: string;
  leftButtons?: React.ReactNode[];
  rightButtons?: React.ReactNode[];
  centerButtons?: React.ReactNode[];
  height?: number;
  shadow?: boolean;
  fixed?: boolean; // Fixed to top of screen
  className?: string;
  narrowScreenTextAlign?: "left" | "center"; // Control text alignment on narrow screens
}

export default function NavBar({
  text,
  textColor = '#ffffff',
  backgroundColor = '#1f2937',
  leftButtons = [],
  rightButtons = [],
  height = 64,
  shadow = true,
  fixed = true, // Rename this prop to 'sticky' for clarity, but keep it for now
  className,
}: NavBarProps) {
  return (
    <nav
      className={clsx(
        "w-full relative flex items-center px-4",
        shadow && "shadow-md",
        // ✨ CHANGE MADE HERE: Replaced "fixed" with "sticky"
        fixed && "sticky top-0 z-50", 
        className
      )}
      style={{ backgroundColor, height: `${height}px` }}
    >
      {/* Left Section */}
      <div className="flex items-center gap-3 flex-shrink-0 z-10">
        {leftButtons.map((button, index) => (
          <div key={`left-${index}`}>{button}</div>
        ))}
      </div>

      {/* Center Section */}
      <div className="flex-1 flex items-center justify-center md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
        {text && (
          <span
            className="
              font-bold
              text-lg md:text-2xl
              font-[Poppins]
              whitespace-normal
              leading-tight
              max-w-[60%] md:max-w-none
              text-center
            "
            style={{ color: textColor }}
          >
            {text}
          </span>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 flex-shrink-0 z-10 ml-auto">
        {rightButtons.map((button, index) => (
          <div key={`right-${index}`}>{button}</div>
        ))}
      </div>
    </nav>
  )
}