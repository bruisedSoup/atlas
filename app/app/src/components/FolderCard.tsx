"use client";

import React from "react";

export type FolderColorKey =
  | "white"
  | "pink"
  | "blue"
  | "purple"
  | "matcha"
  | "yellow"
  | "orange";

export interface FolderThemeConfig {
  id: FolderColorKey;
  name: string;
  colorHex: string;
  imageSrc: string;
}

export const FOLDER_THEMES: FolderThemeConfig[] = [
  { id: "white", name: "White", colorHex: "#EDEFE9", imageSrc: "/folders/folder_white.png" },
  { id: "pink", name: "Pink", colorHex: "#FFAEC9", imageSrc: "/folders/folder_pink.png" },
  { id: "blue", name: "Blue", colorHex: "#A6D6F5", imageSrc: "/folders/folder_blue.png" },
  { id: "purple", name: "Purple", colorHex: "#D4C5F9", imageSrc: "/folders/folder_purple.png" },
  { id: "matcha", name: "Matcha", colorHex: "#CBE7B9", imageSrc: "/folders/folder_matcha.png" },
  { id: "yellow", name: "Yellow", colorHex: "#F9F68B", imageSrc: "/folders/folder_yellow.png" },
  { id: "orange", name: "Orange", colorHex: "#FDBE85", imageSrc: "/folders/folder_orange.png" },
];

export function getFolderTheme(colorKey?: string): FolderThemeConfig {
  if (!colorKey) return FOLDER_THEMES[0];
  const normalized = colorKey.toLowerCase().trim();
  const found = FOLDER_THEMES.find(
    (t) => t.id === normalized || t.colorHex.toLowerCase() === normalized
  );
  return found || FOLDER_THEMES[0];
}

interface FolderCardProps {
  color?: string;
  courseName?: string;
  courseCode?: string;
  instructor?: string;
  room?: string;
  onClick?: () => void;
  onEdit?: () => void;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function FolderCard({
  color = "purple",
  courseName = "Course Code",
  courseCode,
  instructor,
  room,
  onClick,
  size = "md",
  interactive = true,
  className = "",
  style = {},
}: FolderCardProps) {
  const theme = getFolderTheme(color);
  const displayText = courseCode || courseName || "Course Code";

  // Dimensions based on size
  const dimensions = {
    sm: { width: "130px", height: "92px", fontSize: "0.75rem" },
    md: { width: "100%", maxWidth: "230px", aspectRatio: "1.42 / 1", fontSize: "0.88rem" },
    lg: { width: "100%", maxWidth: "280px", aspectRatio: "1.42 / 1", fontSize: "0.95rem" },
  }[size];

  return (
    <div
      onClick={interactive ? onClick : undefined}
      className={className}
      title={interactive ? `Click to view or edit ${courseName}` : undefined}
      style={{
        position: "relative",
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: dimensions.width,
        maxWidth: dimensions.maxWidth,
        cursor: interactive ? "pointer" : "default",
        userSelect: "none",
        transition: "transform 0.18s ease, filter 0.18s ease",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (interactive) {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.filter = "drop-shadow(0 8px 16px rgba(0, 0, 0, 0.08))";
        }
      }}
      onMouseLeave={(e) => {
        if (interactive) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.filter = "none";
        }
      }}
    >
      {/* Folder Graphic */}
      <img
        src={theme.imageSrc}
        alt={`${theme.name} Folder - ${courseName}`}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          objectFit: "contain",
          pointerEvents: "none",
        }}
        onError={(e) => {
          // Fallback to elements path if public path fails
          e.currentTarget.src = `/src/elements/folders/folder_${theme.id}.png`;
        }}
      />

      {/* Label Text Overlaid on Folder Surface */}
      <div
        style={{
          position: "absolute",
          right: "12%",
          bottom: "9%",
          left: "20%",
          textAlign: "right",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: dimensions.fontSize,
            fontWeight: 400,
            color: "#18181b",
            letterSpacing: "-0.01em",
            display: "inline-block",
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {displayText}
        </span>
      </div>
    </div>
  );
}
