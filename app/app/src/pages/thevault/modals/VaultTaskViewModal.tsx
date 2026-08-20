"use client";

import React from "react";
import { TaskItem } from "@/app/src/pages/dashboard/components/TodoList";
import { PushpinIcon } from "@/app/src/components/PushpinIcon";
import { BackButton } from "@/app/src/components/BackButton";

interface VaultTaskViewModalProps {
  task: TaskItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRestore: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export function VaultTaskViewModal({
  task,
  isOpen,
  onClose,
  onRestore,
  onDelete,
}: VaultTaskViewModalProps) {
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
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "#ffffff",
          borderRadius: "14px",
          padding: "36px 36px 30px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          position: "relative",
          animation: "modalFadeIn 0.15s ease-out",
        }}
      >
        {/* Top Bar: Back Button */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <BackButton onClick={onClose} label="Back" variant="blue" />

          <span
            style={{
              background: "#f0fdf4",
              color: "#16a34a",
              border: "1px solid #bbf7d0",
              borderRadius: "12px",
              padding: "2px 10px",
              fontSize: "0.75rem",
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            ✓ Completed
          </span>
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
              margin: 0,
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

        {/* Bottom Double Line Border (above Due section) */}
        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
          <div style={{ height: "1.5px", background: "#4b5563", marginBottom: "3px" }} />
          <div style={{ height: "1.5px", background: "#4b5563" }} />
        </div>

        {task.deadline_date && (
          <p
            style={{
              textAlign: "center",
              fontSize: "0.85rem",
              color: "#6b7280",
              marginBottom: "24px",
            }}
          >
            ⏰ Due date was: {task.deadline_date} {task.deadline_time ? `at ${task.deadline_time}` : ""}
          </p>
        )}

        {/* Action Buttons: Restore / Delete Permanently */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <button
            type="button"
            onClick={() => onRestore(task.id)}
            style={{
              height: "42px",
              background: "#111827",
              color: "#ffffff",
              border: "1.5px solid #111827",
              borderRadius: "8px",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            Restore to Work Hub
          </button>

          <button
            type="button"
            onClick={() => onDelete(task.id)}
            style={{
              height: "42px",
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
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}
