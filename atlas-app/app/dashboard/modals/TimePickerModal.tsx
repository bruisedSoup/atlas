"use client";

import React, { useState } from "react";

interface TimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTime: string; // "18:00" (24h)
  onSelectTime: (timeStr: string) => void;
}

export function TimePickerModal({
  isOpen,
  onClose,
  selectedTime = "18:00",
  onSelectTime,
}: TimePickerModalProps) {
  // Parse initial 24h time to 12h + AM/PM
  const parseTime = (t: string) => {
    if (!t) return { hour: 6, minute: "00", period: "PM" };
    const [hStr, mStr] = t.split(":");
    let h = parseInt(hStr, 10);
    const m = mStr || "00";
    const p = h >= 12 ? "PM" : "AM";
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;
    return { hour: h, minute: m, period: p };
  };

  const parsed = parseTime(selectedTime);
  const [selectedHour, setSelectedHour] = useState(parsed.hour);
  const [selectedMinute, setSelectedMinute] = useState(parsed.minute);
  const [selectedPeriod, setSelectedPeriod] = useState(parsed.period);

  if (!isOpen) return null;

  const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const minutes = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

  const handleSave = () => {
    let h = selectedHour;
    if (selectedPeriod === "PM" && h < 12) h += 12;
    if (selectedPeriod === "AM" && h === 12) h = 0;
    const formatted = `${String(h).padStart(2, "0")}:${selectedMinute}`;
    onSelectTime(formatted);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 80,
        padding: "16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "360px",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "24px 22px",
          boxShadow: "0 20px 30px rgba(0,0,0,0.15)",
          border: "1.5px solid #374151",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Header Title */}
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <span
            style={{
              fontFamily: "'EB Garamond', Georgia, serif",
              fontSize: "1.35rem",
              fontWeight: 600,
              fontStyle: "italic",
              color: "#111827",
            }}
          >
            Set Time
          </span>
        </div>

        {/* Big Alarm Digital Display */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            background: "#f9fafb",
            borderRadius: "12px",
            padding: "12px 16px",
            marginBottom: "20px",
            border: "1px solid #e5e7eb",
          }}
        >
          <span
            style={{
              fontFamily: "'EB Garamond', Georgia, serif",
              fontSize: "2.2rem",
              fontWeight: 600,
              color: "#111827",
            }}
          >
            {selectedHour}:{selectedMinute}
          </span>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginLeft: "12px" }}>
            <button
              type="button"
              onClick={() => setSelectedPeriod("AM")}
              style={{
                padding: "2px 8px",
                borderRadius: "4px",
                border: "none",
                background: selectedPeriod === "AM" ? "#111827" : "#e5e7eb",
                color: selectedPeriod === "AM" ? "#ffffff" : "#4b5563",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              AM
            </button>
            <button
              type="button"
              onClick={() => setSelectedPeriod("PM")}
              style={{
                padding: "2px 8px",
                borderRadius: "4px",
                border: "none",
                background: selectedPeriod === "PM" ? "#111827" : "#e5e7eb",
                color: selectedPeriod === "PM" ? "#ffffff" : "#4b5563",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              PM
            </button>
          </div>
        </div>

        {/* Hours Selector Row/Grid */}
        <div style={{ marginBottom: "14px" }}>
          <label style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 600, display: "block", marginBottom: "6px" }}>
            HOUR
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "6px" }}>
            {hours.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setSelectedHour(h)}
                style={{
                  height: "32px",
                  borderRadius: "6px",
                  border: selectedHour === h ? "1.5px solid #111827" : "1px solid #e5e7eb",
                  background: selectedHour === h ? "#111827" : "#ffffff",
                  color: selectedHour === h ? "#ffffff" : "#1f2937",
                  fontSize: "0.85rem",
                  fontWeight: selectedHour === h ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* Minutes Selector Row/Grid */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 600, display: "block", marginBottom: "6px" }}>
            MINUTE
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "6px" }}>
            {minutes.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMinute(m)}
                style={{
                  height: "32px",
                  borderRadius: "6px",
                  border: selectedMinute === m ? "1.5px solid #111827" : "1px solid #e5e7eb",
                  background: selectedMinute === m ? "#111827" : "#ffffff",
                  color: selectedMinute === m ? "#ffffff" : "#1f2937",
                  fontSize: "0.85rem",
                  fontWeight: selectedMinute === m ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              height: "38px",
              borderRadius: "8px",
              background: "#f4f4f5",
              border: "none",
              color: "#374151",
              fontSize: "0.85rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              flex: 1,
              height: "38px",
              borderRadius: "8px",
              background: "#111827",
              border: "none",
              color: "#ffffff",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Set Time
          </button>
        </div>
      </div>
    </div>
  );
}
