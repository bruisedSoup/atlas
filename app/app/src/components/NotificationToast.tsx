"use client";

import React, { useState, useEffect } from "react";
import { realtimeService } from "@/app/src/services/realtime";

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type?: "reminder" | "success" | "info";
  timestamp?: number;
}

export function NotificationToast() {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  useEffect(() => {
    // Listen for WebSocket notifications
    const unsubscribe = realtimeService.on("NOTIFICATION", (msg) => {
      const data = msg.payload;
      const newToast: ToastNotification = {
        id: `toast-${Date.now()}-${Math.random()}`,
        title: data.title || "Atlas Notification",
        message: data.message || "",
        type: data.notification_type === "deadline_reminder" ? "reminder" : "info",
        timestamp: Date.now(),
      };

      setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

      // Auto dismiss after 7 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 7000);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        pointerEvents: "none",
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            pointerEvents: "auto",
            minWidth: "320px",
            maxWidth: "420px",
            background: "#ffffff",
            border: "1.5px solid #e5e7eb",
            borderRadius: "12px",
            padding: "14px 18px",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.12), 0 8px 10px -6px rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            animation: "toastSlideIn 0.2s ease-out",
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: toast.type === "reminder" ? "#fef3c7" : "#e0f2fe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: toast.type === "reminder" ? "#d97706" : "#0284c7",
              fontSize: "1.1rem",
            }}
          >
            {toast.type === "reminder" ? "⏰" : "🔔"}
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4
              style={{
                margin: "0 0 2px 0",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#111827",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {toast.title}
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: "0.825rem",
                color: "#4b5563",
                fontFamily: "'Inter', sans-serif",
                lineHeight: "1.4",
              }}
            >
              {toast.message}
            </p>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9ca3af",
              padding: "2px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
