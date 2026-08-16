"use client";

import React, { useRef } from "react";

export type VaultTimeFilter = "All" | "This Week" | "This Month" | "This Semester";

interface VaultHeaderCardsProps {
  userName?: string;
  avatarUrl?: string;
  completedCount: number;
  activeTimeFilter: VaultTimeFilter;
  onTimeFilterChange: (filter: VaultTimeFilter) => void;
  onAvatarUpload?: (file: File) => void;
}

export function VaultHeaderCards({
  userName = "Isabella Gonzales",
  avatarUrl = "",
  completedCount = 0,
  activeTimeFilter = "All",
  onTimeFilterChange,
  onAvatarUpload,
}: VaultHeaderCardsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onAvatarUpload) {
      onAvatarUpload(e.target.files[0]);
    }
  };

  const timeFilters: VaultTimeFilter[] = ["All", "This Week", "This Month", "This Semester"];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px",
        marginBottom: "24px",
      }}
    >
      {/* Left Card: The Vault Info & Time Filters */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          border: "1px solid #e5e7eb",
          padding: "24px 28px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "0 2px 8px -2px rgba(0,0,0,0.03)",
          minHeight: "155px",
        }}
      >
        <div>
          {/* Header row with Vault Box icon and Title */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#111827"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              <circle cx="12" cy="14" r="2" />
              <path d="M12 16v2" />
            </svg>
            <h2
              style={{
                fontFamily: "'EB Garamond', Georgia, serif",
                fontSize: "1.55rem",
                fontWeight: 600,
                color: "#111827",
                margin: 0,
              }}
            >
              The Vault
            </h2>
          </div>

          {/* Subtitle: Completed tasks count */}
          <p
            style={{
              fontSize: "0.85rem",
              color: "#6b7280",
              margin: "0 0 12px 0",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {completedCount} Completed task{completedCount === 1 ? "" : "s"}
          </p>

          {/* Divider line */}
          <div style={{ height: "1px", background: "#f3f4f6", marginBottom: "14px" }} />
        </div>

        {/* Time Filter Chips */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {timeFilters.map((filter) => {
            const isActive = activeTimeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => onTimeFilterChange(filter)}
                style={{
                  height: "32px",
                  padding: "0 14px",
                  borderRadius: "8px",
                  border: isActive ? "1.5px solid #111827" : "1.5px solid #374151",
                  background: isActive ? "#111827" : "#ffffff",
                  color: isActive ? "#ffffff" : "#111827",
                  fontSize: "0.85rem",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  cursor: "pointer",
                  boxShadow: isActive ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Card: User Greeting Profile matching mockup */}
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
        {/* Avatar Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          title="Click to upload profile photo"
          style={{
            width: "88px",
            height: "88px",
            borderRadius: "12px",
            border: "1.5px solid #374151",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            background: "#ffffff",
            flexShrink: 0,
            overflow: "hidden",
            position: "relative",
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
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto" }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span style={{ fontSize: "0.65rem", color: "#6b7280", display: "block", marginTop: "2px" }}>
                upload image
              </span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>

        {/* User Info & Motto */}
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

          <p style={{ fontSize: "0.85rem", color: "#4b5563", margin: "3px 0 10px 0" }}>
            {todayStr}
          </p>

          {/* Double line border */}
          <div style={{ marginBottom: "10px" }}>
            <div style={{ height: "1.5px", background: "#4b5563", marginBottom: "2px" }} />
            <div style={{ height: "1.5px", background: "#4b5563" }} />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span
              style={{
                fontFamily: "'EB Garamond', Georgia, serif",
                fontSize: "1.05rem",
                fontStyle: "italic",
                color: "#111827",
              }}
            >
              “Carpi diem”
            </span>

            <button
              type="button"
              style={{
                borderRadius: "14px",
                border: "1px solid #111827",
                background: "#ffffff",
                padding: "2px 12px",
                fontSize: "0.75rem",
                fontFamily: "'Inter', sans-serif",
                color: "#111827",
                cursor: "pointer",
              }}
            >
              View Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
