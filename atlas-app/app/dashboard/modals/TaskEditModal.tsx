"use client";

import React, { useState, useEffect } from "react";
import { TaskItem } from "../components/TodoList";
import { PushpinIcon, PUSHPIN_VARIANTS, getRandomPushpinColor } from "../components/PushpinIcon";
import { CustomLabelModal, CustomLabelItem } from "./CustomLabelModal";
import { CourseSelectModal } from "./CourseSelectModal";
import { DatePickerModal } from "./DatePickerModal";
import { TimePickerModal } from "./TimePickerModal";

interface CourseOption {
  id: string;
  course_name: string;
  course_code?: string;
  color?: string;
}

interface TaskEditModalProps {
  task?: TaskItem | null;
  courses?: CourseOption[];
  customLabels?: CustomLabelItem[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<TaskItem>) => Promise<void>;
  onAddCustomLabel?: (name: string) => Promise<void> | void;
  onDeleteCustomLabel?: (label: CustomLabelItem) => Promise<void> | void;
}

export function TaskEditModal({
  task,
  courses = [],
  customLabels = [],
  isOpen,
  onClose,
  onSave,
  onAddCustomLabel = () => {},
  onDeleteCustomLabel = () => {},
}: TaskEditModalProps) {
  const [title, setTitle] = useState("");
  const [labelType, setLabelType] = useState<"custom" | "course">("custom");
  const [selectedCustomLabel, setSelectedCustomLabel] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");

  const [hasDescription, setHasDescription] = useState(false);
  const [description, setDescription] = useState("");

  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("");

  const [color, setColor] = useState<string>("blue");
  const [saving, setSaving] = useState(false);

  // Submodals
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setLabelType(task.label_type || "custom");
      setSelectedCustomLabel((task as any).custom_label || "");
      setSelectedCourse(task.course || "");
      setHasDescription(!!task.description);
      setDescription(task.description || "");
      setHasDeadline(!!task.deadline_date);
      setDeadlineDate(task.deadline_date || new Date().toISOString().split("T")[0]);
      setDeadlineTime(task.deadline_time || "18:00");
      setColor(task.color || getRandomPushpinColor(task.id));
    } else {
      // New task defaults (toggles off by default)
      setTitle("");
      setLabelType("custom");
      setSelectedCustomLabel("");
      setSelectedCourse("");
      setHasDescription(false);
      setDescription("");
      setHasDeadline(false);
      setDeadlineDate(new Date().toISOString().split("T")[0]);
      setDeadlineTime("18:00");
      setColor(getRandomPushpinColor());
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const cyclePushpinColor = () => {
    const currentIndex = PUSHPIN_VARIANTS.indexOf(color as any);
    const nextIndex = (currentIndex + 1) % PUSHPIN_VARIANTS.length;
    setColor(PUSHPIN_VARIANTS[nextIndex]);
  };

  // Helper format date for display: e.g. "Aug 13, 2026"
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "Select date";
    try {
      const [y, m, d] = dateStr.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Helper format time for display: e.g. "6:00 P.M."
  const formatTimeDisplay = (timeStr: string) => {
    if (!timeStr) return "Select time";
    try {
      const [hStr, mStr] = timeStr.split(":");
      let h = parseInt(hStr, 10);
      const m = mStr || "00";
      const p = h >= 12 ? "P.M." : "A.M.";
      if (h === 0) h = 12;
      else if (h > 12) h -= 12;
      return `${h}:${m} ${p}`;
    } catch {
      return timeStr;
    }
  };

  const selectedCourseObj = courses.find((c) => c.id === selectedCourse);
  const selectedCourseName = selectedCourseObj
    ? `${selectedCourseObj.course_name}${selectedCourseObj.course_code ? ` (${selectedCourseObj.course_code})` : ""}`
    : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      await onSave({
        id: task?.id,
        title: title.trim(),
        label_type: labelType,
        custom_label: labelType === "custom" ? selectedCustomLabel : "",
        course: labelType === "course" ? selectedCourse || null : null,
        description: hasDescription ? description.trim() : "",
        deadline_date: hasDeadline ? deadlineDate || null : null,
        deadline_time: hasDeadline ? deadlineTime || null : null,
        notify_before_deadline: hasDeadline,
        color: color,
      } as any);
      onClose();
    } catch (err) {
      console.error("Failed to save task:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 50,
          padding: "16px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "540px",
            background: "#ffffff",
            borderRadius: "14px",
            padding: "28px 36px 32px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            position: "relative",
          }}
        >
          {/* Top Bar: Back Button & Title */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "#bae6fd",
                color: "#0369a1",
                border: "1.5px solid #7dd3fc",
                borderRadius: "16px",
                padding: "4px 16px",
                fontSize: "0.85rem",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              &gt; Back
            </button>

            <h2
              style={{
                fontFamily: "'EB Garamond', Georgia, serif",
                fontSize: "1.75rem",
                fontStyle: "italic",
                fontWeight: 500,
                color: "#111827",
                textAlign: "center",
                flex: 1,
                marginRight: "60px",
              }}
            >
              {task ? "Edit Task" : "New Task"}
            </h2>
          </div>

          {/* Center Pushpin PNG (Click to cycle colors) */}
          <div
            onClick={cyclePushpinColor}
            title="Click to cycle pushpin color"
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "18px",
              cursor: "pointer",
            }}
          >
            <PushpinIcon color={color} size={54} />
          </div>

          {/* Double Line Border */}
          <div style={{ marginBottom: "22px" }}>
            <div style={{ height: "1.5px", background: "#4b5563", marginBottom: "3px" }} />
            <div style={{ height: "1.5px", background: "#4b5563" }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Task Name Field */}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "#1f2937", marginBottom: "6px", fontFamily: "'Inter', sans-serif" }}>
                Task
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task name"
                style={{
                  width: "100%",
                  height: "40px",
                  padding: "0 14px",
                  borderRadius: "8px",
                  border: "1.5px solid #4b5563",
                  background: "#ffffff",
                  fontSize: "0.95rem",
                  fontFamily: "'EB Garamond', Georgia, serif",
                  color: "#111827",
                  outline: "none",
                }}
              />
            </div>

            {/* Label Type (Custom vs Course) */}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "#1f2937", marginBottom: "6px", fontFamily: "'Inter', sans-serif" }}>
                Label
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "8px" }}>
                <button
                  type="button"
                  onClick={() => setLabelType("custom")}
                  style={{
                    height: "38px",
                    borderRadius: "8px",
                    border: "1.5px solid #4b5563",
                    background: labelType === "custom" ? "#fbcfe8" : "#ffffff",
                    color: "#111827",
                    fontFamily: "'EB Garamond', Georgia, serif",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                  }}
                >
                  Custom
                </button>

                <button
                  type="button"
                  onClick={() => setLabelType("course")}
                  style={{
                    height: "38px",
                    borderRadius: "8px",
                    border: "1.5px solid #4b5563",
                    background: labelType === "course" ? "#fbcfe8" : "#ffffff",
                    color: "#111827",
                    fontFamily: "'EB Garamond', Georgia, serif",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                  }}
                >
                  Course
                </button>
              </div>

              {/* If Custom: Select a label box -> Opens CustomLabelModal */}
              {labelType === "custom" && (
                <div
                  onClick={() => setIsLabelModalOpen(true)}
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 14px",
                    borderRadius: "8px",
                    border: "1.5px solid #4b5563",
                    background: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'EB Garamond', Georgia, serif",
                      fontSize: "0.95rem",
                      color: selectedCustomLabel ? "#111827" : "#9ca3af",
                    }}
                  >
                    {selectedCustomLabel || "Select a label"}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>v</span>
                </div>
              )}

              {/* If Course: Select a course box -> Opens CourseSelectModal */}
              {labelType === "course" && (
                <div
                  onClick={() => setIsCourseModalOpen(true)}
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 14px",
                    borderRadius: "8px",
                    border: "1.5px solid #4b5563",
                    background: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'EB Garamond', Georgia, serif",
                      fontSize: "0.95rem",
                      color: selectedCourseName ? "#111827" : "#9ca3af",
                    }}
                  >
                    {selectedCourseName || "Select a registered course"}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>v</span>
                </div>
              )}
            </div>

            {/* Description Row + Green Toggle Switch */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <label style={{ fontSize: "0.85rem", color: "#1f2937", fontFamily: "'Inter', sans-serif" }}>
                  Description
                </label>

                {/* Description Toggle Switch */}
                <div
                  onClick={() => setHasDescription(!hasDescription)}
                  title="Toggle description"
                  style={{
                    width: "44px",
                    height: "24px",
                    borderRadius: "12px",
                    background: hasDescription ? "#4ade80" : "#e5e7eb",
                    border: "1.5px solid #16a34a",
                    padding: "2px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: hasDescription ? "flex-end" : "flex-start",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: "#ffffff",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                    }}
                  />
                </div>
              </div>

              {hasDescription && (
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="This is the description for this task"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1.5px solid #4b5563",
                    background: "#fff1f2",
                    fontSize: "0.95rem",
                    fontFamily: "'EB Garamond', Georgia, serif",
                    color: "#111827",
                    outline: "none",
                    resize: "none",
                  }}
                />
              )}
            </div>

            {/* Deadline Row + Green Toggle Switch */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <label style={{ fontSize: "0.85rem", color: "#1f2937", fontFamily: "'Inter', sans-serif" }}>
                  Deadline
                </label>

                {/* Green Toggle Switch */}
                <div
                  onClick={() => setHasDeadline(!hasDeadline)}
                  title="Toggle deadline notifications"
                  style={{
                    width: "44px",
                    height: "24px",
                    borderRadius: "12px",
                    background: hasDeadline ? "#4ade80" : "#e5e7eb",
                    border: "1.5px solid #16a34a",
                    padding: "2px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: hasDeadline ? "flex-end" : "flex-start",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: "#ffffff",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                    }}
                  />
                </div>
              </div>

              {/* Date and Time Buttons (Opens interactive Date and Time modals) */}
              {hasDeadline && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "6px" }}>
                    {/* Date Selector Box */}
                    <div
                      onClick={() => setIsDatePickerOpen(true)}
                      style={{
                        height: "40px",
                        padding: "0 14px",
                        borderRadius: "8px",
                        border: "1.5px solid #4b5563",
                        background: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontFamily: "'EB Garamond', Georgia, serif",
                        fontSize: "0.95rem",
                        color: "#111827",
                      }}
                    >
                      {formatDateDisplay(deadlineDate)}
                    </div>

                    {/* Time Selector Box */}
                    <div
                      onClick={() => setIsTimePickerOpen(true)}
                      style={{
                        height: "40px",
                        padding: "0 14px",
                        borderRadius: "8px",
                        border: "1.5px solid #4b5563",
                        background: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontFamily: "'EB Garamond', Georgia, serif",
                        fontSize: "0.95rem",
                        color: "#111827",
                      }}
                    >
                      {formatTimeDisplay(deadlineTime)}
                    </div>
                  </div>

                  <p style={{ fontSize: "0.725rem", color: "#9ca3af", fontFamily: "'Inter', sans-serif" }}>
                    You will be notified before the deadline
                  </p>
                </>
              )}
            </div>

            {/* Yellow Save Button */}
            <button
              type="submit"
              disabled={saving}
              style={{
                width: "100%",
                height: "42px",
                marginTop: "6px",
                background: "#facc15",
                color: "#111827",
                border: "1.5px solid #4b5563",
                borderRadius: "8px",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                transition: "background 0.15s ease",
              }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </form>
        </div>
      </div>

      {/* Submodal 1: Custom Label Modal */}
      <CustomLabelModal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        labels={customLabels}
        selectedLabel={selectedCustomLabel}
        onSelectLabel={(lbl) => setSelectedCustomLabel(lbl)}
        onAddLabel={onAddCustomLabel}
        onDeleteLabel={onDeleteCustomLabel}
      />

      {/* Submodal 2: Course Select Modal */}
      <CourseSelectModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        courses={courses}
        selectedCourseId={selectedCourse}
        onSelectCourse={(id) => setSelectedCourse(id)}
      />

      {/* Submodal 3: Date Picker Modal */}
      <DatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        selectedDate={deadlineDate}
        onSelectDate={(d) => setDeadlineDate(d)}
      />

      {/* Submodal 4: Time Picker Modal */}
      <TimePickerModal
        isOpen={isTimePickerOpen}
        onClose={() => setIsTimePickerOpen(false)}
        selectedTime={deadlineTime}
        onSelectTime={(t) => setDeadlineTime(t)}
      />
    </>
  );
}
