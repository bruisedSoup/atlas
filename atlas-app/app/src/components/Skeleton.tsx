"use client";

import React from "react";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
  className?: string;
}

export function Skeleton({
  width = "100%",
  height = "16px",
  borderRadius = "6px",
  style = {},
  className = "",
}: SkeletonProps) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        borderRadius: typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius,
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

export function TaskItemSkeleton({ isVault = false }: { isVault?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 20px",
        borderRadius: "10px",
        border: "1.5px solid #f1f5f9",
        background: "#ffffff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        gap: "16px",
      }}
    >
      {/* Left: Pushpin circle + Title + Deadline Badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: 0 }}>
        {/* Pushpin Skeleton */}
        <Skeleton width={26} height={26} borderRadius="50%" />

        {/* Title Bar & Subtitle */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, maxWidth: "340px" }}>
          <Skeleton width="85%" height={16} borderRadius={4} />
          <Skeleton width="45%" height={12} borderRadius={4} />
        </div>

        {/* Date / Label Pill Skeleton */}
        <Skeleton width={80} height={22} borderRadius={6} />
      </div>

      {/* Right: Checkbox ring or Restore button Skeleton */}
      {isVault ? (
        <Skeleton width={88} height={28} borderRadius={6} />
      ) : (
        <Skeleton width={22} height={22} borderRadius="50%" />
      )}
    </div>
  );
}

export function TodoListSkeleton({ count = 4, isVault = false }: { count?: number; isVault?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
      {Array.from({ length: count }).map((_, idx) => (
        <TaskItemSkeleton key={idx} isVault={isVault} />
      ))}
    </div>
  );
}
