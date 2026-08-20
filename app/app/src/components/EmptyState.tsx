"use client";

import React from "react";

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  imageSrc?: string;
  imageAlt?: string;
  imageWidth?: number | string;
  style?: React.CSSProperties;
  className?: string;
}

export function EmptyState({
  title,
  subtitle,
  imageSrc = "/empty.png",
  imageAlt = "No items",
  imageWidth = "125px",
  style = {},
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={className}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "54px 16px",
        textAlign: "center",
        ...style,
      }}
    >
      <img
        src={imageSrc}
        alt={imageAlt}
        style={{
          width: typeof imageWidth === "number" ? `${imageWidth}px` : imageWidth,
          height: "auto",
          marginBottom: "16px",
          objectFit: "contain",
          userSelect: "none",
          pointerEvents: "none",
        }}
      />
      <p
        style={{
          fontFamily: "'EB Garamond', Georgia, serif",
          fontSize: "1.3rem",
          fontWeight: 500,
          color: "#1f2937",
          margin: 0,
        }}
      >
        {title}
      </p>
      {subtitle && (
        <p
          style={{
            fontSize: "0.875rem",
            color: "#6b7280",
            margin: "8px 0 0 0",
            fontFamily: "'Inter', sans-serif",
            maxWidth: "380px",
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
