"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser, UserProfileData } from "@/app/context/UserContext";
import { BackButton } from "@/app/src/components/BackButton";

export type { UserProfileData };

interface ProfileModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  profile?: UserProfileData | null;
  onSaveProfile?: (updated: Partial<UserProfileData>) => Promise<void>;
  onAvatarUpload?: (file: File) => Promise<string | void> | void;
}

export function ProfileModal(props: ProfileModalProps) {
  const context = useUser();

  const isOpen = props.isOpen !== undefined ? props.isOpen : context.isProfileModalOpen;
  const onClose = props.onClose || context.closeProfileModal;
  const profile = props.profile !== undefined ? props.profile : context.userProfile;
  const onSaveProfile = props.onSaveProfile || context.saveProfile;
  const onAvatarUpload = props.onAvatarUpload;

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setAvatarUrl(previewUrl);

      if (onAvatarUpload) {
        const uploadedUrl = await onAvatarUpload(file);
        if (typeof uploadedUrl === "string") {
          setAvatarUrl(uploadedUrl);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveProfile({
        full_name: fullName.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl,
      });
      onClose();
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 80,
        padding: "16px",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "#ffffff",
          borderRadius: "14px",
          padding: "28px 36px 32px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          position: "relative",
          animation: "modalFadeIn 0.15s ease-out",
        }}
      >
        {/* Top Bar: Back Button & Title */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <BackButton onClick={onClose} label="Back" variant="blue" />

          <h2
            style={{
              fontFamily: "'EB Garamond', Georgia, serif",
              fontSize: "1.75rem",
              fontStyle: "italic",
              fontWeight: 500,
              color: "#111827",
              textAlign: "center",
              flex: 1,
              marginRight: "60px",
            }}
          >
            My Profile
          </h2>
        </div>

        {/* Top Double Line Border */}
        <div style={{ marginBottom: "22px" }}>
          <div style={{ height: "1.5px", background: "#4b5563", marginBottom: "3px" }} />
          <div style={{ height: "1.5px", background: "#4b5563" }} />
        </div>

        {/* Center Avatar Preview & Upload */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "20px" }}>
          <div
            onClick={() => fileInputRef.current?.click()}
            title="Click to change photo"
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "16px",
              border: "1.5px solid #374151",
              overflow: "hidden",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f9fafb",
              boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
              marginBottom: "8px",
            }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            )}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: "none",
              border: "none",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.8rem",
              fontWeight: 500,
              color: "#2563eb",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            Change Photo
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Full Name */}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "#1f2937", marginBottom: "6px", fontFamily: "'Inter', sans-serif" }}>
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              style={{
                width: "100%",
                height: "40px",
                padding: "0 14px",
                borderRadius: "8px",
                border: "1.5px solid #4b5563",
                background: "#ffffff",
                fontSize: "0.95rem",
                fontFamily: "'EB Garamond', Georgia, serif",
                color: "#111827",
                outline: "none",
              }}
            />
          </div>

          {/* Email (Read only) */}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "#1f2937", marginBottom: "6px", fontFamily: "'Inter', sans-serif" }}>
              Gmail / Email
            </label>
            <input
              type="email"
              disabled
              value={profile?.email || ""}
              style={{
                width: "100%",
                height: "40px",
                padding: "0 14px",
                borderRadius: "8px",
                border: "1.5px solid #d1d5db",
                background: "#f3f4f6",
                fontSize: "0.9rem",
                fontFamily: "'Inter', sans-serif",
                color: "#6b7280",
                cursor: "not-allowed",
              }}
            />
          </div>

          {/* Bio / Motto Field */}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "#1f2937", marginBottom: "6px", fontFamily: "'Inter', sans-serif" }}>
              Bio / Motto
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Add user bio"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1.5px solid #4b5563",
                background: "#ffffff",
                fontSize: "0.95rem",
                fontFamily: "'EB Garamond', Georgia, serif",
                color: "#111827",
                outline: "none",
                resize: "none",
              }}
            />
          </div>

          {/* Bottom Double Line Border */}
          <div style={{ margin: "4px 0" }}>
            <div style={{ height: "1.5px", background: "#4b5563", marginBottom: "3px" }} />
            <div style={{ height: "1.5px", background: "#4b5563" }} />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            style={{
              width: "100%",
              height: "42px",
              background: "#facc15",
              color: "#111827",
              border: "1.5px solid #4b5563",
              borderRadius: "8px",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              transition: "background 0.15s ease",
            }}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
