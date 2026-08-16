"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/app/dashboard/components/Sidebar";
import { TaskItem } from "@/app/dashboard/components/TodoList";
import { VaultHeaderCards, VaultTimeFilter } from "./components/VaultHeaderCards";
import { VaultTodoList } from "./components/VaultTodoList";
import { VaultTaskViewModal } from "./modals/VaultTaskViewModal";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
}

export default function TheVaultPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [completedTasks, setCompletedTasks] = useState<TaskItem[]>([]);
  const [activeTimeFilter, setActiveTimeFilter] = useState<VaultTimeFilter>("All");
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string>("");
  const [selectedTaskForView, setSelectedTaskForView] = useState<TaskItem | null>(null);

  const supabase = createClient();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Initial Auth & Profile Fetch
  useEffect(() => {
    async function initAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const astroUrl = process.env.NEXT_PUBLIC_ASTRO_URL || "http://localhost:4321";
        window.location.href = `${astroUrl}/signin`;
        return;
      }

      setAccessToken(session.access_token);

      try {
        const res = await fetch(`${apiUrl}/api/auth/session/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        });
        if (res.ok) {
          const data = await res.json();
          setUserProfile(data.user);
        } else {
          setUserProfile({
            id: session.user.id,
            email: session.user.email || "",
            full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || "Student",
            avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || "",
          });
        }
      } catch {
        setUserProfile({
          id: session.user.id,
          email: session.user.email || "",
          full_name: session.user.user_metadata?.full_name || "Student",
          avatar_url: "",
        });
      }
    }

    initAuth();
  }, [apiUrl, supabase]);

  // Fetch Completed Tasks
  const fetchCompletedTasks = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/tasks/?status=done`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCompletedTasks(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error("Failed to fetch completed tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [accessToken, apiUrl]);

  useEffect(() => {
    if (accessToken) {
      fetchCompletedTasks();
    }
  }, [accessToken, fetchCompletedTasks]);

  // Restore Task to Work Hub
  const handleRestoreTask = async (taskId: string) => {
    if (!accessToken) return;
    setSelectedTaskForView(null);
    setCompletedTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      await fetch(`${apiUrl}/api/tasks/${taskId}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "ongoing" }),
      });
    } catch (err) {
      console.error("Failed to restore task:", err);
      fetchCompletedTasks();
    }
  };

  // Permanently Delete Task
  const handleDeleteTask = async (taskId: string) => {
    if (!accessToken) return;
    setSelectedTaskForView(null);
    setCompletedTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      await fetch(`${apiUrl}/api/tasks/${taskId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (err) {
      console.error("Failed to delete task:", err);
      fetchCompletedTasks();
    }
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
        {/* The Vault Header Cards */}
        <VaultHeaderCards
          userName={userProfile?.full_name || "Isabella Gonzales"}
          avatarUrl={userProfile?.avatar_url || ""}
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
