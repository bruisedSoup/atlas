"use client";

import React from "react";
import { useUser } from "@/app/context/UserContext";

interface UserProfileCardProps {
  onOpenProfile?: () => void;
}

export function UserProfileCard({ onOpenProfile }: UserProfileCardProps) {
  const { userProfile, openProfileModal } = useUser();
  const handleOpen = onOpenProfile || openProfileModal;

  const userName = userProfile?.full_name || "Isabella Gonzales";
  const avatarUrl = userProfile?.avatar_url || "";
  const bio = userProfile?.bio || "";

  const today = new Date();
  const dateFormatted = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "14px",
        border: "1px solid #e5e7eb",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: "22px",
        boxShadow: "0 2px 8px -2px rgba(0,0,0,0.03)",
        minHeight: "155px",
      }}
    >
      {/* Profile Image Square (Opens Profile Modal) */}
      <div
        onClick={handleOpen}
        title="Click to view profile"
        style={{
          width: "88px",
          height: "88px",
          borderRadius: "12px",
          border: "1.5px solid #374151",
          background: "#fafafa",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          overflow: "hidden",
          flexShrink: 0,
          transition: "border-color 0.15s ease",
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={userName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ textAlign: "center", padding: "4px" }}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6b7280"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ margin: "0 auto" }}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span
              style={{
                fontSize: "0.65rem",
                color: "#6b7280",
                marginTop: "2px",
                display: "block",
              }}
            >
              upload image
            </span>
          </div>
        )}
      </div>

      {/* Greeting, Date, Double Line, Motto & View Profile Button */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2
          style={{
            fontFamily: "'EB Garamond', Georgia, serif",
            fontSize: "1.65rem",
            fontStyle: "italic",
            fontWeight: 500,
            color: "#111827",
            margin: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          Hello, {userName}
        </h2>

        <p
          style={{
            fontSize: "0.85rem",
            color: "#4b5563",
            margin: "3px 0 10px 0",
          }}
        >
          {dateFormatted}
        </p>

        {/* Double line border */}
        <div style={{ marginBottom: "10px" }}>
          <div
            style={{ height: "1.5px", background: "#4b5563", marginBottom: "2px" }}
          />
          <div style={{ height: "1.5px", background: "#4b5563" }} />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            onClick={handleOpen}
            style={{
              fontFamily: "'EB Garamond', Georgia, serif",
              fontSize: "1.05rem",
              fontStyle: "italic",
              color: bio ? "#111827" : "#9ca3af",
              cursor: "pointer",
            }}
          >
            {bio ? `“${bio}”` : "“Add user bio”"}
          </span>

          <button
            type="button"
            onClick={handleOpen}
            style={{
              borderRadius: "14px",
              border: "1.5px solid #111827",
              background: "#ffffff",
              padding: "2px 14px",
              fontSize: "0.75rem",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              color: "#111827",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              transition: "all 0.15s ease",
            }}
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}
