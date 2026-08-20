"use client";

import React, { useState, useEffect } from "react";
import { BackButton } from "@/app/src/components/BackButton";
import { FolderCard, FOLDER_THEMES, FolderColorKey } from "@/app/src/components/FolderCard";
import { CourseData } from "../components/CourseFolderGrid";

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "register" | "edit";
  course?: CourseData | null;
  onSave: (courseData: Partial<CourseData>) => Promise<void>;
  onDelete?: (courseId: string) => Promise<void>;
}

const DAYS_LIST = ["Mon", "Tue", "Wed", "Thurs", "Fri", "Sat", "Sun"];

export function CourseModal({
  isOpen,
  onClose,
  mode = "register",
  course,
  onSave,
  onDelete,
}: CourseModalProps) {
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [instructor, setInstructor] = useState("");
  const [roomLocation, setRoomLocation] = useState("");
  const [selectedColor, setSelectedColor] = useState<FolderColorKey>("purple");
  const [hasSchedule, setHasSchedule] = useState(true);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && course) {
        setCourseName(course.course_name || "");
        setCourseCode(course.course_code || "");
        setInstructor(course.instructor_name || "");
        setRoomLocation(course.room_location || "");
        setSelectedColor((course.color as FolderColorKey) || "purple");
        setHasSchedule(
          course.has_schedule !== undefined
            ? course.has_schedule
            : (course.schedule_days && course.schedule_days.length > 0) || true
        );
        setSelectedDays(course.schedule_days || []);
        setStartTime(course.schedule_start_time || "");
        setEndTime(course.schedule_end_time || "");
      } else {
        // Reset for Register mode
        setCourseName("");
        setCourseCode("");
        setInstructor("");
        setRoomLocation("");
        setSelectedColor("purple");
        setHasSchedule(true);
        setSelectedDays([]);
        setStartTime("");
        setEndTime("");
      }
      setErrorMsg("");
    }
  }, [isOpen, mode, course]);

  if (!isOpen) return null;

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim() && !courseCode.trim()) {
      setErrorMsg("Please enter a course name or course code.");
      return;
    }

    setSaving(true);
    setErrorMsg("");

    try {
      await onSave({
        id: course?.id,
        course_name: courseName.trim() || courseCode.trim(),
        course_code: courseCode.trim() || courseName.trim(),
        instructor_name: instructor.trim(),
        room_location: roomLocation.trim(),
        color: selectedColor,
        has_schedule: hasSchedule,
        schedule_days: selectedDays,
        schedule_start_time: startTime,
        schedule_end_time: endTime,
      });
      onClose();
    } catch (err: any) {
      console.error("Failed to save course:", err);
      setErrorMsg(err.message || "Failed to save course. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!course?.id || !onDelete) return;
    if (window.confirm(`Are you sure you want to delete "${course.course_name}"?`)) {
      setDeleting(true);
      try {
        await onDelete(course.id);
        onClose();
      } catch (err: any) {
        console.error("Failed to delete course:", err);
        setErrorMsg(err.message || "Failed to delete course.");
      } finally {
        setDeleting(false);
      }
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "16px",
        colorScheme: "light",
      }}
    >
      <style>{`
        .course-modal-box {
          color-scheme: light !important;
        }
        .course-input-field {
          background-color: #ffffff !important;
          background: #ffffff !important;
          color: #111827 !important;
          color-scheme: light !important;
          border: 1.5px solid #111827 !important;
          border-radius: 8px !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 0.88rem !important;
          font-weight: 400 !important;
          outline: none !important;
          box-sizing: border-box !important;
          transition: border-color 0.15s ease !important;
          -webkit-text-fill-color: #111827 !important;
        }
        .course-input-field::placeholder {
          color: #6b7280 !important;
          -webkit-text-fill-color: #6b7280 !important;
          font-weight: 400 !important;
          opacity: 0.9 !important;
        }
        .course-input-field::-webkit-input-placeholder {
          color: #6b7280 !important;
          -webkit-text-fill-color: #6b7280 !important;
          font-weight: 400 !important;
        }
        .course-input-field::-webkit-datetime-edit,
        .course-input-field::-webkit-datetime-edit-fields-wrapper,
        .course-input-field::-webkit-datetime-edit-text,
        .course-input-field::-webkit-datetime-edit-hour-field,
        .course-input-field::-webkit-datetime-edit-minute-field,
        .course-input-field::-webkit-datetime-edit-ampm-field {
          color: #111827 !important;
          -webkit-text-fill-color: #111827 !important;
          background-color: transparent !important;
        }
        .course-input-field::-webkit-calendar-picker-indicator {
          filter: invert(0) !important;
          opacity: 0.6 !important;
          cursor: pointer !important;
        }
      `}</style>

      <div
        className="course-modal-box"
        style={{
          width: "100%",
          maxWidth: "580px",
          backgroundColor: "#ffffff",
          color: "#111827",
          colorScheme: "light",
          borderRadius: "14px",
          border: "1.5px solid #111827",
          padding: "24px 32px 28px",
          boxShadow: "0 18px 36px rgba(0, 0, 0, 0.16)",
          maxHeight: "94vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        {/* Top Header: Back Button at top-left */}
        <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "4px" }}>
          <BackButton onClick={onClose} label="Back" variant="blue" />
        </div>

        {/* Centered Page Title */}
        <h2
          style={{
            textAlign: "center",
            fontFamily: "'EB Garamond', Georgia, serif",
            fontSize: "1.75rem",
            fontStyle: "italic",
            fontWeight: 400,
            color: "#111827",
            margin: "0 0 20px 0",
          }}
        >
          {mode === "register" ? "Register a course" : "Edit course"}
        </h2>

        {/* Center Folder Graphic Preview */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 0 24px",
          }}
        >
          {/* Folder Card Preview */}
          <div style={{ width: "120px", height: "86px", marginBottom: "22px" }}>
            <FolderCard
              color={selectedColor}
              courseName={courseName}
              courseCode={courseName}
              interactive={false}
              size="sm"
            />
          </div>

          {/* 7 Color Palette Swatches matching the folder assets */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
            }}
          >
            {FOLDER_THEMES.map((theme) => {
              const isSelected = selectedColor === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setSelectedColor(theme.id)}
                  title={theme.name}
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    backgroundColor: theme.colorHex,
                    border: isSelected ? "2px solid #111827" : "1px solid rgba(0,0,0,0.12)",
                    boxShadow: "none",
                    cursor: "pointer",
                    transform: isSelected ? "scale(1.18)" : "scale(1)",
                    transition: "all 0.15s ease",
                    padding: 0,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Double Divider Line */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ height: "1px", backgroundColor: "#374151", marginBottom: "2px" }} />
          <div style={{ height: "1px", backgroundColor: "#374151" }} />
        </div>

        {/* Form Fields */}
        <form onSubmit={handleFormSubmit}>
          {errorMsg && (
            <div
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                backgroundColor: "#fee2e2",
                color: "#b91c1c",
                fontSize: "0.85rem",
                marginBottom: "14px",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* Course Name Input */}
          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.84rem",
                fontWeight: 400,
                color: "#111827",
                marginBottom: "5px",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Course name
            </label>
            <input
              type="text"
              className="course-input-field"
              placeholder="Course code"
              value={courseName}
              onChange={(e) => {
                const val = e.target.value;
                setCourseName(val);
                setCourseCode(val);
              }}
              style={{
                width: "100%",
                height: "38px",
                padding: "0 12px",
                backgroundColor: "#ffffff",
                color: "#111827",
                colorScheme: "light",
              }}
            />
          </div>

          {/* Instructor Input */}
          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.84rem",
                fontWeight: 400,
                color: "#111827",
                marginBottom: "5px",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Instructor
            </label>
            <input
              type="text"
              className="course-input-field"
              placeholder="Instructor name"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              style={{
                width: "100%",
                height: "38px",
                padding: "0 12px",
                backgroundColor: "#ffffff",
                color: "#111827",
                colorScheme: "light",
              }}
            />
          </div>

          {/* Room Location Input */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.84rem",
                fontWeight: 400,
                color: "#111827",
                marginBottom: "5px",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Room location
            </label>
            <input
              type="text"
              className="course-input-field"
              placeholder="Room location"
              value={roomLocation}
              onChange={(e) => setRoomLocation(e.target.value)}
              style={{
                width: "100%",
                height: "38px",
                padding: "0 12px",
                backgroundColor: "#ffffff",
                color: "#111827",
                colorScheme: "light",
              }}
            />
          </div>

          {/* Assign Schedule Toggle & Settings */}
          <div style={{ marginBottom: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "0.84rem",
                  fontWeight: 400,
                  color: "#111827",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Assign schedule to this course
              </span>

              {/* iOS Style Toggle Switch */}
              <div
                onClick={() => setHasSchedule(!hasSchedule)}
                style={{
                  width: "46px",
                  height: "24px",
                  borderRadius: "12px",
                  border: "1.5px solid #111827",
                  backgroundColor: hasSchedule ? "#86efac" : "#ffffff",
                  position: "relative",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    backgroundColor: "#ffffff",
                    border: "1.5px solid #111827",
                    position: "absolute",
                    top: "1.5px",
                    left: hasSchedule ? "22px" : "2px",
                    transition: "left 0.2s ease",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
                  }}
                />
              </div>
            </div>

            {/* Days of Week Buttons */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "6px",
                marginBottom: "10px",
                opacity: hasSchedule ? 1 : 0.45,
                pointerEvents: hasSchedule ? "auto" : "none",
                transition: "opacity 0.15s ease",
              }}
            >
              {DAYS_LIST.map((day) => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    style={{
                      height: "34px",
                      borderRadius: "8px",
                      border: "1.5px solid #111827",
                      backgroundColor: isSelected ? "#111827" : "#ffffff",
                      color: isSelected ? "#ffffff" : "#111827",
                      fontSize: "0.82rem",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 400,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      padding: 0,
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Time Selection Inputs */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginBottom: "6px",
                opacity: hasSchedule ? 1 : 0.45,
                pointerEvents: hasSchedule ? "auto" : "none",
                transition: "opacity 0.15s ease",
              }}
            >
              <input
                type="text"
                className="course-input-field"
                placeholder="Start time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{
                  height: "36px",
                  padding: "0 12px",
                  textAlign: "center",
                  backgroundColor: "#ffffff",
                  color: "#111827",
                  colorScheme: "light",
                }}
              />
              <input
                type="text"
                className="course-input-field"
                placeholder="End time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{
                  height: "36px",
                  padding: "0 12px",
                  textAlign: "center",
                  backgroundColor: "#ffffff",
                  color: "#111827",
                  colorScheme: "light",
                }}
              />
            </div>

            {/* Notification Helper Text */}
            <p
              style={{
                fontSize: "0.72rem",
                color: "#6b7280",
                margin: "4px 0 0 0",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 300,
              }}
            >
              You will be notified an hour, then 15 minutes before the class.
            </p>
          </div>

          {/* Action Buttons: Save Button + Optional Delete */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
              marginTop: "20px",
            }}
          >
            {mode === "edit" && onDelete && (
              <button
                type="button"
                onClick={handleDeleteCourse}
                disabled={deleting || saving}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  border: "1.5px solid #ef4444",
                  backgroundColor: "#ffffff",
                  color: "#ef4444",
                  fontSize: "0.88rem",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 400,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            )}

            <button
              type="submit"
              disabled={saving || deleting}
              style={{
                padding: "8px 56px",
                borderRadius: "8px",
                border: "1.5px solid #111827",
                backgroundColor: "#ffe600",
                color: "#111827",
                fontSize: "0.92rem",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
                transition: "all 0.15s ease",
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
