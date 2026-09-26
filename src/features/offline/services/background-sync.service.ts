/**
 * Proactive background sync coordinator.
 * Synchronizes documents, conversations, message transcripts, and auth snapshots to IndexedDB.
 */

import { Document, Conversation } from "@/types";
import {
  saveOfflineDocuments,
  saveOfflineConversations,
  saveOfflineMessages,
  saveAuthSnapshot,
  AuthSnapshot,
} from "@/lib/offline-db";
import { api } from "@/lib/api-client";

export interface SyncUserData {
  id: string;
  fullName?: string | null;
  primaryEmailAddress?: { emailAddress: string } | null;
  imageUrl?: string | null;
}

class BackgroundSyncService {
  private isSyncing = false;
  private lastSyncedAt: Date | null = null;
  private cooldownMs = 1000 * 60 * 2; // 2 minutes cooldown
  private idleCallbackId: number | null = null;

  public getStatus() {
    return {
      isSyncing: this.isSyncing,
      lastSyncedAt: this.lastSyncedAt,
    };
  }

  /**
   * Schedules a non-blocking background sync when the browser is idle.
   */
  public scheduleSync(params: {
    user?: SyncUserData | null;
    documents?: Document[];
    conversations?: Conversation[];
  }) {
    if (typeof window === "undefined" || !navigator.onLine) return;

    if (this.lastSyncedAt && Date.now() - this.lastSyncedAt.getTime() < this.cooldownMs) {
      return;
    }

    if ("requestIdleCallback" in window) {
      if (this.idleCallbackId !== null) {
        window.cancelIdleCallback(this.idleCallbackId);
      }
      this.idleCallbackId = window.requestIdleCallback(
        () => {
          this.executeSync(params).catch((err) =>
            console.warn("[BackgroundSync] Idle sync warning:", err)
          );
        },
        { timeout: 5000 }
      );
    } else {
      setTimeout(() => {
        this.executeSync(params).catch((err) =>
          console.warn("[BackgroundSync] Sync warning:", err)
        );
      }, 2000);
    }
  }

  /**
   * Executes the proactive sync pipeline.
   */
  public async executeSync(params: {
    user?: SyncUserData | null;
    documents?: Document[];
    conversations?: Conversation[];
    force?: boolean;
  }): Promise<void> {
    if (typeof window === "undefined" || !navigator.onLine) return;
    if (this.isSyncing) return;

    if (!params.force && this.lastSyncedAt && Date.now() - this.lastSyncedAt.getTime() < this.cooldownMs) {
      return;
    }

    this.isSyncing = true;
    try {
      // 1. Snapshot Auth
      if (params.user?.id) {
        const snapshot: AuthSnapshot = {
          userId: params.user.id,
          fullName: params.user.fullName ?? null,
          primaryEmail: params.user.primaryEmailAddress?.emailAddress ?? null,
          imageUrl: params.user.imageUrl ?? null,
          cachedAt: new Date().toISOString(),
        };
        await saveAuthSnapshot(snapshot);
      }

      // 2. Sync Documents
      if (params.documents && params.documents.length > 0) {
        await saveOfflineDocuments(params.documents);
      }

      // 3. Sync Conversations
      if (params.conversations && params.conversations.length > 0) {
        await saveOfflineConversations(params.conversations);

        // 4. Pre-cache message history for the 5 most recent conversations
        const topConversations = params.conversations.slice(0, 5);
        for (const conv of topConversations) {
          try {
            const res = await api.get<{ messages: any[] }>(
              `/api/conversations/${conv.id}/messages`,
              { params: { limit: 50 } }
            );
            if (res.data?.messages && Array.isArray(res.data.messages)) {
              await saveOfflineMessages(conv.id, res.data.messages);
            }
          } catch {
            // Ignore individual conversation fetch failures in background
          }
        }
      }

      // 5. Pre-warm key application route shells in Service Worker cache
      if (typeof window !== "undefined" && "serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "PRECACHE_ROUTES",
          routes: ["/", "/conversations", "/conversation", "/documents"],
        });
      }

      this.lastSyncedAt = new Date();
    } catch (err) {
      console.warn("[BackgroundSync] Error executing background sync:", err);
    } finally {
      this.isSyncing = false;
    }
  }
}

export const backgroundSyncService = new BackgroundSyncService();
