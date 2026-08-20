"use client";

import React, { useState } from "react";
import { Sidebar } from "@/app/src/components/Sidebar";
import { UserProfileCard } from "@/app/src/components/UserProfileCard";
import { useUser } from "@/app/context/UserContext";

export default function SettingsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"General" | "Notifications" | "Integrations" | "Account">("General");
  const { openProfileModal, userProfile } = useUser();

  const categories: ("General" | "Notifications" | "Integrations" | "Account")[] = [
    "General",
    "Notifications",
    "Integrations",
    "Account",
  ];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f4f5f7",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Sidebar with activeTab="settings" */}
      <Sidebar
        activeTab="settings"
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Page Content */}
      <main
        style={{
          flex: 1,
          padding: "24px 32px",
          maxWidth: "1280px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Top Header Section (Left Card + Right UserProfileCard) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            marginBottom: "24px",
          }}
        >
          {/* Left Card: Settings Header & Category Filter Pills */}
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
              {/* Header row with Settings Icon and Title */}
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
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
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
                  Settings
                </h2>
              </div>

              {/* Subtitle */}
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#6b7280",
                  margin: "0 0 12px 0",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Manage your preferences & profile
              </p>

              {/* Segmented Divider lines */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
                <div style={{ height: "1px", background: "#e5e7eb", flex: 1 }} />
                <div style={{ height: "1px", background: "#e5e7eb", flex: 1 }} />
                <div style={{ height: "1px", background: "#e5e7eb", flex: 1 }} />
                <div style={{ height: "1px", background: "#e5e7eb", flex: 1 }} />
              </div>
            </div>

            {/* Category Filter Chips */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      height: "32px",
                      padding: "0 16px",
                      borderRadius: "8px",
                      background: isActive ? "#18181b" : "#ffffff",
                      color: isActive ? "#ffffff" : "#111827",
                      border: isActive ? "1.5px solid #18181b" : "1.5px solid #374151",
                      fontSize: "0.85rem",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 500,
                      cursor: "pointer",
                      boxShadow: isActive ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Card: Synchronized User Profile Card */}
          <UserProfileCard />
        </div>

        {/* Main Content Card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            border: "1px solid #e5e7eb",
            padding: "28px 32px 36px",
            boxShadow: "0 2px 8px -2px rgba(0,0,0,0.03)",
            minHeight: "480px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ maxWidth: "600px" }}>
            <h3
              style={{
                fontFamily: "'EB Garamond', Georgia, serif",
                fontSize: "1.4rem",
                fontWeight: 600,
                color: "#111827",
                margin: "0 0 16px 0",
              }}
            >
              {activeCategory} Preferences
            </h3>

            {/* Preference Item: Profile Information */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 0",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 500, color: "#111827", fontSize: "0.95rem" }}>
                  User Profile
                </p>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "#6b7280" }}>
                  {userProfile?.full_name || "Manage your name, bio, and profile picture"}
                </p>
              </div>

              <button
                type="button"
                onClick={openProfileModal}
                style={{
                  padding: "6px 18px",
                  borderRadius: "8px",
                  border: "1.5px solid #111827",
                  background: "#ffffff",
                  color: "#111827",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Edit Profile
              </button>
            </div>

            {/* Preference Item: Desktop Notifications */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 0",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 500, color: "#111827", fontSize: "0.95rem" }}>
                  Deadline Notifications
                </p>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "#6b7280" }}>
                  Receive alerts before class starts and task deadlines approach
                </p>
              </div>

              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "12px",
                  background: "#dcfce7",
                  color: "#16a34a",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                }}
              >
                Enabled
              </span>
            </div>

            {/* Preference Item: Offline Sync */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 0",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 500, color: "#111827", fontSize: "0.95rem" }}>
                  Offline Storage & Sync
                </p>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "#6b7280" }}>
                  IndexedDB local cache enabled for 0ms instant loading
                </p>
              </div>

              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "12px",
                  background: "#dbeafe",
                  color: "#1d4ed8",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                }}
              >
                Active
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
