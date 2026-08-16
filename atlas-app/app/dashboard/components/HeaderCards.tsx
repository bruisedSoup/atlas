"use client";

import React, { useRef } from "react";

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
  userName = "Isabella Gonzales",
  avatarUrl = "",
  bio = "",
  onAvatarUpload,
  onOpenProfile = () => {},
  activeFilter = "All",
  onFilterChange = () => {},
  customLabels = [],
}: HeaderCardsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format today's date (e.g. "Sunday, August 16")
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
        {/* Profile Image / Upload Square */}
        <div
          onClick={() => fileInputRef.current?.click()}
          title="Click to upload profile photo"
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
            <img src={avatarUrl} alt={userName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ textAlign: "center", padding: "4px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto" }}>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span style={{ fontSize: "0.65rem", color: "#6b7280", marginTop: "2px", display: "block" }}>
                upload image
              </span>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: "none" }}
          />
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

          <p style={{ fontSize: "0.85rem", color: "#4b5563", margin: "3px 0 10px 0" }}>
            {dateFormatted}
          </p>

          {/* Double line border */}
          <div style={{ marginBottom: "10px" }}>
            <div style={{ height: "1.5px", background: "#4b5563", marginBottom: "2px" }} />
            <div style={{ height: "1.5px", background: "#4b5563" }} />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span
              onClick={onOpenProfile}
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
              onClick={onOpenProfile}
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
    </div>
  );
}
