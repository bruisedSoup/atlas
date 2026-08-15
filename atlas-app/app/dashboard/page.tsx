"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./components/Sidebar";
import { HeaderCards } from "./components/HeaderCards";
import { TodoList, TaskItem } from "./components/TodoList";
import { TaskViewModal } from "./modals/TaskViewModal";
import { TaskEditModal } from "./modals/TaskEditModal";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("work-hub");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [courses, setCourses] = useState<{ id: string; course_name: string; course_code?: string }[]>([]);
  const [statusFilter, setStatusFilter] = useState<"ongoing" | "done" | "archived">("ongoing");
  const [activeLabelFilter, setActiveLabelFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string>("");

  // Modals state
  const [selectedTaskForView, setSelectedTaskForView] = useState<TaskItem | null>(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<TaskItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

      // Fetch Django user profile
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
          // Fallback to session user metadata
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

  // Fetch Tasks
  const fetchTasks = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      let url = `${apiUrl}/api/tasks/?status=${statusFilter}`;
      if (activeLabelFilter !== "All") {
        if (activeLabelFilter === "Custom") {
          url += `&label_type=custom`;
        } else {
          const matchedCourse = courses.find((c) => c.course_name === activeLabelFilter);
          if (matchedCourse) {
            url += `&course=${matchedCourse.id}`;
          }
        }
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [accessToken, apiUrl, statusFilter, activeLabelFilter, courses]);

  // Fetch Courses
  const fetchCourses = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${apiUrl}/api/courses/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    }
  }, [accessToken, apiUrl]);

  useEffect(() => {
    if (accessToken) {
      fetchTasks();
      fetchCourses();
    }
  }, [accessToken, fetchTasks, fetchCourses]);

  // Create or Update Task
  const handleSaveTask = async (taskData: Partial<TaskItem>) => {
    if (!accessToken) return;

    if (taskData.id) {
      // Update
      const res = await fetch(`${apiUrl}/api/tasks/${taskData.id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });
      if (res.ok) {
        fetchTasks();
      }
    } else {
      // Create
      const res = await fetch(`${apiUrl}/api/tasks/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });
      if (res.ok) {
        fetchTasks();
      }
    }
  };

  // Complete task (check to vault)
  const handleCompleteTask = async (taskId: string) => {
    if (!accessToken) return;

    // Optimistically update UI
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      await fetch(`${apiUrl}/api/tasks/${taskId}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "done" }),
      });
    } catch (err) {
      console.error("Failed to mark task done:", err);
      fetchTasks();
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    if (!accessToken) return;
    setSelectedTaskForView(null);

    // Optimistically remove
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      await fetch(`${apiUrl}/api/tasks/${taskId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (err) {
      console.error("Failed to delete task:", err);
      fetchTasks();
    }
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
    "Custom",
    ...courses.map((c) => c.course_name),
  ];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
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

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          padding: "24px 32px",
          maxWidth: "1280px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {activeTab === "work-hub" && (
          <>
            {/* Header Cards (Work Hub Filters + User Greeting) */}
            <HeaderCards
              userName={userProfile?.full_name || "Isabella Gonzales"}
              avatarUrl={userProfile?.avatar_url || ""}
              activeFilter={activeLabelFilter}
              onFilterChange={setActiveLabelFilter}
              customLabels={customFilterLabels}
            />

            {/* Todo List / Deliverables */}
            <TodoList
              tasks={tasks}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onAddTask={handleOpenAddModal}
              onTaskClick={(task) => setSelectedTaskForView(task)}
              onCompleteTask={handleCompleteTask}
              onRefresh={fetchTasks}
              loading={loading}
            />
          </>
        )}

        {/* Placeholder for other tabs */}
        {activeTab !== "work-hub" && (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              border: "1px solid #e5e7eb",
              padding: "48px 32px",
              textAlign: "center",
              minHeight: "400px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: "2rem", marginBottom: "8px" }}>
              {activeTab === "the-vault" && "The Vault"}
              {activeTab === "courses" && "Courses"}
              {activeTab === "calendar" && "Calendar"}
              {activeTab === "schedule" && "Schedule"}
              {activeTab === "settings" && "Settings"}
            </h2>
            <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
              This section will be available in the upcoming build steps.
            </p>
          </div>
        )}
      </main>

      {/* View Task Modal (Mockup 3) */}
      <TaskViewModal
        task={selectedTaskForView}
        isOpen={!!selectedTaskForView}
        onClose={() => setSelectedTaskForView(null)}
        onEdit={handleEditFromView}
        onDelete={handleDeleteTask}
      />

      {/* Edit / Add Task Modal (Mockup 4) */}
      <TaskEditModal
        task={selectedTaskForEdit}
        courses={courses}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveTask}
      />
    </div>
  );
}
