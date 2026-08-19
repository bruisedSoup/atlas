"use client";

import React, { useState, useRef, useEffect } from "react";
import { PushpinIcon, getRandomPushpinColor } from "@/app/src/components/PushpinIcon";
import { TodoListSkeleton } from "@/app/src/components/Skeleton";

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  label_type?: "custom" | "course";
  custom_label?: string;
  status?: "ongoing" | "done" | "completed" | "missed" | "archived";
  deadline_date?: string | null;
  deadline_time?: string | null;
  notify_before_deadline?: boolean;
  color?: string;
  course?: string | null;
  course_detail?: { id: string; course_name: string; course_code?: string; color?: string } | null;
  _sync_status?: "pending_sync" | "synced";
  _temp_id?: string;
}

export type FilterStatus = "ongoing" | "missed" | "completed";

interface TodoListProps {
  tasks: TaskItem[];
  statusFilter: FilterStatus;
  onStatusFilterChange: (status: FilterStatus) => void;
  onAddTask: () => void;
  onTaskClick: (task: TaskItem) => void;
  onCompleteTask: (taskId: string) => void;
  onRefresh: () => void;
  loading?: boolean;
  missedCount?: number;
  isOnline?: boolean;
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
  missedCount = 0,
  isOnline = true,
}: TodoListProps) {
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCheck = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    setCheckingId(taskId);
    setTimeout(() => {
      onCompleteTask(taskId);
      setCheckingId(null);
    }, 250);
  };

  const filterOptions: { id: FilterStatus; label: string; icon: React.ReactNode }[] = [
    {
      id: "ongoing",
      label: "Ongoing",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a9 9 0 1 0 8.5 6" />
          <polyline points="12 7 12 12 14.5 12" />
          <path d="M18 14v4l-3-2" />
        </svg>
      ),
    },
    {
      id: "missed",
      label: "Missed",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a9 9 0 1 0 8.5 6" />
          <polyline points="12 7 12 12 14.5 12" />
          <path d="M18.5 14v3.5" />
          <circle cx="18.5" cy="20" r="0.75" fill="#dc2626" />
        </svg>
      ),
    },
    {
      id: "completed",
      label: "Completed",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
  ];

  // Pill styling based on active filter
  const pillBg = statusFilter === "missed" ? "#fee2e2" : statusFilter === "completed" ? "#dcfce7" : "#cbe4fc";
  const pillBorder = statusFilter === "missed" ? "#dc2626" : statusFilter === "completed" ? "#16a34a" : "#111827";
  const pillColor = statusFilter === "missed" ? "#dc2626" : statusFilter === "completed" ? "#16a34a" : "#111827";

  const currentOption = filterOptions.find((o) => o.id === statusFilter) || filterOptions[0];

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
        {/* Left: To-do Title & Status Filter Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative" }} ref={dropdownRef}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.35rem", fontWeight: 600, color: "#111827" }}>
              To-do
            </h3>
          </div>

          {/* Status Filter Pill Button */}
          <div style={{ position: "relative" }}>
            {/* Red badge when missed tasks exist */}
            {missedCount > 0 && statusFilter !== "missed" && (
              <div style={{
                position: "absolute",
                top: "-6px",
                right: "-6px",
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                background: "#dc2626",
                border: "2px solid #ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
              }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a9 9 0 1 0 8.5 6" />
                  <polyline points="12 7 12 12 14.5 12" />
                  <path d="M18.5 14v3.5" />
                  <circle cx="18.5" cy="20" r="0.75" fill="#ffffff" />
                </svg>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                background: pillBg,
                color: pillColor,
                border: `1.5px solid ${pillBorder}`,
                borderRadius: "24px",
                padding: "4px 14px",
                fontSize: "0.95rem",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                transition: "all 0.15s ease",
              }}
            >
              <span>{currentOption.label}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={pillColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: 0,
                  zIndex: 40,
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  background: "#ffffff",
                  padding: "4px",
                  borderRadius: "16px",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)",
                }}
              >
                {filterOptions.map((opt) => {
                  const isSelected = opt.id === statusFilter;
                  const optBg = isSelected
                    ? opt.id === "missed" ? "#fee2e2"
                    : opt.id === "completed" ? "#dcfce7"
                    : "#cbe4fc"
                    : "#ffffff";
                  const optBorder = opt.id === "missed" ? "#dc2626" : opt.id === "completed" ? "#16a34a" : "#111827";
                  const optColor = opt.id === "missed" ? "#dc2626" : opt.id === "completed" ? "#16a34a" : "#111827";

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        onStatusFilterChange(opt.id);
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        width: "170px",
                        height: "40px",
                        padding: "0 14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: optBg,
                        border: `1.5px solid ${optBorder}`,
                        borderRadius: "12px",
                        cursor: "pointer",
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        color: optColor,
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = "#f3f4f6";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = "#ffffff";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>{opt.label}</span>
                        {/* Missed badge count in dropdown */}
                        {opt.id === "missed" && missedCount > 0 && (
                          <span style={{
                            background: "#dc2626",
                            color: "#ffffff",
                            borderRadius: "9999px",
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            padding: "1px 6px",
                            lineHeight: 1.4,
                          }}>{missedCount}</span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {opt.icon}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
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

      {/* Task List or Skeleton / Empty State */}
      {loading ? (
        <TodoListSkeleton count={4} />
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
              : statusFilter === "missed"
              ? "No missed deliverables. You're all caught up!"
              : "No completed tasks yet."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {tasks.map((task, idx) => {
            const isChecked = checkingId === task.id || task.status === "done" || task.status === "completed";
            const pinColor = task.color || getRandomPushpinColor(task.id || idx);
            const isPendingSync = task._sync_status === "pending_sync" || task.id.startsWith("temp_");

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
                  border: "1.5px solid #e5e7eb",
                  background: "#ffffff",
                  cursor: "pointer",
                  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                  opacity: isChecked && statusFilter === "ongoing" ? 0.3 : 1,
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
                {/* Left: Pushpin + Title + Optional Sync Indicator */}
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

                  {/* Subtle Per-Task Pending Sync Cloud Indicator */}
                  {isPendingSync && (
                    <span
                      title="Saved locally — will sync to cloud when connected"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "2px 7px",
                        borderRadius: "9999px",
                        background: "#fffbeb",
                        border: "1px solid #fef3c7",
                        color: "#d97706",
                        fontSize: "0.7rem",
                        fontWeight: 500,
                        fontFamily: "'Inter', sans-serif",
                        flexShrink: 0,
                        marginLeft: "4px",
                      }}
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                        <polyline points="12 13 12 9 14 11" />
                      </svg>
                      <span>Syncing</span>
                    </span>
                  )}
                </div>

                {/* Right: Checkbox Container */}
                <div
                  onClick={(e) => {
                    if (statusFilter !== "completed") {
                      handleCheck(e, task.id);
                    }
                  }}
                  title={statusFilter === "completed" ? "Completed" : "Mark as complete & send to Vault"}
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "6px",
                    border: "1.5px solid #9ca3af",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: statusFilter === "completed" ? "default" : "pointer",
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
