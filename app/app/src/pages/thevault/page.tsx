"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/app/src/components/Sidebar";
import { TaskItem } from "@/app/src/pages/dashboard/components/TodoList";
import { VaultHeaderCards, VaultTimeFilter } from "./components/VaultHeaderCards";
import { VaultTodoList } from "./components/VaultTodoList";
import { VaultTaskViewModal } from "./modals/VaultTaskViewModal";
import { useUser } from "@/app/context/UserContext";
import { realtimeService } from "@/app/src/services/realtime";
import {
  getCachedVaultTasks,
  setCachedVaultTasks,
  deleteLocalTask,
  enqueueAction,
} from "@/app/src/services/offlineStorage";
import { syncManager } from "@/app/src/services/syncManager";

export default function TheVaultPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<TaskItem[]>([]);
  const [activeTimeFilter, setActiveTimeFilter] = useState<VaultTimeFilter>("All");
  const [loading, setLoading] = useState(true);
  const [selectedTaskForView, setSelectedTaskForView] = useState<TaskItem | null>(null);

  const { accessToken, getFreshToken } = useUser();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    // 0ms instant cache load from IndexedDB
    async function loadVaultCache() {
      try {
        const cached = await getCachedVaultTasks();
        if (cached && cached.length > 0) {
          setCompletedTasks(cached);
          setLoading(false);
        }
      } catch (err) {
        console.warn("Failed to load vault cache from IDB:", err);
      }
    }
    loadVaultCache();
  }, []);

  // Fetch Completed Tasks
  const fetchCompletedTasks = useCallback(async (tokenOverride?: string) => {
    const token = tokenOverride || (await getFreshToken());
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/api/tasks/?status=done`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const items: TaskItem[] = Array.isArray(data) ? data : data.results || [];
        setCompletedTasks(items);
        await setCachedVaultTasks(items);
      }
    } catch (err) {
      console.warn("Failed to fetch completed tasks from server, using IDB cache:", err);
      const cached = await getCachedVaultTasks();
      if (cached.length > 0) {
        setCompletedTasks(cached);
      }
    } finally {
      setLoading(false);
    }
  }, [getFreshToken, apiUrl]);

  useEffect(() => {
    if (accessToken) {
      fetchCompletedTasks();
    }

    // Real-time synchronization for The Vault
    const unsubTaskUpdated = realtimeService.on("TASK_UPDATED", (msg) => {
      if (msg.payload) {
        if (msg.payload.status === "done" || msg.payload.status === "completed") {
          setCompletedTasks((prev) => {
            if (prev.some((t) => t.id === msg.payload.id)) {
              return prev.map((t) => (t.id === msg.payload.id ? { ...t, ...msg.payload } : t));
            }
            return [msg.payload, ...prev];
          });
        } else {
          // Status changed from done to ongoing
          setCompletedTasks((prev) => prev.filter((t) => t.id !== msg.payload.id));
        }
      }
    });

    const unsubTaskDeleted = realtimeService.on("TASK_DELETED", (msg) => {
      if (msg.payload?.id) {
        setCompletedTasks((prev) => prev.filter((t) => t.id !== msg.payload.id));
      }
    });

    return () => {
      unsubTaskUpdated();
      unsubTaskDeleted();
    };
  }, [accessToken, fetchCompletedTasks]);

  // Restore Task to Work Hub (Optimistic UI + Offline sync)
  const handleRestoreTask = async (taskId: string) => {
    setSelectedTaskForView(null);
    setCompletedTasks((prev) => prev.filter((t) => t.id !== taskId));

    await enqueueAction("UPDATE", { status: "ongoing" }, undefined, taskId);
    syncManager.triggerSync();
  };

  // Permanently Delete Task (Optimistic UI + Offline sync)
  const handleDeleteTask = async (taskId: string) => {
    setSelectedTaskForView(null);
    setCompletedTasks((prev) => prev.filter((t) => t.id !== taskId));

    await deleteLocalTask(taskId);
    await enqueueAction("DELETE", {}, undefined, taskId);
    syncManager.triggerSync();
  };

  // Filter tasks based on activeTimeFilter (All, This Week, This Month, This Semester)
  const filteredTasks = completedTasks.filter((task) => {
    if (activeTimeFilter === "All") return true;

    const dateStr = task.deadline_date || (task as any).updated_at || (task as any).created_at;
    if (!dateStr) return true;

    const taskDate = new Date(dateStr);
    const now = new Date();

    if (activeTimeFilter === "This Week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return taskDate >= oneWeekAgo && taskDate <= now;
    }

    if (activeTimeFilter === "This Month") {
      return (
        taskDate.getMonth() === now.getMonth() &&
        taskDate.getFullYear() === now.getFullYear()
      );
    }

    if (activeTimeFilter === "This Semester") {
      const semesterStart = new Date();
      semesterStart.setMonth(now.getMonth() - 5);
      return taskDate >= semesterStart;
    }

    return true;
  });

  const handleTabChange = (tabId: string) => {
    if (tabId === "work-hub") {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f4f5f7",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Sidebar Navigation with The Vault active */}
      <Sidebar
        activeTab="the-vault"
        onTabChange={handleTabChange}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          padding: "24px 32px",
          maxWidth: "1280px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* The Vault Header Cards (with global UserProfileCard) */}
        <VaultHeaderCards
          completedCount={completedTasks.length}
          activeTimeFilter={activeTimeFilter}
          onTimeFilterChange={setActiveTimeFilter}
        />

        {/* The Vault Completed Tasks List */}
        <VaultTodoList
          tasks={filteredTasks}
          onTaskClick={(task) => setSelectedTaskForView(task)}
          onRestoreTask={handleRestoreTask}
          onRefresh={fetchCompletedTasks}
          loading={loading}
        />
      </main>

      {/* Vault Task View Modal */}
      <VaultTaskViewModal
        task={selectedTaskForView}
        isOpen={!!selectedTaskForView}
        onClose={() => setSelectedTaskForView(null)}
        onRestore={handleRestoreTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}
