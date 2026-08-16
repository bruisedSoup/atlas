"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/app/src/components/Sidebar";
import { HeaderCards } from "./components/HeaderCards";
import { TodoList, TaskItem, FilterStatus } from "./components/TodoList";
import { TaskViewModal } from "./modals/TaskViewModal";
import { TaskEditModal } from "./modals/TaskEditModal";
import { CustomLabelItem } from "./modals/CustomLabelModal";
import { useUser } from "@/app/context/UserContext";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("work-hub");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [courses, setCourses] = useState<{ id: string; course_name: string; course_code?: string }[]>([]);
  const [customLabels, setCustomLabels] = useState<CustomLabelItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ongoing");
  const [activeLabelFilter, setActiveLabelFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedTaskForView, setSelectedTaskForView] = useState<TaskItem | null>(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<TaskItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { accessToken } = useUser();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Fetch Custom Labels
  const fetchCustomLabels = useCallback(async (tokenOverride?: string) => {
    const token = tokenOverride || accessToken;
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/api/tasks/custom-labels/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : data.results || [];
        setCustomLabels(items);
      }
    } catch (err) {
      console.error("Failed to fetch custom labels:", err);
    }
  }, [accessToken, apiUrl]);

  // Fetch Courses
  const fetchCourses = useCallback(async (tokenOverride?: string) => {
    const token = tokenOverride || accessToken;
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/api/courses/`, {
        headers: {
          Authorization: `Bearer ${token}`,
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

  // Fetch Tasks
  const fetchTasks = useCallback(async (tokenOverride?: string) => {
    const token = tokenOverride || accessToken;
    if (!token) return;
    setLoading(true);
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
        headers: {
          Authorization: `Bearer ${token}`,
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

  useEffect(() => {
    if (accessToken) {
      fetchTasks();
      fetchCourses();
      fetchCustomLabels();
    }
  }, [accessToken, statusFilter, activeLabelFilter]);

  // Add Custom Label
  const handleAddCustomLabel = async (name: string) => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${apiUrl}/api/tasks/custom-labels/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
    if (!accessToken || !label.id) return;
    setCustomLabels((prev) => prev.filter((l) => l.id !== label.id));
    try {
      await fetch(`${apiUrl}/api/tasks/custom-labels/${label.id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (err) {
      console.error("Failed to delete label:", err);
      fetchCustomLabels();
    }
  };

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
    ...customLabels.map((l) => l.name),
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
