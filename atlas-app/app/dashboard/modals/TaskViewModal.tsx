"use client";

import React from "react";
import { TaskItem } from "../components/TodoList";
import { PushpinIcon } from "../components/PushpinIcon";

interface TaskViewModalProps {
  task: TaskItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (taskId: string) => void;
}

export function TaskViewModal({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: TaskViewModalProps) {
  if (!isOpen || !task) return null;

  return (
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
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "#ffffff",
          borderRadius: "14px",
          padding: "36px 36px 30px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          position: "relative",
          animation: "modalFadeIn 0.15s ease-out",
        }}
      >
        {/* Top Bar: Back Button */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
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
        </div>

        {/* Top Double Line Border */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ height: "1.5px", background: "#4b5563", marginBottom: "3px" }} />
          <div style={{ height: "1.5px", background: "#4b5563" }} />
        </div>

        {/* Center Content: Large Pushpin + Italic Serif Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            padding: "24px 0 28px",
          }}
        >
          <PushpinIcon color={task.color || "#60a5fa"} size={52} />
          <h2
            style={{
              fontFamily: "'EB Garamond', Georgia, serif",
              fontSize: "1.85rem",
              fontStyle: "italic",
              fontWeight: 500,
              color: "#111827",
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            {task.title}
          </h2>
        </div>

        {/* Description or deadline details if present */}
        {task.description && (
          <p
            style={{
              textAlign: "center",
              fontSize: "0.9rem",
              color: "#4b5563",
              marginBottom: "16px",
              padding: "0 12px",
            }}
          >
            {task.description}
          </p>
        )}

        {task.deadline_date && (
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <p
              style={{
                fontSize: "0.875rem",
                color: "#374151",
                marginBottom: "4px",
                fontWeight: 500,
              }}
            >
              ⏰ Due: {task.deadline_date} {task.deadline_time ? `at ${task.deadline_time}` : ""}
            </p>
            <p
              style={{
                fontSize: "0.75rem",
                color: "#9ca3af",
                margin: 0,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              You will be notified 15 minutes before the deadline
            </p>
          </div>
        )}

        {/* Bottom Double Line Border */}
        <div style={{ marginTop: "16px", marginBottom: "28px" }}>
          <div style={{ height: "1.5px", background: "#4b5563", marginBottom: "3px" }} />
          <div style={{ height: "1.5px", background: "#4b5563" }} />
        </div>

        {/* Action Buttons: Edit / Delete */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <button
            onClick={() => onEdit(task)}
            style={{
              height: "40px",
              background: "#ffffff",
              color: "#111827",
              border: "1.5px solid #4b5563",
              borderRadius: "8px",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.9rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            Edit
          </button>

          <button
            onClick={() => onDelete(task.id)}
            style={{
              height: "40px",
              background: "#ffffff",
              color: "#ef4444",
              border: "1.5px solid #ef4444",
              borderRadius: "8px",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.9rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
