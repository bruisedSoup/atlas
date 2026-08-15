import React from "react";

interface PushpinIconProps {
  color?: string;
  size?: number;
  className?: string;
}

export const PUSHPIN_COLORS = [
  "#60a5fa", // Sky Blue
  "#f59e0b", // Amber Yellow
  "#ef4444", // Coral Red
  "#ec4899", // Pink
  "#10b981", // Emerald Green
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#f97316", // Orange
];

export function getRandomPushpinColor(seed?: number | string): string {
  if (seed !== undefined) {
    const num = typeof seed === "number" ? seed : seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return PUSHPIN_COLORS[Math.abs(num) % PUSHPIN_COLORS.length];
  }
  return PUSHPIN_COLORS[Math.floor(Math.random() * PUSHPIN_COLORS.length)];
}

export function PushpinIcon({ color = "#60a5fa", size = 28, className = "" }: PushpinIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ transform: "rotate(-25deg)", display: "inline-block" }}
    >
      {/* Pin needle */}
      <path
        d="M24 32L19 46L26 33"
        stroke="#94a3b8"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Pin head base shadow */}
      <ellipse cx="24" cy="31" rx="9" ry="3.5" fill="#334155" opacity="0.25" />
      {/* Pin head base */}
      <ellipse cx="24" cy="29" rx="8" ry="3" fill={color} />
      {/* Pin middle body */}
      <path
        d="M17 17C17 22 20 28 20 28H28C28 28 31 22 31 17C31 13 28 12 24 12C20 12 17 13 17 17Z"
        fill={color}
      />
      {/* Pin top cap */}
      <ellipse cx="24" cy="12" rx="10" ry="4" fill={color} />
      {/* 3D Highlight reflection */}
      <ellipse cx="22" cy="11" rx="6" ry="2" fill="#ffffff" opacity="0.55" />
      <path
        d="M19 16C19 20 21 24 21 26"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}
