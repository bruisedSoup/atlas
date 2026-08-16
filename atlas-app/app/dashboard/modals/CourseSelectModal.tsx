"use client";

import React, { useState, useEffect } from "react";

export interface CourseOption {
  id: string;
  course_name: string;
  course_code?: string;
  color?: string;
}

interface CourseSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: CourseOption[];
  selectedCourseId: string;
  onSelectCourse: (courseId: string) => void;
}

export function CourseSelectModal({
  isOpen,
  onClose,
  courses = [],
  selectedCourseId = "",
  onSelectCourse,
}: CourseSelectModalProps) {
  const [currentSelected, setCurrentSelected] = useState(selectedCourseId);

  useEffect(() => {
    setCurrentSelected(selectedCourseId);
  }, [selectedCourseId, isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onSelectCourse(currentSelected);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 70,
        padding: "16px",
      }}
    >
      {/* Outer Thick Yellow Glow Frame */}
      <div
        style={{
          width: "100%",
          maxWidth: "360px",
          backgroundColor: "#fef08a", // Light yellow outer glow
          borderRadius: "36px",
          padding: "14px",
          boxShadow: "0 20px 35px rgba(0,0,0,0.18)",
        }}
      >
        {/* Inner Card with Pink Dashed Border */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "24px",
            padding: "20px 22px 24px",
            border: "1.5px dashed #f472b6",
          }}
        >
          {/* Header Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "14px",
            }}
          >
            <span
              style={{
                fontFamily: "'EB Garamond', Georgia, serif",
                fontSize: "1.25rem",
                fontWeight: 600,
                fontStyle: "italic",
                color: "#111827",
              }}
            >
              Courses
            </span>

            <button
              type="button"
              onClick={handleConfirm}
              style={{
                background: "#ffffff",
                border: "1.5px solid #111827",
                borderRadius: "20px",
                padding: "4px 20px",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#111827",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                transition: "all 0.15s ease",
              }}
            >
              Confirm
            </button>
          </div>

          {/* Solid Divider Line */}
          <div style={{ height: "1.5px", backgroundColor: "#374151", marginBottom: "8px" }} />

          {/* Dynamic Courses List */}
          <div
            style={{
              maxHeight: "240px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {courses.length === 0 ? (
              <div
                style={{
                  padding: "28px 8px",
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: "0.875rem",
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: 1.5,
                }}
              >
                No registered courses yet.
                <br />
                You can add courses in the Courses tab.
              </div>
            ) : (
              courses.map((course) => {
                const isSelected = currentSelected === course.id;

                return (
                  <div
                    key={course.id}
                    onClick={() => setCurrentSelected(course.id)}
                    style={{
                      borderBottom: "1.5px dashed #93c5fd", // Light blue dashed separator
                      padding: "12px 2px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      backgroundColor: isSelected ? "#eff6ff" : "transparent",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "0.95rem",
                          fontWeight: isSelected ? 600 : 500,
                          color: isSelected ? "#1d4ed8" : "#111827",
                          display: "block",
                        }}
                      >
                        {course.course_name}
                      </span>
                      {course.course_code && (
                        <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                          {course.course_code}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <span style={{ color: "#1d4ed8", fontSize: "0.95rem", fontWeight: 700 }}>
                        ✓
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
