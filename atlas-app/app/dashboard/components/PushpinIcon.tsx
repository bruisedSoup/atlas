import React from "react";

export type PushpinColor = "blue" | "red" | "yellow" | string;

export const PUSHPIN_VARIANTS = ["blue", "red", "yellow"] as const;

export const PUSHPIN_IMAGES: Record<string, string> = {
  blue: "/pushpins/pushpin_blue.png",
  red: "/pushpins/pushpin_red.png",
  yellow: "/pushpins/pushpin_yellow.png",
};

export function normalizePushpinColor(color?: string): "blue" | "red" | "yellow" {
  if (!color) return "blue";
  if (color === "red" || color.includes("red") || color === "#ef4444" || color === "#ec4899") return "red";
  if (color === "yellow" || color.includes("yellow") || color === "#f59e0b" || color === "#facc15") return "yellow";
  return "blue";
}

export function getRandomPushpinColor(seed?: number | string): "blue" | "red" | "yellow" {
  if (seed !== undefined) {
    const num = typeof seed === "number" ? seed : seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return PUSHPIN_VARIANTS[Math.abs(num) % PUSHPIN_VARIANTS.length];
  }
  return PUSHPIN_VARIANTS[Math.floor(Math.random() * PUSHPIN_VARIANTS.length)];
}

interface PushpinIconProps {
  color?: PushpinColor;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function PushpinIcon({ color = "blue", size = 32, className = "", style = {} }: PushpinIconProps) {
  const normalized = normalizePushpinColor(color);
  const src = PUSHPIN_IMAGES[normalized] || PUSHPIN_IMAGES.blue;

  return (
    <img
      src={src}
      alt={`${normalized} pushpin`}
      width={size}
      height={size}
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: "contain",
        display: "inline-block",
        userSelect: "none",
        ...style,
      }}
    />
  );
}
