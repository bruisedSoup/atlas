"use client";

import React, { useState, useRef } from "react";
import { Sidebar } from "@/app/src/components/Sidebar";
import { UserProfileCard } from "@/app/src/components/UserProfileCard";
import { EmptyState } from "@/app/src/components/EmptyState";

interface CalendarPageProps {
  onTabChange?: (tab: string) => void;
}

export default function CalendarPage({ onTabChange }: CalendarPageProps = {}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<"Month" | "Week" | "Day" | "Agenda">("Month");
  const [currentDate, setCurrentDate] = useState(new Date());

  const views: ("Month" | "Week" | "Day" | "Agenda")[] = ["Month", "Week", "Day", "Agenda"];

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = monthNames[month];

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

  const handleViewClick = (v: string) => {
    if (dragDistance.current > 5) return;
    setActiveView(v as "Month" | "Week" | "Day" | "Agenda");
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
        activeTab="calendar"
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
          {/* Left Card: Calendar Header & View Filters */}
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
              {/* Header row with Calendar Icon and Title */}
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
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
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
                  Calendar
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
                Your academic schedule & deadlines
              </p>

              {/* Segmented Divider lines */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
                <div style={{ height: "1px", background: "#e5e7eb", flex: 1 }} />
                <div style={{ height: "1px", background: "#e5e7eb", flex: 1 }} />
                <div style={{ height: "1px", background: "#e5e7eb", flex: 1 }} />
                <div style={{ height: "1px", background: "#e5e7eb", flex: 1 }} />
              </div>
            </div>

            {/* View Filter Chips */}
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
              {views.map((v) => {
                const isActive = activeView === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => handleViewClick(v)}
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
                      cursor: isDragging ? "grabbing" : "pointer",
                      boxShadow: isActive ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
                      transition: "all 0.15s ease",
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {v}
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
            padding: "24px 28px 36px",
            boxShadow: "0 2px 8px -2px rgba(0,0,0,0.03)",
            minHeight: "480px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Calendar Month Navigation Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "24px",
              paddingBottom: "16px",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <h3
                style={{
                  fontFamily: "'EB Garamond', Georgia, serif",
                  fontSize: "1.45rem",
                  fontWeight: 600,
                  color: "#111827",
                  margin: 0,
                }}
              >
                {monthName} {year}
              </h3>
              <button
                type="button"
                onClick={goToToday}
                style={{
                  padding: "4px 14px",
                  borderRadius: "6px",
                  border: "1.5px solid #374151",
                  background: "#ffffff",
                  color: "#111827",
                  fontSize: "0.8rem",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Today
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                onClick={prevMonth}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "8px",
                  border: "1.5px solid #374151",
                  background: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#111827",
                }}
              >
                &lt;
              </button>
              <button
                type="button"
                onClick={nextMonth}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "8px",
                  border: "1.5px solid #374151",
                  background: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#111827",
                }}
              >
                &gt;
              </button>
            </div>
          </div>

          {/* Calendar Content View */}
          <EmptyState
            title="No events scheduled for this month"
            subtitle="Synced deadlines, course meetings, and tasks will automatically populate here."
          />
        </div>
        </div>
      </main>
    </div>
  );
}
