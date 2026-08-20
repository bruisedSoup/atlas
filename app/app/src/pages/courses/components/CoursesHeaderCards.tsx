"use client";

import React from "react";
import { UserProfileCard } from "@/app/src/components/UserProfileCard";

export interface CourseFilterItem {
  id: string;
  course_name: string;
  course_code?: string;
}

interface CoursesHeaderCardsProps {
  coursesCount: number;
  courses: CourseFilterItem[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onOpenProfile?: () => void;
}

export function CoursesHeaderCards({
  coursesCount = 0,
  courses = [],
  activeFilter = "All",
  onFilterChange,
  onOpenProfile,
}: CoursesHeaderCardsProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px",
        marginBottom: "24px",
      }}
    >
      {/* Left Card: Courses Overview & Filter Pills */}
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
          {/* Header row with Folder icon and Title */}
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
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
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
              Courses
            </h2>
          </div>

          {/* Subtitle: Courses count */}
          <p
            style={{
              fontSize: "0.85rem",
              color: "#6b7280",
              margin: "0 0 12px 0",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {coursesCount} Course{coursesCount === 1 ? "" : "s"} registered
          </p>

          {/* Segmented Divider lines */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
            <div style={{ height: "1px", background: "#e5e7eb", flex: 1 }} />
            <div style={{ height: "1px", background: "#e5e7eb", flex: 1 }} />
            <div style={{ height: "1px", background: "#e5e7eb", flex: 1 }} />
            <div style={{ height: "1px", background: "#e5e7eb", flex: 1 }} />
          </div>
        </div>

        {/* Filter Pills */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
            overflowX: "auto",
            paddingBottom: "2px",
          }}
        >
          <button
            type="button"
            onClick={() => onFilterChange("All")}
            style={{
              height: "32px",
              padding: "0 18px",
              borderRadius: "8px",
              background: activeFilter === "All" ? "#18181b" : "#ffffff",
              color: activeFilter === "All" ? "#ffffff" : "#111827",
              border: activeFilter === "All" ? "1.5px solid #18181b" : "1.5px solid #374151",
              fontSize: "0.85rem",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              cursor: "pointer",
              boxShadow: activeFilter === "All" ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.15s ease",
              flexShrink: 0,
            }}
          >
            All
          </button>

          {courses.map((course) => {
            const label = course.course_code || course.course_name;
            const isSelected = activeFilter === course.id;

            return (
              <button
                key={course.id}
                type="button"
                onClick={() => onFilterChange(course.id)}
                title={course.course_name}
                style={{
                  height: "32px",
                  padding: "0 14px",
                  borderRadius: "8px",
                  background: isSelected ? "#18181b" : "#ffffff",
                  color: isSelected ? "#ffffff" : "#111827",
                  border: isSelected ? "1.5px solid #18181b" : "1.5px solid #374151",
                  fontSize: "0.85rem",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  cursor: "pointer",
                  maxWidth: "140px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  boxShadow: isSelected ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
                  transition: "all 0.15s ease",
                  flexShrink: 0,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Card: Synchronized User Profile Card */}
      <UserProfileCard onOpenProfile={onOpenProfile} />
    </div>
  );
}
