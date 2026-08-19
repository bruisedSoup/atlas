"use client";

import {
  getPendingQueue,
  removeQueueItem,
  updateTaskRealId,
  updateQueueItemTaskId,
  markTaskSynced,
  QueueItem,
} from "./offlineStorage";
import { TaskItem } from "@/app/src/pages/dashboard/components/TodoList";

export type SyncCallbackMap = {
  onTaskCreated?: (tempId: string, realTask: TaskItem) => void;
  onTaskUpdated?: (realTask: TaskItem) => void;
  onTaskCompleted?: (taskId: string) => void;
  onTaskDeleted?: (taskId: string) => void;
  onSyncProgress?: (isSyncing: boolean, pendingCount: number) => void;
};

class SyncManager {
  private isSyncing = false;
  private listeners: Set<(online: boolean) => void> = new Set();
  private isOnlineState = typeof navigator !== "undefined" ? navigator.onLine : true;
  private callbacks: SyncCallbackMap = {};
  private getFreshTokenFn: (() => Promise<string | null>) | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.isOnlineState = navigator.onLine;

      window.addEventListener("online", this.handleOnline);
      window.addEventListener("offline", this.handleOffline);
    }
  }

  public registerAuth(getFreshToken: () => Promise<string | null>, callbacks?: SyncCallbackMap) {
    this.getFreshTokenFn = getFreshToken;
    if (callbacks) {
      this.callbacks = { ...this.callbacks, ...callbacks };
    }
  }

  public setCallbacks(callbacks: SyncCallbackMap) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public get isOnline(): boolean {
    if (typeof navigator !== "undefined") {
      return navigator.onLine;
    }
    return this.isOnlineState;
  }

  public addConnectivityListener(callback: (online: boolean) => void) {
    this.listeners.add(callback);
    // Immediately emit current true browser network state
    const currentOnline = typeof navigator !== "undefined" ? navigator.onLine : this.isOnlineState;
    callback(currentOnline);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private handleOnline = () => {
    console.log("🌐 [SyncManager] Network online event received");
    this.isOnlineState = true;
    this.notifyListeners(true);
    this.triggerSync();
  };

  private handleOffline = () => {
    console.log("⚠️ [SyncManager] Network offline event received");
    this.isOnlineState = false;
    this.notifyListeners(false);
  };

  private notifyListeners(online: boolean) {
    this.listeners.forEach((cb) => cb(online));
  }

  public async triggerSync(): Promise<void> {
    if (this.isSyncing) return;
    if (!this.getFreshTokenFn) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    this.isSyncing = true;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const queue = await getPendingQueue();
      this.callbacks.onSyncProgress?.(true, queue.length);

      if (queue.length === 0) {
        this.isSyncing = false;
        this.callbacks.onSyncProgress?.(false, 0);
        return;
      }

      console.log(`🔄 [SyncManager] Syncing ${queue.length} pending offline actions...`);
      const token = await this.getFreshTokenFn();
      if (!token) {
        this.isSyncing = false;
        this.callbacks.onSyncProgress?.(false, queue.length);
        return;
      }

      for (const item of queue) {
        try {
          const success = await this.processQueueItem(item, apiUrl, token);
          if (!success) {
            // Stop queue execution on connection error to preserve sequential order
            break;
          }
        } catch (err) {
          console.error(`[SyncManager] Error processing queue item ${item.id}:`, err);
          break;
        }
      }

      const remaining = await getPendingQueue();
      this.callbacks.onSyncProgress?.(false, remaining.length);
    } catch (err) {
      console.error("[SyncManager] Sync loop failure:", err);
    } finally {
      this.isSyncing = false;
    }
  }

  private async processQueueItem(item: QueueItem, apiUrl: string, token: string): Promise<boolean> {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    switch (item.action) {
      case "CREATE": {
        // Strip out temporary local properties before sending to Django
        const { id, _sync_status, _temp_id, ...cleanPayload } = item.payload;

        const res = await fetch(`${apiUrl}/api/tasks/`, {
          method: "POST",
          headers,
          body: JSON.stringify(cleanPayload),
        });

        if (res.ok) {
          const serverTask: TaskItem = await res.json();
          const tempId = item.tempId || item.payload.id;

          // 1. Update IndexedDB tasks store
          await updateTaskRealId(tempId, serverTask);

          // 2. Cascade any subsequent actions in queue that targeted this tempId
          await updateQueueItemTaskId(tempId, serverTask.id);

          // 3. Remove queue item
          await removeQueueItem(item.id);

          // 4. Notify React components to swap the ID in state
          this.callbacks.onTaskCreated?.(tempId, serverTask);
          console.log(`✅ [SyncManager] Created task synced: ${tempId} -> ${serverTask.id}`);
          return true;
        } else if (res.status >= 400 && res.status < 500) {
          // Client error (e.g. invalid data), discard item to avoid blocking queue
          console.warn(`[SyncManager] Discarding invalid task creation (${res.status})`);
          await removeQueueItem(item.id);
          return true;
        }
        return false;
      }

      case "UPDATE": {
        const taskId = item.taskId;
        if (!taskId || taskId.startsWith("temp_")) {
          // Wait until CREATE completes if it was created offline
          return false;
        }

        const { id, _sync_status, _temp_id, ...cleanPayload } = item.payload;

        const res = await fetch(`${apiUrl}/api/tasks/${taskId}/`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(cleanPayload),
        });

        if (res.ok) {
          const serverTask: TaskItem = await res.json();
          await markTaskSynced(taskId);
          await removeQueueItem(item.id);
          this.callbacks.onTaskUpdated?.(serverTask);
          console.log(`✅ [SyncManager] Updated task synced: ${taskId}`);
          return true;
        } else if (res.status === 404) {
          // Task was deleted on server
          await removeQueueItem(item.id);
          return true;
        }
        return false;
      }

      case "COMPLETE": {
        const taskId = item.taskId;
        if (!taskId || taskId.startsWith("temp_")) return false;

        const res = await fetch(`${apiUrl}/api/tasks/${taskId}/`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ status: "done" }),
        });

        if (res.ok || res.status === 404) {
          await removeQueueItem(item.id);
          this.callbacks.onTaskCompleted?.(taskId);
          console.log(`✅ [SyncManager] Task complete synced: ${taskId}`);
          return true;
        }
        return false;
      }

      case "DELETE": {
        const taskId = item.taskId;
        if (!taskId) {
          await removeQueueItem(item.id);
          return true;
        }

        if (taskId.startsWith("temp_")) {
          // If task only existed locally, just remove from queue
          await removeQueueItem(item.id);
          return true;
        }

        const res = await fetch(`${apiUrl}/api/tasks/${taskId}/`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok || res.status === 404) {
          await removeQueueItem(item.id);
          this.callbacks.onTaskDeleted?.(taskId);
          console.log(`✅ [SyncManager] Task delete synced: ${taskId}`);
          return true;
        }
        return false;
      }

      default:
        await removeQueueItem(item.id);
        return true;
    }
  }
}

export const syncManager = new SyncManager();
