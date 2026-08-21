"use client";

export interface DesktopNotificationOptions {
  title: string;
  body: string;
  sound?: boolean;
}

/**
 * Triggers a native desktop pop-up notification on the user's screen.
 * - In Electron desktop: Dispatches via IPC to trigger native OS notification
 * - In Web browser: Uses the standard HTML5 Notification API (with permission)
 */
export function showDesktopNotification({
  title,
  body,
  sound = true,
}: DesktopNotificationOptions): boolean {
  if (typeof window === "undefined") return false;

  // 1. Electron Desktop App Native Notification
  const electronAPI = (window as any).electronAPI;
  if (electronAPI && typeof electronAPI.showNotification === "function") {
    try {
      electronAPI.showNotification({ title, body, sound });
      return true;
    } catch (err) {
      console.warn("Failed to trigger Electron notification:", err);
    }
  }

  // 2. Web Browser Native Notification (PWA / Browser fallback)
  if ("Notification" in window) {
    try {
      if (Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/icons/icon-192.png",
          silent: !sound,
        });
        return true;
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(title, {
              body,
              icon: "/icons/icon-192.png",
              silent: !sound,
            });
          }
        });
      }
    } catch (e) {
      console.warn("Web Notification error:", e);
    }
  }

  return false;
}
