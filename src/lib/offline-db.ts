/**
 * Typed IndexedDB storage engine for Docsy AI offline reading & session snapshot.
 * Zero-dependency native browser storage.
 */

import { Document, Conversation, Message } from "@/types";

export interface AuthSnapshot {
  userId: string;
  fullName: string | null;
  primaryEmail: string | null;
  imageUrl: string | null;
  cachedAt: string;
}

const DB_NAME = "docsy_offline_v1";
const DB_VERSION = 1;

export const STORES = {
  DOCUMENTS: "documents",
  CONVERSATIONS: "conversations",
  MESSAGES: "messages",
  AUTH: "auth_snapshot",
} as const;

let dbPromise: Promise<IDBDatabase> | null = null;

export function openOfflineDB(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.reject(new Error("IndexedDB is not supported in this environment"));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;

      // 1. Documents store
      if (!db.objectStoreNames.contains(STORES.DOCUMENTS)) {
        const docStore = db.createObjectStore(STORES.DOCUMENTS, { keyPath: "id" });
        docStore.createIndex("by_user", "userId", { unique: false });
        docStore.createIndex("by_updated", "updatedAt", { unique: false });
      }

      // 2. Conversations store
      if (!db.objectStoreNames.contains(STORES.CONVERSATIONS)) {
        const convStore = db.createObjectStore(STORES.CONVERSATIONS, { keyPath: "id" });
        convStore.createIndex("by_user", "userId", { unique: false });
        convStore.createIndex("by_updated", "updatedAt", { unique: false });
      }

      // 3. Messages store
      if (!db.objectStoreNames.contains(STORES.MESSAGES)) {
        const msgStore = db.createObjectStore(STORES.MESSAGES, { keyPath: "id" });
        msgStore.createIndex("by_conv", "conversationId", { unique: false });
        msgStore.createIndex("by_created", "createdAt", { unique: false });
      }

      // 4. Auth Snapshot store
      if (!db.objectStoreNames.contains(STORES.AUTH)) {
        db.createObjectStore(STORES.AUTH, { keyPath: "userId" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

// ─── Document Operations ──────────────────────────────────────────

export async function saveOfflineDocuments(docs: Document[]): Promise<void> {
  if (!docs || docs.length === 0) return;
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.DOCUMENTS, "readwrite");
    const store = tx.objectStore(STORES.DOCUMENTS);

    for (const doc of docs) {
      store.put(doc);
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOfflineDocuments(userId?: string): Promise<Document[]> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.DOCUMENTS, "readonly");
    const store = tx.objectStore(STORES.DOCUMENTS);
    const request = store.getAll();

    request.onsuccess = () => {
      let results: Document[] = request.result || [];
      if (userId) {
        results = results.filter((d) => d.userId === userId || !d.userId);
      }
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

// ─── Conversation Operations ──────────────────────────────────────

export async function saveOfflineConversations(convs: Conversation[]): Promise<void> {
  if (!convs || convs.length === 0) return;
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CONVERSATIONS, "readwrite");
    const store = tx.objectStore(STORES.CONVERSATIONS);

    for (const conv of convs) {
      store.put(conv);
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOfflineConversations(userId?: string): Promise<Conversation[]> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CONVERSATIONS, "readonly");
    const store = tx.objectStore(STORES.CONVERSATIONS);
    const request = store.getAll();

    request.onsuccess = () => {
      let results: Conversation[] = request.result || [];
      if (userId) {
        results = results.filter((c) => c.userId === userId || !c.userId);
      }
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

// ─── Message Operations ───────────────────────────────────────────

export async function saveOfflineMessages(convId: string, messages: Message[]): Promise<void> {
  if (!messages || messages.length === 0) return;
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.MESSAGES, "readwrite");
    const store = tx.objectStore(STORES.MESSAGES);

    for (const msg of messages) {
      store.put({ ...msg, conversationId: convId });
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOfflineMessages(convId: string): Promise<Message[]> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.MESSAGES, "readonly");
    const store = tx.objectStore(STORES.MESSAGES);
    const index = store.index("by_conv");
    const request = index.getAll(convId);

    request.onsuccess = () => {
      const messages: Message[] = request.result || [];
      // Sort oldest to newest
      messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      resolve(messages);
    };
    request.onerror = () => reject(request.error);
  });
}

// ─── Auth Snapshot Operations ─────────────────────────────────────

export async function saveAuthSnapshot(snapshot: AuthSnapshot): Promise<void> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.AUTH, "readwrite");
    const store = tx.objectStore(STORES.AUTH);
    store.put(snapshot);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAuthSnapshot(): Promise<AuthSnapshot | null> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.AUTH, "readonly");
    const store = tx.objectStore(STORES.AUTH);
    const request = store.getAll();

    request.onsuccess = () => {
      const all: AuthSnapshot[] = request.result || [];
      resolve(all[0] || null);
    };
    request.onerror = () => reject(request.error);
  });
}

// ─── Reset / Clear Cache ──────────────────────────────────────────

export async function clearOfflineCache(): Promise<void> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(
      [STORES.DOCUMENTS, STORES.CONVERSATIONS, STORES.MESSAGES, STORES.AUTH],
      "readwrite"
    );
    tx.objectStore(STORES.DOCUMENTS).clear();
    tx.objectStore(STORES.CONVERSATIONS).clear();
    tx.objectStore(STORES.MESSAGES).clear();
    tx.objectStore(STORES.AUTH).clear();

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
