import React from "react";

type MainBackgroundProps = {
  color?: string; // Hex color (e.g., "#224A6E")
  children?: React.ReactNode;
};

export default function MainBackground({ color = "#111827", children }: MainBackgroundProps) {
  return (
    <div
      className="w-full min-h-screen"
      style={{ backgroundColor: color }}
    >
      {children}
    </div>
  );
}