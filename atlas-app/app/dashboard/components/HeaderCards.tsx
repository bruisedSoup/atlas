"use client";

import React from "react";
import { UserProfileCard } from "@/app/components/UserProfileCard";

interface HeaderCardsProps {
  userName?: string;
  avatarUrl?: string;
  bio?: string;
  onAvatarUpload?: (file: File) => void;
  onOpenProfile?: () => void;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  customLabels?: string[];
}

export function HeaderCards({
  onOpenProfile,
  activeFilter = "All",
  onFilterChange = () => {},
  customLabels = [],
}: HeaderCardsProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px",
        marginBottom: "24px",
      }}
    >
      {/* Left Card: Work Hub Filter */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          border: "1px solid #e5e7eb",
          padding: "24px 28px",
          boxShadow: "0 2px 8px -2px rgba(0,0,0,0.03)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: "155px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <line x1="8" y1="6" x2="16" y2="6" />
              <line x1="8" y1="10" x2="16" y2="10" />
              <line x1="8" y1="14" x2="16" y2="14" />
              <line x1="8" y1="18" x2="12" y2="18" />
            </svg>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.3rem", fontWeight: 600, color: "#111827", margin: 0 }}>
              Work Hub
            </h2>
          </div>
          <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: "0 0 12px 0", fontFamily: "'Inter', sans-serif" }}>
            Your active deliverables
          </p>

          {/* Underline separator */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
            <div style={{ height: "1px", background: "#e5e7eb", flex: 1 }} />
            <div style={{ height: "1px", background: "#e5e7eb", flex: 1 }} />
            <div style={{ height: "1px", background: "#e5e7eb", flex: 1 }} />
            <div style={{ height: "1px", background: "#e5e7eb", flex: 1 }} />
          </div>
        </div>

        {/* Filter chips */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => onFilterChange("All")}
            style={{
              height: "30px",
              padding: "0 16px",
              borderRadius: "6px",
              background: activeFilter === "All" ? "#18181b" : "#f4f4f5",
              color: activeFilter === "All" ? "#ffffff" : "#52525b",
              border: "none",
              fontSize: "0.825rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
          >
            All
          </button>
          {customLabels.map((lbl) => (
            <button
              key={lbl}
              onClick={() => onFilterChange(lbl)}
              style={{
                height: "30px",
                padding: "0 14px",
                borderRadius: "6px",
                background: activeFilter === lbl ? "#18181b" : "#f4f4f5",
                color: activeFilter === lbl ? "#ffffff" : "#52525b",
                border: "none",
                fontSize: "0.825rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "background 0.15s ease",
              }}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Right Card: Global Synchronized User Profile Card */}
      <UserProfileCard onOpenProfile={onOpenProfile} />
    </div>
  );
}
