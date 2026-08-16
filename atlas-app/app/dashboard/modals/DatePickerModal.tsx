"use client";

import React, { useState } from "react";

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // ISO format "YYYY-MM-DD"
  onSelectDate: (dateStr: string) => void;
}

export function DatePickerModal({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
}: DatePickerModalProps) {
  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  const [viewYear, setViewYear] = useState(
    isNaN(initialDate.getFullYear()) ? new Date().getFullYear() : initialDate.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    isNaN(initialDate.getMonth()) ? new Date().getMonth() : initialDate.getMonth()
  );

  if (!isOpen) return null;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();

  const handlePickDay = (day: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const dateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;
    onSelectDate(dateStr);
    onClose();
  };

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: firstDayIndex }, (_, i) => i);

  // Check if a day is the selected date
  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const [y, m, d] = selectedDate.split("-").map(Number);
    return y === viewYear && m === viewMonth + 1 && d === day;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day
    );
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
        {/* Month & Year Header with Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "18px",
          }}
        >
          <button
            type="button"
            onClick={prevMonth}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "1rem",
              color: "#374151",
            }}
          >
            ‹
          </button>

          <span
            style={{
              fontFamily: "'EB Garamond', Georgia, serif",
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "#111827",
            }}
          >
            {monthNames[viewMonth]} {viewYear}
          </span>

          <button
            type="button"
            onClick={nextMonth}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "1rem",
              color: "#374151",
            }}
          >
            ›
          </button>
        </div>

        {/* Days of Week Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "4px",
            textAlign: "center",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#9ca3af",
            marginBottom: "8px",
          }}
        >
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>

        {/* Calendar Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "4px",
          }}
        >
          {paddingArray.map((p) => (
            <div key={`pad-${p}`} style={{ height: "36px" }} />
          ))}

          {daysArray.map((day) => {
            const selected = isSelected(day);
            const today = isToday(day);

            return (
              <button
                key={day}
                type="button"
                onClick={() => handlePickDay(day)}
                style={{
                  height: "36px",
                  borderRadius: "8px",
                  border: selected ? "1.5px solid #111827" : today ? "1px solid #93c5fd" : "none",
                  background: selected ? "#111827" : today ? "#eff6ff" : "transparent",
                  color: selected ? "#ffffff" : "#1f2937",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.85rem",
                  fontWeight: selected || today ? 600 : 400,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease",
                }}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Cancel Button */}
        <div style={{ marginTop: "18px", display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "4px 14px",
              borderRadius: "6px",
              background: "#f4f4f5",
              border: "none",
              color: "#374151",
              fontSize: "0.8rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
