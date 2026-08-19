"use client";

import React, { useState, useEffect, useRef } from "react";

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
  const [currentSelected, setCurrentSelected] = useState(selectedLabel);
  const [localLabels, setLocalLabels] = useState<CustomLabelItem[]>(labels);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentSelected(selectedLabel);
  }, [selectedLabel, isOpen]);

  useEffect(() => {
    setLocalLabels(labels);
  }, [labels]);

  if (!isOpen) return null;

  const handleAdd = async () => {
    const trimmed = newLabelText.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }

    // Optimistically add to local state immediately
    const tempItem: CustomLabelItem = { id: `temp-${Date.now()}`, name: trimmed };
    if (!localLabels.some((l) => l.name.toLowerCase() === trimmed.toLowerCase())) {
      setLocalLabels((prev) => [...prev, tempItem]);
    }
    setCurrentSelected(trimmed);
    setNewLabelText("");

    // Sync to backend
    try {
      await onAddLabel(trimmed);
    } catch (err) {
      console.error("Failed to add label:", err);
    }
  };

  const handleDelete = async (lbl: CustomLabelItem) => {
    // Optimistically remove from local state immediately
    setLocalLabels((prev) => prev.filter((l) => l.name !== lbl.name && l.id !== lbl.id));
    if (currentSelected === lbl.name) {
      setCurrentSelected("");
    }

    // Sync to backend
    try {
      await onDeleteLabel(lbl);
    } catch (err) {
      console.error("Failed to delete label:", err);
    }
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
                color: isEditMode ? "#ef4444" : "#111827",
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

          {/* New Label Input Form */}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              height: "38px",
              marginBottom: "8px",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="New label"
              value={newLabelText}
              onChange={(e) => setNewLabelText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAdd();
                }
              }}
              style={{
                width: "100%",
                height: "100%",
                padding: "0 34px 0 2px",
                border: "none",
                background: "transparent",
                fontSize: "1rem",
                fontFamily: "'Inter', sans-serif",
                color: "#111827",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAdd();
              }}
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
          </div>

          {/* Solid Line Below New Label Input */}
          <div style={{ height: "1.5px", backgroundColor: "#374151", marginBottom: "4px" }} />

          {/* Dynamic Label Items List */}
          <div
            style={{
              maxHeight: "240px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {localLabels.length === 0 ? (
              <div
                style={{
                  padding: "28px 4px",
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: "0.875rem",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                No custom labels yet.
                <br />
                Add one above!
              </div>
            ) : (
              localLabels.map((lbl, idx) => {
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
                      cursor: isEditMode ? "default" : "pointer",
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
                          handleDelete(lbl);
                        }}
                        style={{
                          background: "#fee2e2",
                          border: "1px solid #fca5a5",
                          borderRadius: "6px",
                          color: "#ef4444",
                          fontSize: "0.9rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          padding: "2px 8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        ✕
                      </button>
                    ) : isSelected ? (
                      <span style={{ color: "#1d4ed8", fontSize: "0.95rem", fontWeight: 700 }}>✓</span>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
