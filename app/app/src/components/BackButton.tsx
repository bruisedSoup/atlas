"use client";

import React from "react";

interface BackButtonProps {
  onClick?: () => void;
  label?: string;
  variant?: "blue" | "default" | "dark";
  className?: string;
  style?: React.CSSProperties;
  showIcon?: boolean;
}

export function BackButton({
  onClick,
  label = "Back",
  variant = "blue",
  className = "",
  style = {},
  showIcon = true,
}: BackButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "blue":
        return {
          background: "#dbeafe",
          borderColor: "#93c5fd",
          color: "#1e3a8a",
        };
      case "dark":
        return {
          background: "#18181b",
          borderColor: "#18181b",
          color: "#ffffff",
        };
      case "default":
      default:
        return {
          background: "#ffffff",
          borderColor: "#d1d5db",
          color: "#374151",
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        height: "32px",
        padding: "0 16px",
        borderRadius: "9999px",
        border: `1.5px solid ${variantStyles.borderColor}`,
        background: variantStyles.background,
        color: variantStyles.color,
        fontSize: "0.85rem",
        fontFamily: "'Inter', sans-serif",
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
        transition: "all 0.15s ease",
        userSelect: "none",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "0.85";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {showIcon && (
        <span style={{ fontSize: "0.95rem", lineHeight: 1, fontWeight: 700 }}>
          &gt;
        </span>
      )}
      <span>{label}</span>
    </button>
  );
}
