"use client";

import { createClient } from "@/lib/supabase/client";

export type RealtimeEventType =
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "TASK_DELETED"
  | "TASK_COMPLETED"
  | "TASK_RESTORED"
  | "LABEL_CREATED"
  | "LABEL_DELETED"
  | "PROFILE_UPDATED"
  | "NOTIFICATION"
  | "DEADLINE_REMINDER";

export interface RealtimeMessage {
  event: RealtimeEventType | string;
  payload: any;
  timestamp?: string;
  source?: "supabase" | "django_ws" | "broadcast";
}

type EventCallback = (message: RealtimeMessage) => void;

class AtlasRealtimeService {
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private ws: WebSocket | null = null;
  private supabaseChannel: any = null;
  private reconnectTimeout: any = null;
  private pingInterval: any = null;
  private currentToken: string = "";
  private currentUserId: string = "";

  public init(token: string, userId: string) {
    if (!token || (this.currentToken === token && this.ws?.readyState === WebSocket.OPEN)) {
      return;
    }

    this.currentToken = token;
    this.currentUserId = userId;

    this.connectDjangoWebSocket(token);
    this.connectSupabaseRealtime(userId);
  }

  public disconnect() {
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.supabaseChannel) {
      const supabase = createClient();
      supabase.removeChannel(this.supabaseChannel);
      this.supabaseChannel = null;
    }
  }

  // 1. Django Channels ASGI WebSocket
  private connectDjangoWebSocket(token: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const wsProtocol = apiUrl.startsWith("https") ? "wss:" : "ws:";
    const host = apiUrl.replace(/^https?:\/\//, "");
    const wsUrl = `${wsProtocol}//${host}/ws/realtime/?token=${encodeURIComponent(token)}`;

    try {
      if (this.ws) {
        this.ws.close();
      }

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("🟢 [Atlas Realtime] Django WebSocket connected");
        // Start ping heartbeat
        if (this.pingInterval) clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ action: "ping", timestamp: Date.now() }));
          }
        }, 30000);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "pong" || data.type === "connection_established") {
            return;
          }

          if (data.type === "notification") {
            this.dispatch({
              event: "NOTIFICATION",
              payload: data,
              source: "django_ws",
              timestamp: data.timestamp,
            });
            return;
          }

          if (data.type === "realtime_event") {
            this.dispatch({
              event: data.event,
              payload: data.payload,
              source: "django_ws",
              timestamp: data.timestamp,
            });
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      this.ws.onerror = (err) => {
        console.warn("⚠️ [Atlas Realtime] WebSocket connection error:", err);
      };

      this.ws.onclose = (event) => {
        if (this.pingInterval) clearInterval(this.pingInterval);
        if (!event.wasClean) {
          // Reconnect with backoff
          this.reconnectTimeout = setTimeout(() => {
            if (this.currentToken) {
              this.connectDjangoWebSocket(this.currentToken);
            }
          }, 4000);
        }
      };
    } catch (err) {
      console.error("WebSocket initialization error:", err);
    }
  }

  // 2. Supabase Realtime Channel
  private connectSupabaseRealtime(userId: string) {
    try {
      const supabase = createClient();
      const channelName = `atlas_user_${userId || "global"}`;

      if (this.supabaseChannel) {
        supabase.removeChannel(this.supabaseChannel);
      }

      this.supabaseChannel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "tasks" },
          (payload: any) => {
            const eventType =
              payload.eventType === "INSERT"
                ? "TASK_CREATED"
                : payload.eventType === "DELETE"
                ? "TASK_DELETED"
                : "TASK_UPDATED";

            this.dispatch({
              event: eventType,
              payload: payload.new || payload.old,
              source: "supabase",
            });
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "custom_labels" },
          (payload: any) => {
            this.dispatch({
              event: payload.eventType === "INSERT" ? "LABEL_CREATED" : "LABEL_DELETED",
              payload: payload.new || payload.old,
              source: "supabase",
            });
          }
        )
        .on("broadcast", { event: "atlas_sync" }, (payload: any) => {
          if (payload?.payload) {
            this.dispatch({
              event: payload.payload.event,
              payload: payload.payload.payload,
              source: "broadcast",
            });
          }
        })
        .subscribe((status: string) => {
          if (status === "SUBSCRIBED") {
            console.log("🟢 [Atlas Realtime] Supabase Realtime channel subscribed");
          }
        });
    } catch (err) {
      console.error("Failed to connect Supabase Realtime:", err);
    }
  }

  // Broadcast to other tabs/clients
  public broadcast(event: RealtimeEventType, payload: any) {
    // 1. Dispatch locally
    this.dispatch({ event, payload, source: "broadcast" });

    // 2. Broadcast via Supabase channel
    if (this.supabaseChannel) {
      this.supabaseChannel.send({
        type: "broadcast",
        event: "atlas_sync",
        payload: { event, payload },
      });
    }

    // 3. Broadcast via Django WebSocket
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          action: "broadcast_event",
          event,
          payload,
        })
      );
    }
  }

  // Subscribe to events
  public on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  // Dispatch events to all matching listeners
  private dispatch(message: RealtimeMessage) {
    const specificCallbacks = this.listeners.get(message.event);
    if (specificCallbacks) {
      specificCallbacks.forEach((cb) => cb(message));
    }

    // Also dispatch to wildcard listeners "*"
    const wildcardCallbacks = this.listeners.get("*");
    if (wildcardCallbacks) {
      wildcardCallbacks.forEach((cb) => cb(message));
    }
  }
}

export const realtimeService = new AtlasRealtimeService();
