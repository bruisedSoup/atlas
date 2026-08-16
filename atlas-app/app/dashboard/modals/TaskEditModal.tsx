"use client";

import React, { useState, useEffect } from "react";
import { TaskItem } from "../components/TodoList";
import { PushpinIcon, PUSHPIN_VARIANTS, getRandomPushpinColor } from "../components/PushpinIcon";

interface CourseOption {
  id: string;
  course_name: string;
  course_code?: string;
  color?: string;
}

interface TaskEditModalProps {
  task?: TaskItem | null;
  courses?: CourseOption[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<TaskItem>) => Promise<void>;
}

export function TaskEditModal({
  task,
  courses = [],
  isOpen,
  onClose,
  onSave,
}: TaskEditModalProps) {
  const [title, setTitle] = useState("");
  const [labelType, setLabelType] = useState<"custom" | "course">("custom");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [description, setDescription] = useState("");
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("");
  const [color, setColor] = useState<string>("blue");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setLabelType(task.label_type || "custom");
      setSelectedCourse(task.course || "");
      setDescription(task.description || "");
      setHasDeadline(!!task.deadline_date);
      setDeadlineDate(task.deadline_date || "");
      setDeadlineTime(task.deadline_time || "18:00");
      setColor(task.color || getRandomPushpinColor(task.id));
    } else {
      // New task defaults
      setTitle("");
      setLabelType("custom");
      setSelectedCourse("");
      setDescription("");
      setHasDeadline(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      await onSave({
        id: task?.id,
        title: title.trim(),
        label_type: labelType,
        course: labelType === "course" ? selectedCourse || null : null,
        description: description.trim(),
        deadline_date: hasDeadline ? deadlineDate || null : null,
        deadline_time: hasDeadline ? deadlineTime || null : null,
        notify_before_deadline: hasDeadline,
        color: color,
      });
      onClose();
    } catch (err) {
      console.error("Failed to save task:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
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
        onClick={(e) => e.stopPropagation()}
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
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

            {/* Course Selector Dropdown if Course is chosen */}
            {labelType === "course" && courses.length > 0 && (
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                style={{
                  width: "100%",
                  height: "38px",
                  marginTop: "8px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1.5px solid #4b5563",
                  background: "#ffffff",
                  fontSize: "0.9rem",
                  fontFamily: "'EB Garamond', Georgia, serif",
                  outline: "none",
                  color: "#111827",
                }}
              >
                <option value="">Select a course…</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.course_name} {c.course_code ? `(${c.course_code})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Description Field (Pink Tinted Background) */}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "#1f2937", marginBottom: "6px", fontFamily: "'Inter', sans-serif" }}>
              Description
            </label>
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

            {/* Date and Time Picker (Appears when green toggle is active) */}
            {hasDeadline && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "6px" }}>
                  {/* Date Picker Input */}
                  <input
                    type="date"
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    style={{
                      height: "40px",
                      padding: "0 14px",
                      borderRadius: "8px",
                      border: "1.5px solid #4b5563",
                      background: "#ffffff",
                      fontSize: "0.95rem",
                      fontFamily: "'EB Garamond', Georgia, serif",
                      outline: "none",
                      color: "#111827",
                    }}
                  />

                  {/* Time Picker Input */}
                  <input
                    type="time"
                    value={deadlineTime}
                    onChange={(e) => setDeadlineTime(e.target.value)}
                    style={{
                      height: "40px",
                      padding: "0 14px",
                      borderRadius: "8px",
                      border: "1.5px solid #4b5563",
                      background: "#ffffff",
                      fontSize: "0.95rem",
                      fontFamily: "'EB Garamond', Georgia, serif",
                      outline: "none",
                      color: "#111827",
                    }}
                  />
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
  );
}
