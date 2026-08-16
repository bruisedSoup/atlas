"use client";

import React, { useState } from "react";

export interface CustomLabelItem {
  id?: string;
  name: string;
}

interface CustomLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  labels: CustomLabelItem[];
  selectedLabel: string;
  onSelectLabel: (labelName: string) => void;
  onAddLabel: (labelName: string) => Promise<void> | void;
  onDeleteLabel: (label: CustomLabelItem) => Promise<void> | void;
}

const DEFAULT_PRESET_LABELS = ["heh", "clearance", "+1", "gamedev"];

export function CustomLabelModal({
  isOpen,
  onClose,
  labels = [],
  selectedLabel = "",
  onSelectLabel,
  onAddLabel,
  onDeleteLabel,
}: CustomLabelModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [newLabelText, setNewLabelText] = useState("");
  const [currentSelected, setCurrentSelected] = useState(selectedLabel || "heh");

  if (!isOpen) return null;

  // Use user labels or fallback to initial presets from mockup
  const displayLabels: CustomLabelItem[] =
    labels.length > 0
      ? labels
      : DEFAULT_PRESET_LABELS.map((name) => ({ name }));

  const handleAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newLabelText.trim();
    if (!trimmed) return;

    await onAddLabel(trimmed);
    setCurrentSelected(trimmed);
    setNewLabelText("");
  };

  const handleConfirm = () => {
    if (currentSelected) {
      onSelectLabel(currentSelected);
    }
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 70,
        padding: "16px",
      }}
    >
      {/* Outer Thick Yellow Glow Frame (matching Image 2) */}
      <div
        style={{
          width: "100%",
          maxWidth: "360px",
          backgroundColor: "#fef08a", // Vibrant light yellow outer rim
          borderRadius: "36px",
          padding: "14px",
          boxShadow: "0 20px 35px rgba(0,0,0,0.18)",
        }}
      >
        {/* Inner Card with Pink Dashed Border */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "24px",
            padding: "20px 22px 24px",
            border: "1.5px dashed #f472b6", // Pink dashed line inside yellow frame
          }}
        >
          {/* Header Row: Edit Link (left) & Confirm Button (right) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <button
              type="button"
              onClick={() => setIsEditMode(!isEditMode)}
              style={{
                background: "none",
                border: "none",
                fontFamily: "'Inter', sans-serif",
                fontSize: "1rem",
                fontWeight: 600,
                color: "#111827",
                textDecoration: "underline",
                cursor: "pointer",
                padding: "2px 0",
              }}
            >
              {isEditMode ? "Done" : "Edit"}
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              style={{
                background: "#ffffff",
                border: "1.5px solid #111827",
                borderRadius: "20px",
                padding: "4px 20px",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#111827",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                transition: "all 0.15s ease",
              }}
            >
              Confirm
            </button>
          </div>

          {/* Solid Line Above New Label Input */}
          <div style={{ height: "1.5px", backgroundColor: "#374151", marginBottom: "8px" }} />

          {/* New Label Input Form (Clean transparent line between borders) */}
          <form
            onSubmit={handleAdd}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              height: "36px",
              marginBottom: "8px",
            }}
          >
            <input
              type="text"
              placeholder="New label"
              value={newLabelText}
              onChange={(e) => setNewLabelText(e.target.value)}
              style={{
                width: "100%",
                height: "100%",
                padding: "0 32px 0 2px",
                border: "none",
                background: "transparent",
                fontSize: "1rem",
                fontFamily: "'Inter', sans-serif",
                color: "#111827",
                outline: "none",
              }}
            />
            <button
              type="submit"
              title="Add label"
              style={{
                position: "absolute",
                right: "0px",
                top: "2px",
                background: "none",
                border: "none",
                fontSize: "1.45rem",
                fontWeight: 300,
                color: "#9ca3af",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
              }}
            >
              +
            </button>
          </form>

          {/* Solid Line Below New Label Input */}
          <div style={{ height: "1.5px", backgroundColor: "#374151", marginBottom: "4px" }} />

          {/* Label Items List separated by Dashed Light-Blue Lines */}
          <div
            style={{
              maxHeight: "240px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {displayLabels.map((lbl, idx) => {
              const isSelected = currentSelected === lbl.name;

              return (
                <div
                  key={lbl.id || lbl.name || idx}
                  onClick={() => {
                    if (!isEditMode) {
                      setCurrentSelected(lbl.name);
                    }
                  }}
                  style={{
                    borderBottom: "1.5px dashed #93c5fd", // Light blue dashed separator
                    padding: "12px 2px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    backgroundColor: isSelected ? "#eff6ff" : "transparent",
                    transition: "background 0.15s ease",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "1rem",
                      fontWeight: isSelected ? 600 : 500,
                      color: isSelected ? "#1d4ed8" : "#111827",
                    }}
                  >
                    {lbl.name}
                  </span>

                  {/* Edit mode: Delete cross button */}
                  {isEditMode ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteLabel(lbl);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        fontSize: "1.1rem",
                        cursor: "pointer",
                        padding: "0 4px",
                      }}
                    >
                      ✕
                    </button>
                  ) : isSelected ? (
                    <span style={{ color: "#1d4ed8", fontSize: "0.95rem", fontWeight: 700 }}>✓</span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
