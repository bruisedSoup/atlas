"use client";

import React, { useState, useRef } from "react";
import { BackButton } from "@/app/src/components/BackButton";
import { FolderCard, FolderColorKey, FOLDER_THEMES } from "@/app/src/components/FolderCard";
import { useUser } from "@/app/context/UserContext";

export interface ParsedSchedule {
  days: string[];
  start_time: string;
  end_time: string;
  room_location?: string;
  instructor_name?: string;
}

export interface ParsedCourseItem {
  id?: string;
  course_code: string;
  course_name: string;
  instructor_name?: string;
  room_location?: string;
  color: FolderColorKey;
  schedules: ParsedSchedule[];
}

interface ScanCORModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => Promise<void> | void;
}

export function ScanCORModal({
  isOpen,
  onClose,
  onImportComplete,
}: ScanCORModalProps) {
  const [stage, setStage] = useState<"upload" | "scanning" | "review">("upload");
  const [extractedCourses, setExtractedCourses] = useState<ParsedCourseItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { getFreshToken } = useUser();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  if (!isOpen) return null;

  const handleClose = () => {
    setStage("upload");
    setExtractedCourses([]);
    setErrorMsg("");
    onClose();
  };

  const processFile = async (file?: File, useSample = false) => {
    setStage("scanning");
    setErrorMsg("");

    try {
      const token = await getFreshToken();
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }
      if (useSample) {
        formData.append("use_sample", "true");
      }

      const res = await fetch(`${apiUrl}/api/courses/scan-cor/`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to scan document.");
      }

      const data = await res.json();
      const items: ParsedCourseItem[] = (data.courses || []).map((c: any, i: number) => ({
        id: `ocr-${i}-${Date.now()}`,
        course_code: c.course_code || "",
        course_name: c.course_name || "",
        instructor_name: c.instructor_name || "",
        room_location: c.room_location || "",
        color: (c.color as FolderColorKey) || "purple",
        schedules: c.schedules || [],
      }));

      if (items.length === 0) {
        throw new Error("No courses could be detected in this document. Please check the file or enter them manually.");
      }

      setExtractedCourses(items);
      setStage("review");
    } catch (err: any) {
      console.error("Scan error:", err);
      setErrorMsg(err.message || "An error occurred while scanning the document.");
      setStage("upload");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file, false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file, false);
    }
  };

  const handleFieldChange = (index: number, field: keyof ParsedCourseItem, value: any) => {
    setExtractedCourses((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setExtractedCourses((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirmImport = async () => {
    if (extractedCourses.length === 0) return;
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const token = await getFreshToken();
      const res = await fetch(`${apiUrl}/api/courses/bulk-import/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ courses: extractedCourses }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to import courses.");
      }

      await onImportComplete();
      handleClose();
    } catch (err: any) {
      console.error("Import error:", err);
      setErrorMsg(err.message || "Failed to complete bulk import.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatScheduleDisplay = (schedules: ParsedSchedule[]) => {
    if (!schedules || schedules.length === 0) return "No schedule time";
    return schedules
      .map((s) => {
        const days = Array.isArray(s.days) ? s.days.join(", ") : s.days;
        return `${days} ${s.start_time} - ${s.end_time}${s.room_location ? ` (${s.room_location})` : ""}`;
      })
      .join(" • ");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "16px",
        colorScheme: "light",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "680px",
          backgroundColor: "#ffffff",
          color: "#111827",
          borderRadius: "16px",
          border: "1.5px solid #111827",
          padding: "26px 34px 30px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.18)",
          maxHeight: "92vh",
          overflowY: "auto",
          position: "relative",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Top Header */}
        <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "4px" }}>
          <BackButton onClick={handleClose} label="Back" variant="blue" />
        </div>

        <h2
          style={{
            textAlign: "center",
            fontFamily: "'EB Garamond', Georgia, serif",
            fontSize: "1.75rem",
            fontStyle: "italic",
            fontWeight: 500,
            color: "#111827",
            margin: "0 0 4px 0",
          }}
        >
          Auto-Fill Schedule & Courses (OCR)
        </h2>

        <p
          style={{
            textAlign: "center",
            fontSize: "0.86rem",
            color: "#6b7280",
            margin: "0 0 20px 0",
          }}
        >
          Upload your Certificate of Registration (COR), student load, or syllabus photo
        </p>

        {/* Double Line Divider */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ height: "1px", backgroundColor: "#374151", marginBottom: "2px" }} />
          <div style={{ height: "1px", backgroundColor: "#374151" }} />
        </div>

        {errorMsg && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              backgroundColor: "#fee2e2",
              color: "#b91c1c",
              fontSize: "0.85rem",
              marginBottom: "16px",
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* STAGE 1: File Upload Dropzone */}
        {stage === "upload" && (
          <div>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: isDragging ? "2px dashed #2563eb" : "2px dashed #9ca3af",
                backgroundColor: isDragging ? "#eff6ff" : "#f9fafb",
                borderRadius: "14px",
                padding: "36px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.15s ease",
                marginBottom: "18px",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />

              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "28px",
                  backgroundColor: "#e0f2fe",
                  color: "#0284c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "12px",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>

              <p style={{ margin: "0 0 4px 0", fontWeight: 500, fontSize: "0.95rem", color: "#111827" }}>
                Click to upload or drag & drop
              </p>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#6b7280" }}>
                Supports PDF, PNG, JPG, or JPEG
              </p>
            </div>

            {/* Quick Sample Button */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => processFile(undefined, true)}
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  border: "1.5px solid #374151",
                  backgroundColor: "#ffffff",
                  color: "#111827",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                Try with Sample COR (USTP Student Load)
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: Scanning & Processing State */}
        {stage === "scanning" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "48px 20px",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                border: "3px solid #e5e7eb",
                borderTopColor: "#111827",
                animation: "spin 0.8s linear infinite",
                marginBottom: "18px",
              }}
            />
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
            <h4 style={{ margin: "0 0 6px 0", fontSize: "1.15rem", fontWeight: 600, color: "#111827" }}>
              Reading & Extracting Document...
            </h4>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>
              Parsing course codes, names, rooms, days, and start/end times
            </p>
          </div>
        )}

        {/* STAGE 3: Review & Confirmation */}
        {stage === "review" && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "14px",
              }}
            >
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "12px",
                  backgroundColor: "#dcfce7",
                  color: "#15803d",
                  fontSize: "0.82rem",
                  fontWeight: 500,
                }}
              >
                ✓ Detected {extractedCourses.length} Courses
              </span>

              <button
                type="button"
                onClick={() => setStage("upload")}
                style={{
                  border: "none",
                  backgroundColor: "transparent",
                  color: "#2563eb",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Scan another document
              </button>
            </div>

            {/* Extracted Courses List */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                maxHeight: "360px",
                overflowY: "auto",
                paddingRight: "4px",
                marginBottom: "22px",
              }}
            >
              {extractedCourses.map((item, idx) => (
                <div
                  key={item.id || idx}
                  style={{
                    border: "1.5px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "14px 16px",
                    backgroundColor: "#fcfcfc",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                    position: "relative",
                  }}
                >
                  {/* Folder Thumbnail */}
                  <div style={{ width: "68px", flexShrink: 0, marginTop: "2px" }}>
                    <FolderCard
                      color={item.color}
                      courseName={item.course_code || item.course_name}
                      interactive={false}
                      size="sm"
                    />
                  </div>

                  {/* Form inputs */}
                  <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <div>
                      <label style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>Course Code</label>
                      <input
                        type="text"
                        value={item.course_code}
                        onChange={(e) => handleFieldChange(idx, "course_code", e.target.value)}
                        style={{
                          width: "100%",
                          height: "30px",
                          padding: "0 8px",
                          borderRadius: "6px",
                          border: "1px solid #d1d5db",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          backgroundColor: "#ffffff",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>Course Title</label>
                      <input
                        type="text"
                        value={item.course_name}
                        onChange={(e) => handleFieldChange(idx, "course_name", e.target.value)}
                        style={{
                          width: "100%",
                          height: "30px",
                          padding: "0 8px",
                          borderRadius: "6px",
                          border: "1px solid #d1d5db",
                          fontSize: "0.85rem",
                          backgroundColor: "#ffffff",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>Room Location</label>
                      <input
                        type="text"
                        value={item.room_location}
                        onChange={(e) => handleFieldChange(idx, "room_location", e.target.value)}
                        placeholder="Room Location"
                        style={{
                          width: "100%",
                          height: "30px",
                          padding: "0 8px",
                          borderRadius: "6px",
                          border: "1px solid #d1d5db",
                          fontSize: "0.85rem",
                          backgroundColor: "#ffffff",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>Instructor</label>
                      <input
                        type="text"
                        value={item.instructor_name}
                        onChange={(e) => handleFieldChange(idx, "instructor_name", e.target.value)}
                        placeholder="Instructor name"
                        style={{
                          width: "100%",
                          height: "30px",
                          padding: "0 8px",
                          borderRadius: "6px",
                          border: "1px solid #d1d5db",
                          fontSize: "0.85rem",
                          backgroundColor: "#ffffff",
                        }}
                      />
                    </div>

                    {/* Schedule info badge */}
                    <div style={{ gridColumn: "span 2", marginTop: "2px" }}>
                      <span style={{ fontSize: "0.75rem", color: "#4b5563" }}>
                        <strong>Schedule:</strong> {formatScheduleDisplay(item.schedules)}
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    title="Remove from import"
                    style={{
                      border: "none",
                      backgroundColor: "transparent",
                      color: "#9ca3af",
                      cursor: "pointer",
                      fontSize: "1rem",
                      padding: "2px 6px",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px" }}>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                style={{
                  padding: "8px 24px",
                  borderRadius: "8px",
                  border: "1.5px solid #374151",
                  backgroundColor: "#ffffff",
                  color: "#111827",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={isSubmitting || extractedCourses.length === 0}
                style={{
                  padding: "8px 36px",
                  borderRadius: "8px",
                  border: "1.5px solid #111827",
                  backgroundColor: "#ffe600",
                  color: "#111827",
                  fontSize: "0.92rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                }}
              >
                {isSubmitting ? "Importing..." : `Import ${extractedCourses.length} Courses to Schedule`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
