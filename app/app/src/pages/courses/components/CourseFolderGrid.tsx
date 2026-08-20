"use client";

import React, { useState } from "react";
import { FolderCard } from "@/app/src/components/FolderCard";
import { EmptyState } from "@/app/src/components/EmptyState";

export interface CourseData {
  id: string;
  course_name: string;
  course_code?: string;
  instructor_name?: string;
  room_location?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
  // Optional schedule fields
  schedule_days?: string[];
  schedule_start_time?: string;
  schedule_end_time?: string;
  has_schedule?: boolean;
}

interface CourseFolderGridProps {
  courses: CourseData[];
  onCourseClick: (course: CourseData) => void;
  onAddNewCourse: () => void;
  loading?: boolean;
}

export function CourseFolderGrid({
  courses = [],
  onCourseClick,
  onAddNewCourse,
  loading = false,
}: CourseFolderGridProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = courses.filter((course) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      course.course_name.toLowerCase().includes(q) ||
      (course.course_code && course.course_code.toLowerCase().includes(q)) ||
      (course.instructor_name && course.instructor_name.toLowerCase().includes(q)) ||
      (course.room_location && course.room_location.toLowerCase().includes(q))
    );
  });

  return (
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
      {/* Search & Action Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          marginBottom: "32px",
        }}
      >
        {/* Search Input Box */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            height: "42px",
            border: "1.5px solid #374151",
            borderRadius: "8px",
            padding: "0 14px",
            background: "#ffffff",
            gap: "10px",
            transition: "border-color 0.15s ease",
          }}
        >
          {/* Search Icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4b5563"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Find a course"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "0.9rem",
              fontFamily: "'Inter', sans-serif",
              color: "#111827",
              background: "transparent",
            }}
          />

          {/* Clear or Menu Icon */}
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              style={{
                border: "none",
                background: "transparent",
                color: "#9ca3af",
                cursor: "pointer",
                padding: "2px",
                fontSize: "0.9rem",
              }}
            >
              ✕
            </button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", color: "#374151" }}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </div>
          )}
        </div>

        {/* Plus Button */}
        <button
          type="button"
          onClick={onAddNewCourse}
          title="Register a new course"
          style={{
            width: "48px",
            height: "42px",
            borderRadius: "21px",
            background: "#111827",
            color: "#ffffff",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            transition: "transform 0.15s ease, background 0.15s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.background = "#27272a";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.background = "#111827";
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* Grid of Course Folders */}
      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
            gap: "28px 24px",
          }}
        >
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              style={{
                width: "100%",
                maxWidth: "230px",
                aspectRatio: "1.42 / 1",
                borderRadius: "14px",
                background: "#f3f4f6",
                animation: "pulse 1.5s infinite",
              }}
            />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          title={
            searchQuery
              ? `No matching courses for "${searchQuery}"`
              : "No courses registered yet!"
          }
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
            gap: "32px 24px",
            justifyItems: "center",
          }}
        >
          {filteredCourses.map((course) => (
            <FolderCard
              key={course.id}
              color={course.color || "purple"}
              courseName={course.course_name}
              courseCode={course.course_code || course.course_name}
              instructor={course.instructor_name}
              room={course.room_location}
              onClick={() => onCourseClick(course)}
              size="md"
            />
          ))}
        </div>
      )}
    </div>
  );
}
