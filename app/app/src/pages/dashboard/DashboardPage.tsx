"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/app/src/components/Sidebar";
import { HeaderCards } from "./components/HeaderCards";
import { TodoList, TaskItem, FilterStatus } from "./components/TodoList";
import { TaskViewModal } from "./modals/TaskViewModal";
import { TaskEditModal } from "./modals/TaskEditModal";
import { CustomLabelItem } from "./modals/CustomLabelModal";
import { useUser } from "@/app/context/UserContext";
import { realtimeService } from "@/app/src/services/realtime";
import {
  getCachedTasks,
  setCachedTasks,
  upsertLocalTask,
  deleteLocalTask,
  enqueueAction,
} from "@/app/src/services/offlineStorage";
import { syncManager } from "@/app/src/services/syncManager";

interface DashboardPageProps {
  onTabChange?: (tab: string) => void;
}

export default function DashboardPage({ onTabChange }: DashboardPageProps = {}) {
  const [activeTab, setActiveTab] = useState("work-hub");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [courses, setCourses] = useState<{ id: string; course_name: string; course_code?: string }[]>([]);
  const [customLabels, setCustomLabels] = useState<CustomLabelItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ongoing");
  const [activeLabelFilter, setActiveLabelFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [missedCount, setMissedCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  // Modals state
  const [selectedTaskForView, setSelectedTaskForView] = useState<TaskItem | null>(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<TaskItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { accessToken, getFreshToken } = useUser();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // 1. Initial 0ms Instant Cache Load from IndexedDB
  useEffect(() => {
    async function loadOfflineCache() {
      try {
        const cached = await getCachedTasks();
        if (cached && cached.length > 0) {
          const ongoing = cached.filter((t) => !t.status || t.status === "ongoing");
          if (ongoing.length > 0) {
            setTasks(cached);
            setLoading(false);
          }
        }
      } catch (err) {
        console.warn("Failed to load initial cache from IndexedDB:", err);
      }
    }
    loadOfflineCache();
  }, []);

  // 2. Setup Sync Manager and Connectivity Listeners
  useEffect(() => {
    const unsubConnectivity = syncManager.addConnectivityListener((online) => {
      setIsOnline(online);
    });

    syncManager.registerAuth(getFreshToken, {
      onTaskCreated: (tempId, realTask) => {
        setTasks((prev) =>
          prev.map((t) => (t.id === tempId ? { ...realTask, _sync_status: "synced" } : t))
        );
      },
      onTaskUpdated: (realTask) => {
        setTasks((prev) =>
          prev.map((t) => (t.id === realTask.id ? { ...realTask, _sync_status: "synced" } : t))
        );
      },
      onTaskCompleted: (taskId) => {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      },
      onTaskDeleted: (taskId) => {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      },
      onSyncProgress: (syncing, pending) => {
        setIsSyncing(syncing);
        setPendingSyncCount(pending);
      },
    });

    return () => {
      unsubConnectivity();
    };
  }, [getFreshToken]);

  // Fetch missed count (always, regardless of current filter)
  const fetchMissedCount = useCallback(async (tokenOverride?: string) => {
    const token = tokenOverride || (await getFreshToken());
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/api/tasks/?status=missed`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : data.results || [];
        setMissedCount(items.length);
      }
    } catch {}
  }, [getFreshToken, apiUrl]);

  // Fetch Custom Labels
  const fetchCustomLabels = useCallback(async (tokenOverride?: string) => {
    const token = tokenOverride || (await getFreshToken());
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/api/tasks/custom-labels/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : data.results || [];
        setCustomLabels(items);
      }
    } catch (err) {
      console.error("Failed to fetch custom labels:", err);
    }
  }, [getFreshToken, apiUrl]);

  // Fetch Courses
  const fetchCourses = useCallback(async (tokenOverride?: string) => {
    const token = tokenOverride || (await getFreshToken());
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/api/courses/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    }
  }, [getFreshToken, apiUrl]);

  // Fetch Tasks with offline IndexedDB fallback and pending merge
  const fetchTasks = useCallback(async (tokenOverride?: string) => {
    const token = tokenOverride || (await getFreshToken());
    if (!token) return;
    try {
      let url = `${apiUrl}/api/tasks/?status=${statusFilter}`;
      if (activeLabelFilter !== "All") {
        const matchedCourse = courses.find((c) => c.course_name === activeLabelFilter);
        if (matchedCourse) {
          url += `&course=${matchedCourse.id}`;
        } else {
          url += `&custom_label=${encodeURIComponent(activeLabelFilter)}`;
        }
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const serverItems: TaskItem[] = Array.isArray(data) ? data : data.results || [];

        // Preserve any pending_sync tasks created offline that are not yet on the server
        const cached = await getCachedTasks();
        const pendingLocal = cached.filter(
          (t) => t._sync_status === "pending_sync" || t.id.startsWith("temp_")
        );

        const merged = [
          ...pendingLocal.filter((p) => !serverItems.some((s) => s.id === p.id)),
          ...serverItems,
        ];

        setTasks(merged);
        await setCachedTasks(serverItems);
      }
    } catch (err) {
      console.warn("Failed to fetch tasks from server, reading offline IndexedDB cache:", err);
      const cached = await getCachedTasks();
      if (cached.length > 0) {
        const filtered = cached.filter((t) => {
          if (statusFilter === "ongoing") return !t.status || t.status === "ongoing";
          if (statusFilter === "missed") return t.status === "missed";
          if (statusFilter === "completed") return t.status === "done" || t.status === "completed";
          return true;
        });
        setTasks(filtered);
      }
    } finally {
      setLoading(false);
    }
  }, [getFreshToken, apiUrl, statusFilter, activeLabelFilter, courses]);

  useEffect(() => {
    if (accessToken) {
      fetchTasks();
      fetchCourses();
      fetchCustomLabels();
      fetchMissedCount();
    }

    // Subscribe to real-time WebSocket events
    const unsubTaskCreated = realtimeService.on("TASK_CREATED", (msg) => {
      if (msg.payload) {
        setTasks((prev) => {
          if (prev.some((t) => t.id === msg.payload.id)) return prev;
          if (statusFilter === "ongoing" && msg.payload.status === "ongoing") {
            return [msg.payload, ...prev];
          }
          return prev;
        });
      }
    });

    const unsubTaskUpdated = realtimeService.on("TASK_UPDATED", (msg) => {
      if (msg.payload) {
        setTasks((prev) => {
          if (msg.payload.status === "done" && statusFilter === "ongoing") {
            return prev.filter((t) => t.id !== msg.payload.id);
          }
          return prev.map((t) => (t.id === msg.payload.id ? { ...t, ...msg.payload } : t));
        });
      }
    });

    const unsubTaskDeleted = realtimeService.on("TASK_DELETED", (msg) => {
      if (msg.payload?.id) {
        setTasks((prev) => prev.filter((t) => t.id !== msg.payload.id));
      }
    });

    const unsubLabel = realtimeService.on("LABEL_CREATED", () => fetchCustomLabels());
    const unsubLabelDel = realtimeService.on("LABEL_DELETED", () => fetchCustomLabels());

    return () => {
      unsubTaskCreated();
      unsubTaskUpdated();
      unsubTaskDeleted();
      unsubLabel();
      unsubLabelDel();
    };
  }, [accessToken, statusFilter, activeLabelFilter, fetchTasks, fetchCourses, fetchCustomLabels, fetchMissedCount]);

  // Refresh missed count whenever tasks change
  useEffect(() => {
    if (accessToken) fetchMissedCount();
  }, [accessToken, tasks, fetchMissedCount]);

  // Add Custom Label
  const handleAddCustomLabel = async (name: string) => {
    const token = await getFreshToken();
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/api/tasks/custom-labels/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const newLbl = await res.json();
        setCustomLabels((prev) => [...prev, newLbl]);
      }
    } catch (err) {
      console.error("Failed to create label:", err);
    }
  };

  // Delete Custom Label
  const handleDeleteCustomLabel = async (label: CustomLabelItem) => {
    const token = await getFreshToken();
    if (!token || !label.id) return;
    setCustomLabels((prev) => prev.filter((l) => l.id !== label.id));
    try {
      await fetch(`${apiUrl}/api/tasks/custom-labels/${label.id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Failed to delete label:", err);
      fetchCustomLabels();
    }
  };

  // Create or Update Task (Optimistic UI + Offline Write Queue)
  const handleSaveTask = async (taskData: Partial<TaskItem>) => {
    if (taskData.id) {
      // 1. Optimistic Update
      const updatedTask: TaskItem = {
        ...(tasks.find((t) => t.id === taskData.id) || ({} as TaskItem)),
        ...taskData,
        _sync_status: "pending_sync",
      } as TaskItem;

      setTasks((prev) => prev.map((t) => (t.id === taskData.id ? updatedTask : t)));

      // 2. Persist to IndexedDB & Write Queue
      await upsertLocalTask(updatedTask);
      await enqueueAction("UPDATE", taskData, undefined, taskData.id);

      // 3. Trigger background sync immediately if online
      syncManager.triggerSync();
    } else {
      // 1. Optimistic Creation with temporary local ID
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const newTask: TaskItem = {
        id: tempId,
        _temp_id: tempId,
        _sync_status: "pending_sync",
        status: "ongoing",
        title: taskData.title || "Untitled Task",
        description: taskData.description || "",
        label_type: taskData.label_type || "custom",
        custom_label: taskData.custom_label || "",
        course: taskData.course || null,
        deadline_date: taskData.deadline_date || null,
        deadline_time: taskData.deadline_time || null,
        notify_before_deadline: taskData.notify_before_deadline || false,
        color: taskData.color || "#60a5fa",
      };

      // Add to list immediately
      setTasks((prev) => [newTask, ...prev]);

      // 2. Persist to IndexedDB & Write Queue
      await upsertLocalTask(newTask);
      await enqueueAction("CREATE", newTask, tempId);

      // 3. Trigger background sync immediately if online
      syncManager.triggerSync();
    }
  };

  // Complete task (Optimistic + Offline Queue)
  const handleCompleteTask = async (taskId: string) => {
    // 1. Optimistically update UI
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    // 2. Persist to IndexedDB & Queue
    await deleteLocalTask(taskId);
    await enqueueAction("COMPLETE", { status: "done" }, undefined, taskId);

    // 3. Background sync
    syncManager.triggerSync();
  };

  // Delete task permanently (Optimistic + Offline Queue)
  const handleDeleteTask = async (taskId: string) => {
    // 1. Optimistically remove
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTaskForView(null);

    // 2. Persist to IndexedDB & Queue
    await deleteLocalTask(taskId);
    await enqueueAction("DELETE", {}, undefined, taskId);

    // 3. Background sync
    syncManager.triggerSync();
  };

  // Open Edit modal from View modal
  const handleEditFromView = (task: TaskItem) => {
    setSelectedTaskForView(null);
    setSelectedTaskForEdit(task);
    setIsEditModalOpen(true);
  };

  // Open Add modal
  const handleOpenAddModal = () => {
    setSelectedTaskForEdit(null);
    setIsEditModalOpen(true);
  };

  const customFilterLabels = [
    ...customLabels.map((l) => l.name),
    ...courses.map((c) => c.course_name),
  ];

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "#f4f5f7",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area: Work Hub */}
      <main
        style={{
          flex: 1,
          height: "100vh",
          overflowY: "auto",
          padding: "24px 32px",
          width: "100%",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto", paddingBottom: "32px" }}>
        {/* Offline / Syncing Floating Status Pill */}
        {(!isOnline || pendingSyncCount > 0 || isSyncing) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
              padding: "8px 16px",
              borderRadius: "8px",
              background: !isOnline ? "#fffbeb" : "#eff6ff",
              border: `1px solid ${!isOnline ? "#fde68a" : "#bfdbfe"}`,
              color: !isOnline ? "#92400e" : "#1e40af",
              fontSize: "0.82rem",
              fontWeight: 500,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: !isOnline ? "#f59e0b" : "#3b82f6",
                  display: "inline-block",
                }}
              />
              <span>
                {!isOnline
                  ? "Offline mode — your changes are saved locally and will sync automatically when connected."
                  : isSyncing
                  ? "Syncing offline changes to cloud..."
                  : `${pendingSyncCount} offline change${pendingSyncCount > 1 ? "s" : ""} pending sync.`}
              </span>
            </div>
            {isOnline && pendingSyncCount > 0 && !isSyncing && (
              <button
                type="button"
                onClick={() => syncManager.triggerSync()}
                style={{
                  background: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "3px 10px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Sync Now
              </button>
            )}
          </div>
        )}

        {/* Header Cards (Work Hub Filters + Global User Profile Card) */}
        <HeaderCards
          activeFilter={activeLabelFilter}
          onFilterChange={setActiveLabelFilter}
          customLabels={customFilterLabels}
        />

        {/* Todo List / Deliverables */}
        <TodoList
          tasks={tasks}
          statusFilter={statusFilter}
          onStatusFilterChange={(newStatus) => {
            setLoading(true);
            setStatusFilter(newStatus);
          }}
          onAddTask={handleOpenAddModal}
          onTaskClick={(task) => setSelectedTaskForView(task)}
          onCompleteTask={handleCompleteTask}
          onRefresh={fetchTasks}
          loading={loading}
          missedCount={missedCount}
          isOnline={isOnline}
        />
        </div>
      </main>

      {/* View Task Modal */}
      <TaskViewModal
        task={selectedTaskForView}
        isOpen={!!selectedTaskForView}
        onClose={() => setSelectedTaskForView(null)}
        onEdit={handleEditFromView}
        onDelete={handleDeleteTask}
      />

      {/* Edit / Add Task Modal */}
      <TaskEditModal
        task={selectedTaskForEdit}
        courses={courses}
        customLabels={customLabels}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveTask}
        onAddCustomLabel={handleAddCustomLabel}
        onDeleteCustomLabel={handleDeleteCustomLabel}
      />
    </div>
  );
}
