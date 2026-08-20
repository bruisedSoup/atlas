import React from "react";
import Main, { AtlasTab } from "@/app/src/main";

interface DynamicTabPageProps {
  params: Promise<{ tab: string }>;
}

export default async function DynamicTabPage({ params }: DynamicTabPageProps) {
  const { tab } = await params;

  // Map route slug to internal tab identifier
  const tabMapping: Record<string, AtlasTab> = {
    dashboard: "work-hub",
    "work-hub": "work-hub",
    thevault: "the-vault",
    "the-vault": "the-vault",
    courses: "courses",
    calendar: "calendar",
    schedule: "schedule",
    settings: "settings",
  };

  const initialTab = tabMapping[tab] || "work-hub";

  return <Main initialTab={initialTab} />;
}
