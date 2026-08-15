"use client";

import React, { useRef } from "react";

interface HeaderCardsProps {
  userName?: string;
  avatarUrl?: string;
  onAvatarUpload?: (file: File) => void;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  customLabels?: string[];
}

export function HeaderCards({
  userName = "User Name",
  avatarUrl = "",
  onAvatarUpload,
  activeFilter = "All",
  onFilterChange = () => {},
  customLabels = [],
}: HeaderCardsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format today's date (e.g. "Thursday, August 13")
  const today = new Date();
  const dateFormatted = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onAvatarUpload) {
      onAvatarUpload(e.target.files[0]);
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
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
          minHeight: "150px",
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
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.25rem", fontWeight: 600, color: "#111827" }}>
              Work Hub
            </h2>
          </div>
          <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginBottom: "16px" }}>
            Your active deliverables
          </p>

          {/* Underline separator */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
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
              padding: "4px 16px",
              borderRadius: "6px",
              background: activeFilter === "All" ? "#18181b" : "#f4f4f5",
              color: activeFilter === "All" ? "#ffffff" : "#52525b",
              border: "none",
              fontSize: "0.8rem",
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
                padding: "4px 14px",
                borderRadius: "6px",
                background: activeFilter === lbl ? "#18181b" : "#f4f4f5",
                color: activeFilter === lbl ? "#ffffff" : "#52525b",
                border: "none",
                fontSize: "0.8rem",
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

      {/* Right Card: User Greeting */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          border: "1px solid #e5e7eb",
          padding: "24px 28px",
          boxShadow: "0 2px 8px -2px rgba(0,0,0,0.03)",
          display: "flex",
          alignItems: "center",
          gap: "24px",
          minHeight: "150px",
        }}
      >
        {/* Profile Image / Upload Square */}
        <div
          onClick={() => fileInputRef.current?.click()}
          title="Click to upload profile photo"
          style={{
            width: "96px",
            height: "96px",
            borderRadius: "12px",
            border: "1px solid #d1d5db",
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
            <img src={avatarUrl} alt={userName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span style={{ fontSize: "0.65rem", color: "#9ca3af", marginTop: "4px" }}>upload image</span>
            </>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: "none" }}
          />
        </div>

        {/* Greeting and Date */}
        <div>
          <h1
            style={{
              fontFamily: "'EB Garamond', Georgia, serif",
              fontSize: "1.75rem",
              fontStyle: "italic",
              fontWeight: 500,
              color: "#111827",
              lineHeight: 1.2,
              marginBottom: "6px",
            }}
          >
            Hello, {userName}
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: 400 }}>
            {dateFormatted}
          </p>
        </div>
      </div>
    </div>
  );
}
