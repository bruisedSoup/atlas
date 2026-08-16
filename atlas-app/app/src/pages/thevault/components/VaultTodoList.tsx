"use client";

import React from "react";
import { TaskItem } from "@/app/src/pages/dashboard/components/TodoList";
import { PushpinIcon, getRandomPushpinColor } from "@/app/src/components/PushpinIcon";
import { TodoListSkeleton } from "@/app/src/components/Skeleton";

interface VaultTodoListProps {
  tasks: TaskItem[];
  onTaskClick: (task: TaskItem) => void;
  onRestoreTask: (taskId: string) => void;
  onRefresh: () => void;
  loading?: boolean;
}

export function VaultTodoList({
  tasks,
  onTaskClick,
  onRestoreTask,
  onRefresh,
  loading = false,
}: VaultTodoListProps) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "14px",
        border: "1px solid #e5e7eb",
        padding: "28px 32px",
        minHeight: "440px",
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
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#111827"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <h3
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "1.3rem",
              fontWeight: 600,
              color: "#111827",
              margin: 0,
            }}
          >
            Completed Deliverables
          </h3>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          title="Refresh vault"
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
      </div>

      {/* Task List or Skeleton / Empty State */}
      {loading ? (
        <TodoListSkeleton count={4} isVault={true} />
      ) : tasks.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "54px 0",
          }}
        >
          {/* Empty state cat illustration matching mockup */}
          <img
            src="/empty.png"
            alt="Sleepy Cat - No completed tasks"
            style={{ width: "130px", height: "auto", marginBottom: "18px", objectFit: "contain" }}
          />
          <p
            style={{
              fontFamily: "'EB Garamond', Georgia, serif",
              fontSize: "1.35rem",
              fontWeight: 500,
              color: "#1f2937",
              margin: 0,
            }}
          >
            No completed tasks in the vault!
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {tasks.map((task, idx) => {
            const pinColor = task.color || getRandomPushpinColor(task.id || idx);

            return (
              <div
                key={task.id}
                onClick={() => onTaskClick(task)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 20px",
                  borderRadius: "10px",
                  border: "1.5px solid #e5e7eb",
                  background: "#ffffff",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#cbd5e1";
                  e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.02)";
                }}
              >
                {/* Left: Pushpin + Title + Deadline date */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: 0 }}>
                  <PushpinIcon color={pinColor} size={28} />
                  <div>
                    <span
                      style={{
                        fontFamily: "'EB Garamond', Georgia, serif",
                        fontSize: "1.1rem",
                        color: "#111827",
                        display: "block",
                        textDecoration: "line-through",
                      }}
                    >
                      {task.title}
                    </span>
                    {task.deadline_date && (
                      <span style={{ fontSize: "0.75rem", color: "#9ca3af", fontFamily: "'Inter', sans-serif" }}>
                        Completed • Due {task.deadline_date}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Checkbox showing complete + Restore icon */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRestoreTask(task.id);
                    }}
                    title="Restore task to Work Hub"
                    style={{
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: "6px",
                      color: "#16a34a",
                      fontSize: "0.75rem",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      padding: "4px 10px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span>↺</span> Restore
                  </button>

                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "6px",
                      background: "#10b981",
                      border: "1.5px solid #10b981",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
