"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/app/src/components/Sidebar";
import { UserProfileCard } from "@/app/src/components/UserProfileCard";
import { EmptyState } from "@/app/src/components/EmptyState";
import { useUser } from "@/app/context/UserContext";

export interface ScheduleBlockItem {
  id: string;
  course?: string;
  course_name?: string;
  course_code?: string;
  instructor_name?: string;
  room_location?: string;
  title: string;
  day_of_week: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  start_time: string;
  end_time: string;
  color?: string;
  notify_minutes_before?: number;
  source?: string;
}

interface SchedulePageProps {
  onTabChange?: (tab: string) => void;
}

const DAYS_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function SchedulePage({ onTabChange }: SchedulePageProps = {}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeDay, setActiveDay] = useState("All");
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlockItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { accessToken, getFreshToken } = useUser();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchSchedule = useCallback(async (tokenOverride?: string) => {
    const token = tokenOverride || (await getFreshToken());
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/schedule/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const items: ScheduleBlockItem[] = Array.isArray(data) ? data : data.results || [];
        setScheduleBlocks(items);
      }
    } catch (err) {
      console.warn("Failed to fetch schedule blocks:", err);
    } finally {
      setLoading(false);
    }
  }, [getFreshToken, apiUrl]);

  useEffect(() => {
    if (accessToken) {
      fetchSchedule();
    } else {
      const timer = setTimeout(() => fetchSchedule(), 500);
      return () => clearTimeout(timer);
    }
  }, [accessToken, fetchSchedule]);

  const daysFilter = ["All", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Filter schedule blocks by selected day
  const filteredBlocks = scheduleBlocks.filter((b) => {
    if (activeDay === "All") return true;
    return b.day_of_week === activeDay;
  });

  // Helper format 24h time to 12h AM/PM
  const formatTime12h = (timeStr: string) => {
    if (!timeStr) return "";
    try {
      const [hStr, mStr] = timeStr.split(":");
      let h = parseInt(hStr, 10);
      const m = mStr || "00";
      const p = h >= 12 ? "PM" : "AM";
      if (h === 0) h = 12;
      else if (h > 12) h -= 12;
      return `${h}:${m} ${p}`;
    } catch {
      return timeStr;
    }
  };

  const getThemeColor = (colorName?: string) => {
    const map: Record<string, { bg: string; border: string; text: string }> = {
      purple: { bg: "#f3e8ff", border: "#c084fc", text: "#6b21a8" },
      pink: { bg: "#fce7f3", border: "#f472b6", text: "#9d174d" },
      blue: { bg: "#e0f2fe", border: "#38bdf8", text: "#0369a1" },
      matcha: { bg: "#ecfccb", border: "#a3e635", text: "#3f6212" },
      yellow: { bg: "#fef9c3", border: "#facc15", text: "#854d0e" },
      orange: { bg: "#ffedd5", border: "#fb923c", text: "#9a3412" },
      white: { bg: "#f3f4f6", border: "#d1d5db", text: "#1f2937" },
    };
    return map[colorName || "purple"] || map.purple;
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f4f5f7",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab="schedule"
        onTabChange={onTabChange}
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
        {/* Top Header Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            marginBottom: "24px",
          }}
        >
          {/* Left Card: Schedule Header & Day Filter Pills */}
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
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 3v18" />
                  <path d="M15 3v18" />
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
                  Schedule
                </h2>
              </div>

              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#6b7280",
                  margin: "0 0 12px 0",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Weekly class & activity timetable ({scheduleBlocks.length} classes scheduled)
              </p>

              {/* Segmented Divider lines */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
                <div style={{ height: "1px", background: "#e5e7eb", flex: 1 }} />
                <div style={{ height: "1px", background: "#e5e7eb", flex: 1 }} />
                <div style={{ height: "1px", background: "#e5e7eb", flex: 1 }} />
                <div style={{ height: "1px", background: "#e5e7eb", flex: 1 }} />
              </div>
            </div>

            {/* Day Filter Chips */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              {daysFilter.map((day) => {
                const isActive = activeDay === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setActiveDay(day)}
                    style={{
                      height: "32px",
                      padding: "0 14px",
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
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Card: User Profile */}
          <UserProfileCard />
        </div>

        {/* Main Schedule Container */}
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
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px", color: "#6b7280" }}>
              Loading schedule timetable...
            </div>
          ) : filteredBlocks.length === 0 ? (
            <EmptyState
              title={activeDay === "All" ? "No schedule blocks yet!" : `No classes scheduled on ${activeDay}`}
              subtitle="Classes and study blocks assigned to your courses (or imported via OCR scan) will appear here."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {DAYS_ORDER.filter((d) => activeDay === "All" || activeDay === d).map((dayName) => {
                const dayBlocks = filteredBlocks.filter((b) => b.day_of_week === dayName);
                if (dayBlocks.length === 0 && activeDay === "All") return null;

                return (
                  <div key={dayName} style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "16px" }}>
                    <h3
                      style={{
                        fontFamily: "'EB Garamond', Georgia, serif",
                        fontSize: "1.35rem",
                        fontWeight: 600,
                        color: "#111827",
                        margin: "0 0 12px 0",
                      }}
                    >
                      {dayName}day
                    </h3>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
                      {dayBlocks.map((block) => {
                        const theme = getThemeColor(block.color);
                        return (
                          <div
                            key={block.id}
                            style={{
                              backgroundColor: theme.bg,
                              borderLeft: `4px solid ${theme.border}`,
                              borderRadius: "10px",
                              padding: "12px 16px",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: theme.text, textTransform: "uppercase" }}>
                                {block.course_code || block.day_of_week}
                              </span>
                              <span style={{ fontSize: "0.8rem", color: "#4b5563", fontWeight: 500 }}>
                                {formatTime12h(block.start_time)} – {formatTime12h(block.end_time)}
                              </span>
                            </div>

                            <h4 style={{ margin: "0 0 6px 0", fontSize: "0.95rem", fontWeight: 600, color: "#111827" }}>
                              {block.title || block.course_name}
                            </h4>

                            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.8rem", color: "#6b7280" }}>
                              {block.room_location && <span>📍 {block.room_location}</span>}
                              {block.instructor_name && <span>👤 {block.instructor_name}</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
