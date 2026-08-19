"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface PWAContextType {
  isStandalone: boolean;
  isInstallable: boolean;
  installApp: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType>({
  isStandalone: false,
  isInstallable: false,
  installApp: async () => {},
});

export const usePWA = () => useContext(PWAContext);

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSBanner, setShowIOSBanner] = useState(false);
  const [showAndroidBanner, setShowAndroidBanner] = useState(false);

  useEffect(() => {
    // 1. Check if launched in standalone / fullscreen PWA mode
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsStandalone(isStandaloneMode);

    // 2. Register Service Worker in production / supported environments
    if ("serviceWorker" in navigator && typeof window !== "undefined") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] Service Worker registered:", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA] Service Worker registration failed:", err);
        });
    }

    // If already in standalone mode, do not show install banners
    if (isStandaloneMode) return;

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);

    const bannerDismissed = sessionStorage.getItem("atlas_pwa_banner_dismissed");

    if (isIOS && isSafari && !bannerDismissed) {
      setShowIOSBanner(true);
    }

    // 4. Listen for Chromium beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!bannerDismissed) {
        setShowAndroidBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setShowAndroidBanner(false);
        setDeferredPrompt(null);
      }
    } catch (err) {
      console.error("[PWA] Error prompting install:", err);
    }
  };

  const dismissBanner = () => {
    setShowIOSBanner(false);
    setShowAndroidBanner(false);
    sessionStorage.setItem("atlas_pwa_banner_dismissed", "true");
  };

  return (
    <PWAContext.Provider
      value={{
        isStandalone,
        isInstallable: !!deferredPrompt,
        installApp,
      }}
    >
      {children}

      {/* Floating Add to Home Screen Prompt (iOS) */}
      {showIOSBanner && (
        <div
          role="dialog"
          aria-label="Install Atlas"
          style={{
            position: "fixed",
            bottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
            left: "16px",
            right: "16px",
            maxWidth: "420px",
            margin: "0 auto",
            backgroundColor: "#1c1c1e",
            color: "#ffffff",
            borderRadius: "16px",
            padding: "16px 18px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)",
            zIndex: 99999,
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            fontFamily: "system-ui, -apple-system, sans-serif",
            animation: "fadeInUp 0.3s ease-out",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img
                src="/icons/icon-192.png"
                alt="Atlas Icon"
                style={{ width: "36px", height: "36px", borderRadius: "8px" }}
              />
              <div>
                <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 600 }}>Install Atlas</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>
                  Launch full-screen from your Home Screen
                </p>
              </div>
            </div>
            <button
              onClick={dismissBanner}
              style={{
                background: "transparent",
                border: "none",
                color: "#9ca3af",
                fontSize: "18px",
                cursor: "pointer",
                padding: "4px 8px",
              }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.4", color: "#d1d5db" }}>
            Tap the <span style={{ fontWeight: 600, color: "#38bdf8" }}>Share button [⎋ / ↑]</span> in Safari and select{" "}
            <span style={{ fontWeight: 600, color: "#ffffff" }}>“Add to Home Screen” [+]</span> for the full-screen app experience.
          </p>
        </div>
      )}

      {/* Floating Add to Home Screen Prompt (Android / Chrome) */}
      {showAndroidBanner && (
        <div
          role="dialog"
          aria-label="Install Atlas"
          style={{
            position: "fixed",
            bottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
            left: "16px",
            right: "16px",
            maxWidth: "420px",
            margin: "0 auto",
            backgroundColor: "#1c1c1e",
            color: "#ffffff",
            borderRadius: "16px",
            padding: "16px 18px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            fontFamily: "system-ui, -apple-system, sans-serif",
            animation: "fadeInUp 0.3s ease-out",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src="/icons/icon-192.png"
              alt="Atlas Icon"
              style={{ width: "36px", height: "36px", borderRadius: "8px" }}
            />
            <div>
              <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 600 }}>Install Atlas</h4>
              <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>
                Add to home screen for full-screen mode
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={dismissBanner}
              style={{
                background: "transparent",
                border: "none",
                color: "#9ca3af",
                fontSize: "13px",
                cursor: "pointer",
                padding: "6px 8px",
              }}
            >
              Later
            </button>
            <button
              onClick={installApp}
              style={{
                background: "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Install
            </button>
          </div>
        </div>
      )}
    </PWAContext.Provider>
  );
}
