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

  if (!isOpen) return null;

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
      {/* Outer Glowing / Warm Frame matching Image 2 */}
      <div
        style={{
          width: "100%",
          maxWidth: "340px",
          backgroundColor: "#fef9c3", // Yellow light glow outer border
          borderRadius: "28px",
          padding: "10px",
          boxShadow: "0 20px 30px rgba(0,0,0,0.15)",
        }}
      >
        {/* Inner Card */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            padding: "20px 22px 24px",
            border: "1.5px dashed #fde047",
          }}
        >
          {/* Header: Edit Link (left) & Confirm Button (right) */}
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
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#111827",
                textDecoration: "underline",
                cursor: "pointer",
                padding: "2px 4px",
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
                borderRadius: "16px",
                padding: "4px 18px",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#111827",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                transition: "all 0.15s ease",
              }}
            >
              Confirm
            </button>
          </div>

          {/* New Label Input Form */}
          <form onSubmit={handleAdd} style={{ position: "relative", marginBottom: "14px" }}>
            <input
              type="text"
              placeholder="New label"
              value={newLabelText}
              onChange={(e) => setNewLabelText(e.target.value)}
              style={{
                width: "100%",
                height: "36px",
                padding: "0 34px 0 10px",
                border: "none",
                borderBottom: "1.5px solid #4b5563",
                fontSize: "0.95rem",
                fontFamily: "'Inter', sans-serif",
                color: "#111827",
                outline: "none",
              }}
            />
            <button
              type="submit"
              title="Add new label"
              style={{
                position: "absolute",
                right: "4px",
                top: "6px",
                background: "none",
                border: "none",
                fontSize: "1.25rem",
                color: "#9ca3af",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              +
            </button>
          </form>

          {/* Label List with Dashed Cyan Horizontal Lines */}
          <div
            style={{
              maxHeight: "220px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {labels.length === 0 ? (
              <p style={{ fontSize: "0.85rem", color: "#9ca3af", textAlign: "center", padding: "16px 0" }}>
                No custom labels yet. Add one above!
              </p>
            ) : (
              labels.map((lbl, idx) => {
                const isSelected = currentSelected === lbl.name;
                return (
                  <div
                    key={lbl.id || lbl.name || idx}
                    style={{
                      borderBottom: "1.5px dashed #93c5fd",
                      padding: "10px 4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      backgroundColor: isSelected ? "#eff6ff" : "transparent",
                      borderRadius: isSelected ? "6px" : "0",
                      transition: "background 0.15s ease",
                    }}
                    onClick={() => {
                      if (!isEditMode) {
                        setCurrentSelected(lbl.name);
                      }
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.95rem",
                        fontWeight: isSelected ? 600 : 500,
                        color: isSelected ? "#1d4ed8" : "#1f2937",
                      }}
                    >
                      {lbl.name}
                    </span>

                    {/* Edit mode: Delete button */}
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
                          fontSize: "1rem",
                          cursor: "pointer",
                          padding: "2px 6px",
                        }}
                      >
                        ✕
                      </button>
                    ) : isSelected ? (
                      <span style={{ color: "#1d4ed8", fontSize: "0.9rem" }}>✓</span>
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
