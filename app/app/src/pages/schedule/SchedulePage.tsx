"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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

  const FULL_DAY_NAMES: Record<string, string> = {
    Mon: "Monday",
    Tue: "Tuesday",
    Wed: "Wednesday",
    Thu: "Thursday",
    Fri: "Friday",
    Sat: "Saturday",
    Sun: "Sunday",
  };

  // Helper score to keep the schedule block with the most complete details
  const getCompletenessScore = (b: ScheduleBlockItem) => {
    let score = 0;
    if (b.course_code && !["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].includes(b.course_code.toUpperCase())) {
      score += 10;
    }
    if (b.room_location && b.room_location.trim().length > 0) score += 5;
    if (b.instructor_name && b.instructor_name.trim().length > 0) score += 5;
    if (b.course) score += 3;
    if (b.title && b.course_name) score += 2;
    return score;
  };

  const normalizeTitle = (b: ScheduleBlockItem) => {
    return (b.title || b.course_name || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .trim();
  };

  const normalizeTime = (t: string) => {
    if (!t) return "";
    const parts = t.split(":");
    return `${parts[0] || "00"}:${parts[1] || "00"}`;
  };

  // Deduplicate schedule blocks, keeping the card with complete information
  const deduplicatedBlocks = React.useMemo(() => {
    const groups: Record<string, ScheduleBlockItem[]> = {};

    scheduleBlocks.forEach((b) => {
      const day = b.day_of_week;
      const start = normalizeTime(b.start_time);
      const end = normalizeTime(b.end_time);
      const titleNorm = normalizeTitle(b);

      const key = `${day}_${start}_${end}_${titleNorm}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push({ ...b });
    });

    return Object.values(groups).map((group) => {
      if (group.length === 1) return group[0];

      // Sort by completeness score descending
      group.sort((a, b) => getCompletenessScore(b) - getCompletenessScore(a));
      const best = { ...group[0] };

      // Merge any fields from other duplicates if missing in best
      for (let i = 1; i < group.length; i++) {
        const other = group[i];
        if (!best.course_code && other.course_code) best.course_code = other.course_code;
        if (!best.room_location && other.room_location) best.room_location = other.room_location;
        if (!best.instructor_name && other.instructor_name) best.instructor_name = other.instructor_name;
        if (!best.course_name && other.course_name) best.course_name = other.course_name;
      }
      return best;
    });
  }, [scheduleBlocks]);

  const daysFilter = ["All", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Filter schedule blocks by selected day
  const filteredBlocks = deduplicatedBlocks.filter((b) => {
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

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const dragDistance = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftStart.current = scrollRef.current.scrollLeft;
    dragDistance.current = 0;
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX.current;
    dragDistance.current += Math.abs(walk);
    scrollRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!scrollRef.current) return;
    if (e.deltaY !== 0 && e.deltaX === 0) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  const handleDayClick = (day: string) => {
    if (dragDistance.current > 5) return;
    setActiveDay(day);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
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
          height: "100vh",
          overflowY: "auto",
          padding: "24px 32px",
          width: "100%",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto", paddingBottom: "32px" }}>
        {/* Top Header Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
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
              minWidth: 0,
              overflow: "hidden",
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
                Weekly class & activity timetable ({deduplicatedBlocks.length} classes scheduled)
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
            <div
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onWheel={handleWheel}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                overflowX: "auto",
                paddingBottom: "2px",
                scrollbarWidth: "none",
                cursor: isDragging ? "grabbing" : "grab",
                userSelect: "none",
              }}
            >
              {daysFilter.map((day) => {
                const isActive = activeDay === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayClick(day)}
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
                      cursor: isDragging ? "grabbing" : "pointer",
                      boxShadow: isActive ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
                      transition: "all 0.15s ease",
                      flexShrink: 0,
                      whiteSpace: "nowrap",
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
                      {FULL_DAY_NAMES[dayName] || dayName}
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
        </div>
      </main>
    </div>
  );
}
