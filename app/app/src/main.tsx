"use client";

import React, { useState } from "react";
import DashboardPage from "@/app/src/pages/dashboard/page";
import TheVaultPage from "@/app/src/pages/thevault/page";
import CoursesPage from "@/app/src/pages/courses/page";
import CalendarPage from "@/app/src/pages/calendar/page";
import SchedulePage from "@/app/src/pages/schedule/page";
import SettingsPage from "@/app/src/pages/settings/page";

// Re-export all subpages
export { default as DashboardPage } from "@/app/src/pages/dashboard/page";
export { default as TheVaultPage } from "@/app/src/pages/thevault/page";
export { default as CoursesPage } from "@/app/src/pages/courses/page";
export { default as CalendarPage } from "@/app/src/pages/calendar/page";
export { default as SchedulePage } from "@/app/src/pages/schedule/page";
export { default as SettingsPage } from "@/app/src/pages/settings/page";

// Re-export global components
export { Sidebar } from "@/app/src/components/Sidebar";
export { UserProfileCard } from "@/app/src/components/UserProfileCard";
export { BackButton } from "@/app/src/components/BackButton";
export { EmptyState } from "@/app/src/components/EmptyState";
export { FolderCard, FOLDER_THEMES } from "@/app/src/components/FolderCard";
export { PushpinIcon } from "@/app/src/components/PushpinIcon";
export { NotificationToast } from "@/app/src/components/NotificationToast";
export { PWAProvider } from "@/app/src/components/PWAProvider";

// Re-export modals
export { ProfileModal } from "@/app/src/modals/ProfileModal";

export type AtlasTab =
  | "work-hub"
  | "the-vault"
  | "courses"
  | "calendar"
  | "schedule"
  | "settings";

interface MainProps {
  initialTab?: AtlasTab;
}

/**
 * Unified Main Component for the Atlas App (src/main.tsx).
 * Allows seamless switching between all sections (Work Hub, The Vault, Courses, Calendar, Schedule, Settings).
 */
export default function Main({ initialTab = "work-hub" }: MainProps) {
  const [currentTab, setCurrentTab] = useState<AtlasTab>(initialTab);

  switch (currentTab) {
    case "the-vault":
      return <TheVaultPage />;
    case "courses":
      return <CoursesPage />;
    case "calendar":
      return <CalendarPage />;
    case "schedule":
      return <SchedulePage />;
    case "settings":
      return <SettingsPage />;
    case "work-hub":
    default:
      return <DashboardPage />;
  }
}
