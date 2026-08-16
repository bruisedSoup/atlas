"use client";

import React from "react";

export const PUSHPIN_VARIANTS = [
  { name: "Sky Blue", color: "#60a5fa" },
  { name: "Soft Pink", color: "#f472b6" },
  { name: "Pastel Yellow", color: "#facc15" },
  { name: "Mint Green", color: "#4ade80" },
  { name: "Lavender", color: "#c084fc" },
  { name: "Coral Orange", color: "#fb923c" },
  { name: "Ruby Red", color: "#f87171" },
  { name: "Teal Cyan", color: "#2dd4bf" },
];

export function getRandomPushpinColor(seed?: string | number): string {
  if (seed !== undefined) {
    let hash = 0;
    const str = String(seed);
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % PUSHPIN_VARIANTS.length;
    return PUSHPIN_VARIANTS[index].color;
  }
  const randomIndex = Math.floor(Math.random() * PUSHPIN_VARIANTS.length);
  return PUSHPIN_VARIANTS[randomIndex].color;
}

interface PushpinIconProps {
  color?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function PushpinIcon({
  color = "#60a5fa",
  size = 28,
  className = "",
  style = {},
}: PushpinIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "inline-block", flexShrink: 0, ...style }}
    >
      <defs>
        <linearGradient id={`pinHeadGrad-${color}`} x1="12" y1="6" x2="36" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="35%" stopColor={color} />
          <stop offset="85%" stopColor={color} />
          <stop offset="100%" stopColor="#1e293b" stopOpacity="0.4" />
        </linearGradient>

        <linearGradient id={`pinNeedleGrad-${color}`} x1="20" y1="28" x2="32" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        <filter id={`pinShadow-${color}`} x="2" y="2" width="44" height="44" filterUnits="userSpaceOnUse">
          <feDropShadow dx="1" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>

      <g filter={`url(#pinShadow-${color})`}>
        {/* Metal Needle Point */}
        <path
          d="M24 28L20 44L26 30Z"
          fill={`url(#pinNeedleGrad-${color})`}
          stroke="#475569"
          strokeWidth="0.75"
        />

        {/* Pin Base Rim */}
        <ellipse
          cx="24"
          cy="27"
          rx="9"
          ry="3.5"
          fill={color}
          stroke="#000000"
          strokeWidth="0.8"
          strokeOpacity="0.2"
        />

        {/* Pin Waist / Body */}
        <path
          d="M17 14C17 14 18 22 16 26C18 27.5 30 27.5 32 26C30 22 31 14 31 14Z"
          fill={`url(#pinHeadGrad-${color})`}
          stroke="#000000"
          strokeWidth="0.6"
          strokeOpacity="0.15"
        />

        {/* Pin Top Cap Sphere */}
        <ellipse
          cx="24"
          cy="13"
          rx="10"
          ry="5.5"
          fill={`url(#pinHeadGrad-${color})`}
          stroke="#ffffff"
          strokeWidth="0.75"
          strokeOpacity="0.6"
        />

        {/* 3D Gloss Highlight */}
        <ellipse
          cx="21"
          cy="11.5"
          rx="4.5"
          ry="2"
          fill="#ffffff"
          fillOpacity="0.75"
        />
      </g>
    </svg>
  );
}
