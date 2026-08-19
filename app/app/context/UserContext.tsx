"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { realtimeService, RealtimeMessage } from "@/app/src/services/realtime";

export interface UserProfileData {
  id?: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
}

interface UserContextType {
  userProfile: UserProfileData | null;
  accessToken: string;
  getFreshToken: () => Promise<string>;
  loading: boolean;
  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  saveProfile: (updated: Partial<UserProfileData>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [accessToken, setAccessToken] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const supabase = createClient();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchProfile = useCallback(
    async (token: string, sessionUser: any) => {
      const userMeta = sessionUser?.user_metadata || {};
      const identities = sessionUser?.identities || [];
      const identityData = identities[0]?.identity_data || {};

      const googleAvatar =
        userMeta.avatar_url ||
        userMeta.picture ||
        identityData.avatar_url ||
        identityData.picture ||
        "";

      const googleName =
        userMeta.full_name ||
        userMeta.name ||
        identityData.full_name ||
        identityData.name ||
        "Isabella Gonzales";

      try {
        const res = await fetch(`${apiUrl}/api/auth/session/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();
          const profile = data.user || {};
          if (!profile.avatar_url && googleAvatar) {
            profile.avatar_url = googleAvatar;
          }
          if (!profile.full_name && googleName) {
            profile.full_name = googleName;
          }
          setUserProfile(profile);
          try {
            localStorage.setItem("atlas_user_profile", JSON.stringify(profile));
          } catch {}
        } else {
          const fallbackProfile = {
            id: sessionUser?.id,
            email: sessionUser?.email || "",
            full_name: googleName,
            avatar_url: googleAvatar,
          };
          setUserProfile(fallbackProfile);
          try {
            localStorage.setItem("atlas_user_profile", JSON.stringify(fallbackProfile));
          } catch {}
        }
      } catch {
        const fallbackProfile = {
          id: sessionUser?.id,
          email: sessionUser?.email || "",
          full_name: googleName,
          avatar_url: googleAvatar,
        };
        setUserProfile(fallbackProfile);
        try {
          localStorage.setItem("atlas_user_profile", JSON.stringify(fallbackProfile));
        } catch {}
      } finally {
        setLoading(false);
      }
    },
    [apiUrl]
  );

  useEffect(() => {
    // 0ms instant render from cache
    try {
      const cached = localStorage.getItem("atlas_user_profile");
      if (cached) {
        setUserProfile(JSON.parse(cached));
      }
    } catch {}

    async function initAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      setAccessToken(session.access_token);
      await fetchProfile(session.access_token, session.user);

      // Initialize Dual WebSocket (Django Channels + Supabase Realtime)
      realtimeService.init(session.access_token, session.user.id);
    }

    initAuth();

    // Listen for auth state changes (token refresh, sign in, sign out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.access_token) {
        setAccessToken(session.access_token);
        if (session.user?.id) {
          realtimeService.init(session.access_token, session.user.id);
        }
      } else if (event === "SIGNED_OUT") {
        setAccessToken("");
        setUserProfile(null);
        try {
          localStorage.removeItem("atlas_user_profile");
          localStorage.removeItem("atlas_cached_tasks");
        } catch {}
      }
    });

    // Listen for real-time profile updates across tabs/devices
    const unsubProfile = realtimeService.on("PROFILE_UPDATED", (msg: RealtimeMessage) => {
      if (msg.payload) {
        setUserProfile((prev) => {
          const next = prev ? { ...prev, ...msg.payload } : { ...msg.payload };
          try {
            localStorage.setItem("atlas_user_profile", JSON.stringify(next));
          } catch {}
          return next;
        });
      }
    });

    return () => {
      subscription?.unsubscribe();
      unsubProfile();
    };
  }, [supabase, fetchProfile]);

  const getFreshToken = useCallback(async (): Promise<string> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        setAccessToken(session.access_token);
        return session.access_token;
      }
    } catch {}
    return accessToken;
  }, [supabase, accessToken]);

  const saveProfile = async (updated: Partial<UserProfileData>) => {
    const token = await getFreshToken();
    if (!token) return;

    // Optimistically update everywhere in real-time
    setUserProfile((prev) => {
      const next = prev ? { ...prev, ...updated } : { ...updated };
      try {
        localStorage.setItem("atlas_user_profile", JSON.stringify(next));
      } catch {}
      return next;
    });

    // Broadcast real-time event across tabs & WebSocket
    realtimeService.broadcast("PROFILE_UPDATED", updated);

    try {
      const res = await fetch(`${apiUrl}/api/users/profile/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updated),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUserProfile(data.user);
          try {
            localStorage.setItem("atlas_user_profile", JSON.stringify(data.user));
          } catch {}
          realtimeService.broadcast("PROFILE_UPDATED", data.user);
        }
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
    }
  };

  const refreshProfile = async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${apiUrl}/api/users/profile/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUserProfile(data.user);
        }
      }
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
  };

  return (
    <UserContext.Provider
      value={{
        userProfile,
        accessToken,
        getFreshToken,
        loading,
        isProfileModalOpen,
        openProfileModal: () => setIsProfileModalOpen(true),
        closeProfileModal: () => setIsProfileModalOpen(false),
        saveProfile,
        refreshProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
