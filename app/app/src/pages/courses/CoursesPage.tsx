"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/app/src/components/Sidebar";
import { CoursesHeaderCards } from "./components/CoursesHeaderCards";
import { CourseFolderGrid, CourseData } from "./components/CourseFolderGrid";
import { CourseModal } from "./modals/CourseModal";
import { ScanCORModal } from "./modals/ScanCORModal";
import { useUser } from "@/app/context/UserContext";

interface CoursesPageProps {
  onTabChange?: (tab: string) => void;
}

export default function CoursesPage({ onTabChange }: CoursesPageProps = {}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedCourseForEdit, setSelectedCourseForEdit] = useState<CourseData | null>(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  const { accessToken, getFreshToken } = useUser();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Fetch registered courses from API
  const fetchCourses = useCallback(async (tokenOverride?: string) => {
    const token = tokenOverride || (await getFreshToken());
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/courses/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const items: CourseData[] = Array.isArray(data) ? data : data.results || [];
        setCourses(items);
      }
    } catch (err) {
      console.warn("Failed to fetch courses from server:", err);
    } finally {
      setLoading(false);
    }
  }, [getFreshToken, apiUrl]);

  useEffect(() => {
    if (accessToken) {
      fetchCourses();
    } else {
      // Small timeout to allow token hydration
      const timer = setTimeout(() => {
        fetchCourses();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [accessToken, fetchCourses]);

  // Handle Save (Create or Update)
  const handleSaveCourse = async (courseData: Partial<CourseData>) => {
    const token = (await getFreshToken()) || accessToken;
    const isEdit = !!courseData.id;

    if (isEdit && courseData.id) {
      // Optimistic Update
      setCourses((prev) =>
        prev.map((c) => (c.id === courseData.id ? { ...c, ...courseData } as CourseData : c))
      );

      if (token) {
        const res = await fetch(`${apiUrl}/api/courses/${courseData.id}/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            course_name: courseData.course_name,
            course_code: courseData.course_code,
            instructor_name: courseData.instructor_name,
            room_location: courseData.room_location,
            color: courseData.color,
            has_schedule: courseData.has_schedule,
            schedule_days: courseData.schedule_days,
            schedule_start_time: courseData.schedule_start_time,
            schedule_end_time: courseData.schedule_end_time,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to update course on server.");
        }
        const updated = await res.json();
        setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      }
    } else {
      // Create new course
      const tempId = `temp_${Date.now()}`;
      const newCourse: CourseData = {
        id: tempId,
        course_name: courseData.course_name || "New Course",
        course_code: courseData.course_code || "",
        instructor_name: courseData.instructor_name || "",
        room_location: courseData.room_location || "",
        color: courseData.color || "purple",
        created_at: new Date().toISOString(),
        has_schedule: courseData.has_schedule,
        schedule_days: courseData.schedule_days,
        schedule_start_time: courseData.schedule_start_time,
        schedule_end_time: courseData.schedule_end_time,
      };

      // Optimistic Add
      setCourses((prev) => [newCourse, ...prev]);

      if (token) {
        const res = await fetch(`${apiUrl}/api/courses/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            course_name: courseData.course_name,
            course_code: courseData.course_code,
            instructor_name: courseData.instructor_name,
            room_location: courseData.room_location,
            color: courseData.color,
            has_schedule: courseData.has_schedule,
            schedule_days: courseData.schedule_days,
            schedule_start_time: courseData.schedule_start_time,
            schedule_end_time: courseData.schedule_end_time,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to create course on server.");
        }
        const created = await res.json();
        setCourses((prev) =>
          prev.map((c) => (c.id === tempId ? created : c))
        );
      }
    }
  };

  // Handle Delete
  const handleDeleteCourse = async (courseId: string) => {
    const token = (await getFreshToken()) || accessToken;

    // Optimistic remove
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    if (activeFilter === courseId) {
      setActiveFilter("All");
    }

    if (token && !courseId.startsWith("temp_")) {
      const res = await fetch(`${apiUrl}/api/courses/${courseId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.warn("Failed to delete course on server.");
      }
    }
  };

  // Filter courses
  const displayedCourses = courses.filter((c) => {
    if (activeFilter === "All") return true;
    return c.id === activeFilter;
  });

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f4f5f7",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Sidebar with activeTab="courses" */}
      <Sidebar
        activeTab="courses"
        onTabChange={(tabId) => {
          if (tabId === "work-hub") window.location.href = "/dashboard";
          else if (tabId === "the-vault") window.location.href = "/thevault";
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Page Content */}
      <main
        style={{
          flex: 1,
          padding: "24px 32px",
          maxWidth: "1280px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Top Header Cards */}
        <CoursesHeaderCards
          coursesCount={courses.length}
          courses={courses}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Folder Grid Container */}
        <CourseFolderGrid
          courses={displayedCourses}
          onCourseClick={(course) => setSelectedCourseForEdit(course)}
          onAddNewCourse={() => setIsRegisterModalOpen(true)}
          onScanOCR={() => setIsScanModalOpen(true)}
          loading={loading}
        />
      </main>

      {/* OCR Document Scanner Modal */}
      <ScanCORModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onImportComplete={fetchCourses}
      />

      {/* Register Course Modal */}
      <CourseModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        mode="register"
        onSave={handleSaveCourse}
      />

      {/* Edit Course Modal */}
      <CourseModal
        isOpen={!!selectedCourseForEdit}
        onClose={() => setSelectedCourseForEdit(null)}
        mode="edit"
        course={selectedCourseForEdit}
        onSave={handleSaveCourse}
        onDelete={handleDeleteCourse}
      />
    </div>
  );
}
