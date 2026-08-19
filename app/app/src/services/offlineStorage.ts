import { openDB, DBSchema, IDBPDatabase } from "idb";
import { TaskItem } from "@/app/src/pages/dashboard/components/TodoList";

export type SyncStatus = "pending_sync" | "synced";
export type QueueAction = "CREATE" | "UPDATE" | "COMPLETE" | "DELETE" | "RESTORE";

export interface QueueItem {
  id: string; // unique queue item id (e.g. q_...)
  tempId?: string; // temporary local id if created offline
  taskId?: string; // server task id if known
  action: QueueAction;
  payload: any;
  createdAt: number;
  retryCount: number;
}

interface AtlasDB extends DBSchema {
  tasks: {
    key: string;
    value: TaskItem;
    indexes: {
      "by-status": string;
      "by-sync-status": string;
    };
  };
  vault_tasks: {
    key: string;
    value: TaskItem;
  };
  sync_queue: {
    key: string;
    value: QueueItem;
    indexes: {
      "by-created": number;
    };
  };
}

const DB_NAME = "atlas_offline_db";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<AtlasDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<AtlasDB>> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available in SSR"));
  }

  if (!dbPromise) {
    dbPromise = openDB<AtlasDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Tasks store
        if (!db.objectStoreNames.contains("tasks")) {
          const taskStore = db.createObjectStore("tasks", { keyPath: "id" });
          taskStore.createIndex("by-status", "status");
          taskStore.createIndex("by-sync-status", "_sync_status");
        }

        // Vault tasks store
        if (!db.objectStoreNames.contains("vault_tasks")) {
          db.createObjectStore("vault_tasks", { keyPath: "id" });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains("sync_queue")) {
          const queueStore = db.createObjectStore("sync_queue", { keyPath: "id" });
          queueStore.createIndex("by-created", "createdAt");
        }
      },
    });
  }

  return dbPromise;
}

/**
 * Tasks Store Operations
 */
export async function getCachedTasks(): Promise<TaskItem[]> {
  try {
    const db = await getDB();
    return await db.getAll("tasks");
  } catch (err) {
    console.warn("[OfflineStorage] Failed to read tasks from IDB:", err);
    return [];
  }
}

export async function setCachedTasks(tasks: TaskItem[]): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction("tasks", "readwrite");
    // Preserve any local pending_sync items that are not in the server response yet
    const existing = await tx.store.getAll();
    const pendingItems = existing.filter((t) => t._sync_status === "pending_sync");

    await tx.store.clear();

    for (const t of tasks) {
      await tx.store.put({ ...t, _sync_status: "synced" });
    }

    for (const p of pendingItems) {
      // If the pending item wasn't replaced yet, keep it in IDB
      if (!tasks.some((t) => t.id === p.id)) {
        await tx.store.put(p);
      }
    }

    await tx.done;
  } catch (err) {
    console.warn("[OfflineStorage] Failed to save tasks to IDB:", err);
  }
}

export async function upsertLocalTask(task: TaskItem): Promise<void> {
  try {
    const db = await getDB();
    await db.put("tasks", task);
  } catch (err) {
    console.warn("[OfflineStorage] Failed to upsert task:", err);
  }
}

export async function deleteLocalTask(taskId: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete("tasks", taskId);
  } catch (err) {
    console.warn("[OfflineStorage] Failed to delete local task:", err);
  }
}

export async function updateTaskRealId(tempId: string, realTask: TaskItem): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction("tasks", "readwrite");
    await tx.store.delete(tempId);
    await tx.store.put({ ...realTask, _sync_status: "synced" });
    await tx.done;
  } catch (err) {
    console.warn("[OfflineStorage] Failed to replace temp task ID in IDB:", err);
  }
}

export async function markTaskSynced(taskId: string): Promise<void> {
  try {
    const db = await getDB();
    const task = await db.get("tasks", taskId);
    if (task) {
      await db.put("tasks", { ...task, _sync_status: "synced" });
    }
  } catch (err) {
    console.warn("[OfflineStorage] Failed to mark task synced:", err);
  }
}

/**
 * Vault Tasks Store Operations
 */
export async function getCachedVaultTasks(): Promise<TaskItem[]> {
  try {
    const db = await getDB();
    return await db.getAll("vault_tasks");
  } catch (err) {
    console.warn("[OfflineStorage] Failed to read vault tasks from IDB:", err);
    return [];
  }
}

export async function setCachedVaultTasks(tasks: TaskItem[]): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction("vault_tasks", "readwrite");
    await tx.store.clear();
    for (const t of tasks) {
      await tx.store.put({ ...t, _sync_status: "synced" });
    }
    await tx.done;
  } catch (err) {
    console.warn("[OfflineStorage] Failed to cache vault tasks in IDB:", err);
  }
}

/**
 * Sync Queue Operations (FIFO Order)
 */
export async function enqueueAction(
  action: QueueAction,
  payload: any,
  tempId?: string,
  taskId?: string
): Promise<QueueItem> {
  const item: QueueItem = {
    id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    action,
    payload,
    tempId,
    taskId: taskId || tempId,
    createdAt: Date.now(),
    retryCount: 0,
  };

  try {
    const db = await getDB();
    await db.put("sync_queue", item);
  } catch (err) {
    console.warn("[OfflineStorage] Failed to enqueue action:", err);
  }

  return item;
}

export async function getPendingQueue(): Promise<QueueItem[]> {
  try {
    const db = await getDB();
    const tx = db.transaction("sync_queue", "readonly");
    const index = tx.store.index("by-created");
    return await index.getAll();
  } catch (err) {
    console.warn("[OfflineStorage] Failed to fetch sync queue:", err);
    return [];
  }
}

export async function removeQueueItem(queueId: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete("sync_queue", queueId);
  } catch (err) {
    console.warn("[OfflineStorage] Failed to delete queue item:", err);
  }
}

export async function updateQueueItemTaskId(oldTaskId: string, newTaskId: string): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction("sync_queue", "readwrite");
    const all = await tx.store.getAll();
    for (const item of all) {
      if (item.taskId === oldTaskId || item.tempId === oldTaskId) {
        item.taskId = newTaskId;
        if (item.tempId === oldTaskId) item.tempId = undefined;
        await tx.store.put(item);
      }
    }
    await tx.done;
  } catch (err) {
    console.warn("[OfflineStorage] Failed to update queue task ID:", err);
  }
}
