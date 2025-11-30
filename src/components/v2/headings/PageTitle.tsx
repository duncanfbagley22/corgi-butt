import React from "react";
import clsx from "clsx";

type PageTitleProps = {
  text: string;
  fontSize?: number;         
  style?: "normal" | "bold";
  dropShadow?: boolean;
  margin?: string; // e.g., "1.5rem" or "24px"
  color?: string; // e.g., "#000000" or "black"
  customStyle?: React.CSSProperties;
};

export default function PageTitle({
  text,
  fontSize = 36,
  style = "bold",
  dropShadow = true,
  margin = "1.5rem", // default to m-6 (24px)
  color = "white",
  customStyle,
}: PageTitleProps) {
  return (
    <h1
      className={clsx(
        "text-center font-[Poppins]",
        style === "bold" ? "font-bold" : "font-normal",
        dropShadow && "drop-shadow-md"
      )}
      style={{ fontSize, margin, color, ...customStyle }}
    >
      {text}
    </h1>
  );
}