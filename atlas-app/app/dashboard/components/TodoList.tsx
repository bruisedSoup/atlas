"use client";

import React, { useState } from "react";
import { PushpinIcon, getRandomPushpinColor } from "./PushpinIcon";

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  label_type?: "custom" | "course";
  status?: "ongoing" | "done" | "archived";
  deadline_date?: string | null;
  deadline_time?: string | null;
  notify_before_deadline?: boolean;
  color?: string;
  course?: string | null;
}

interface TodoListProps {
  tasks: TaskItem[];
  statusFilter: "ongoing" | "done" | "archived";
  onStatusFilterChange: (status: "ongoing" | "done" | "archived") => void;
  onAddTask: () => void;
  onTaskClick: (task: TaskItem) => void;
  onCompleteTask: (taskId: string) => void;
  onRefresh: () => void;
  loading?: boolean;
}

export function TodoList({
  tasks,
  statusFilter = "ongoing",
  onStatusFilterChange,
  onAddTask,
  onTaskClick,
  onCompleteTask,
  onRefresh,
  loading = false,
}: TodoListProps) {
  const [checkingId, setCheckingId] = useState<string | null>(null);

  const handleCheck = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    setCheckingId(taskId);
    setTimeout(() => {
      onCompleteTask(taskId);
      setCheckingId(null);
    }, 250);
  };

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "14px",
        border: "1px solid #e5e7eb",
        padding: "24px 28px",
        minHeight: "420px",
        boxShadow: "0 2px 8px -2px rgba(0,0,0,0.03)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        {/* Left: To-do Title & Status Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.35rem", fontWeight: 600, color: "#111827" }}>
              To-do
            </h3>
          </div>

          {/* Status filter badge */}
          <button
            onClick={() => {
              const next = statusFilter === "ongoing" ? "done" : "ongoing";
              onStatusFilterChange(next);
            }}
            style={{
              background: "#bae6fd",
              color: "#0369a1",
              border: "none",
              borderRadius: "6px",
              padding: "4px 12px",
              fontSize: "0.825rem",
              fontWeight: 500,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span style={{ textTransform: "capitalize" }}>{statusFilter}</span>
            <span style={{ fontSize: "0.7rem" }}>▾</span>
          </button>
        </div>

        {/* Right Action Icons: Refresh / Add */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={onRefresh}
            title="Refresh tasks"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "18px",
              background: "#fce7f3",
              border: "none",
              color: "#db2777",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "transform 0.15s ease",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
          </button>

          <button
            onClick={onAddTask}
            title="Add task"
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "19px",
              background: "#18181b",
              border: "none",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              transition: "transform 0.1s ease",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Task List or Empty State */}
      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
          Loading deliverables…
        </div>
      ) : tasks.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 0",
          }}
        >
          <img
            src="/empty.png"
            alt="Sleepy Cat - No tasks"
            style={{ width: "120px", height: "auto", marginBottom: "16px", objectFit: "contain" }}
          />
          <p
            style={{
              fontFamily: "'EB Garamond', Georgia, serif",
              fontSize: "1.2rem",
              fontWeight: 500,
              color: "#1f2937",
            }}
          >
            {statusFilter === "ongoing"
              ? "No tasks in your work hub!"
              : `No ${statusFilter} tasks found.`}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {tasks.map((task, idx) => {
            const isChecked = checkingId === task.id;
            const pinColor = task.color || getRandomPushpinColor(task.id || idx);

            return (
              <div
                key={task.id}
                onClick={() => onTaskClick(task)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 18px",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  background: "#ffffff",
                  cursor: "pointer",
                  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                  opacity: isChecked ? 0.3 : 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#cbd5e1";
                  e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.02)";
                }}
              >
                {/* Left: Pushpin + Title */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1, minWidth: 0 }}>
                  <PushpinIcon color={pinColor} size={28} />
                  <span
                    style={{
                      fontFamily: "'EB Garamond', Georgia, serif",
                      fontSize: "1.05rem",
                      color: "#1f2937",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {task.title}
                  </span>
                </div>

                {/* Right: Checkbox Container */}
                <div
                  onClick={(e) => handleCheck(e, task.id)}
                  title="Mark as complete & send to Vault"
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "6px",
                    border: "1.5px solid #9ca3af",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    background: isChecked ? "#10b981" : "#ffffff",
                    borderColor: isChecked ? "#10b981" : "#9ca3af",
                    transition: "all 0.15s ease",
                    flexShrink: 0,
                    marginLeft: "12px",
                  }}
                >
                  {isChecked && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
