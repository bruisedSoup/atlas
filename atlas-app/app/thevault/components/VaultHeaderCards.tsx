"use client";

import React from "react";
import { UserProfileCard } from "@/app/components/UserProfileCard";

export type VaultTimeFilter = "All" | "This Week" | "This Month" | "This Semester";

interface VaultHeaderCardsProps {
  userName?: string;
  avatarUrl?: string;
  bio?: string;
  completedCount: number;
  activeTimeFilter: VaultTimeFilter;
  onTimeFilterChange: (filter: VaultTimeFilter) => void;
  onAvatarUpload?: (file: File) => void;
  onOpenProfile?: () => void;
}

export function VaultHeaderCards({
  completedCount = 0,
  activeTimeFilter = "All",
  onTimeFilterChange,
  onOpenProfile,
}: VaultHeaderCardsProps) {
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

      {/* Right Card: Global Synchronized User Profile Card */}
      <UserProfileCard onOpenProfile={onOpenProfile} />
    </div>
  );
}
