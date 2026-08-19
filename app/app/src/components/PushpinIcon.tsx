"use client";

import React from "react";

export const PUSHPIN_VARIANTS = [
  { name: "Blue", color: "blue", src: "/pushpins/pushpin_blue.png" },
  { name: "Red", color: "red", src: "/pushpins/pushpin_red.png" },
  { name: "Yellow", color: "yellow", src: "/pushpins/pushpin_yellow.png" },
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

export function getPushpinSrc(colorNameOrColor?: string): string {
  if (!colorNameOrColor) return "/pushpins/pushpin_blue.png";
  const lower = colorNameOrColor.toLowerCase();
  if (lower.includes("red") || lower.includes("pink") || lower.includes("ruby")) {
    return "/pushpins/pushpin_red.png";
  }
  if (lower.includes("yellow") || lower.includes("orange") || lower.includes("gold") || lower.includes("pastel")) {
    return "/pushpins/pushpin_yellow.png";
  }
  return "/pushpins/pushpin_blue.png";
}

interface PushpinIconProps {
  color?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function PushpinIcon({
  color = "blue",
  size = 28,
  className = "",
  style = {},
}: PushpinIconProps) {
  const src = getPushpinSrc(color);

  return (
    <img
      src={src}
      alt="Pushpin"
      width={size}
      height={size}
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: "contain",
        display: "inline-block",
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
