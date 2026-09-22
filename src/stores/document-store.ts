"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Document, DocumentStatusDto } from "@/types";

interface DocumentState {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  openedDocumentIds: string[];
  favoriteDocumentIds: string[];

  // Actions
  fetchDocuments: () => Promise<void>;
  addDocument: (doc: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => Promise<boolean>;
  reprocessDocument: (id: string) => Promise<boolean>;
  checkDocumentStatus: (id: string) => Promise<DocumentStatusDto | null>;
  markDocumentAsOpened: (docId: string) => void;
  isDocumentOpened: (docId: string) => boolean;
  toggleFavoriteDocument: (docId: string) => void;
  isDocumentFavorite: (docId: string) => boolean;
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      documents: [],
      isLoading: false,
      error: null,
      openedDocumentIds: [],
      favoriteDocumentIds: [],

      fetchDocuments: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch("/api/documents");
          if (!res.ok) {
            if (res.status === 401) {
              set({ isLoading: false });
              return;
            }
            throw new Error(`Failed to fetch documents (${res.status})`);
          }
          const data: Document[] = await res.json();
          // Synchronize favoriteDocumentIds from server data
          const serverFavIds = data.filter((d) => d.isFavorite).map((d) => d.id);
          set({
            documents: data,
            isLoading: false,
            favoriteDocumentIds: serverFavIds,
          });
        } catch (err) {
          set({
            error:
              err instanceof Error ? err.message : "Failed to load documents",
            isLoading: false,
          });
        }
      },

      addDocument: (doc: Document) => {
        set((state) => ({
          documents: [doc, ...state.documents.filter((d) => d.id !== doc.id)],
        }));
      },

      updateDocument: (id: string, updates: Partial<Document>) => {
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          ),
        }));
      },

      deleteDocument: async (id: string): Promise<boolean> => {
        const prevDocs = get().documents;
        // Optimistic delete
        set({ documents: prevDocs.filter((d) => d.id !== id) });

        try {
          const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error("Delete failed");
          return true;
        } catch {
          // Revert optimistic delete
          set({ documents: prevDocs });
          return false;
        }
      },

      reprocessDocument: async (id: string): Promise<boolean> => {
        get().updateDocument(id, {
          status: "UPLOADING",
          error: null,
          processingProgress: 10,
        });

        try {
          const res = await fetch(`/api/documents/${id}/reprocess`, {
            method: "POST",
          });
          if (!res.ok) throw new Error("Reprocess failed");
          return true;
        } catch {
          get().updateDocument(id, {
            status: "FAILED",
            error: "Reprocessing request failed",
          });
          return false;
        }
      },

      checkDocumentStatus: async (id: string): Promise<DocumentStatusDto | null> => {
        try {
          const res = await fetch("/api/documents/status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ documentIds: [id] }),
          });

          if (!res.ok) return null;

          const data: { statuses?: DocumentStatusDto[] } = await res.json();
          const statusItem = data.statuses?.[0];

          if (statusItem) {
            get().updateDocument(statusItem.id, {
              status: statusItem.status,
              processingProgress: statusItem.processingProgress,
              error: statusItem.error,
              pageCount: statusItem.pageCount,
              chunkCount: statusItem.chunkCount,
              updatedAt: statusItem.updatedAt,
            });

            if (statusItem.status === "READY") {
              get().fetchDocuments().catch(() => {});
            }

            return statusItem;
          }

          return null;
        } catch (err) {
          console.error("Failed to check document status:", err);
          return null;
        }
      },

      markDocumentAsOpened: (docId: string) => {
        const { openedDocumentIds } = get();
        if (!openedDocumentIds.includes(docId)) {
          set({ openedDocumentIds: [...openedDocumentIds, docId] });
        }
      },

      isDocumentOpened: (docId: string) => {
        return get().openedDocumentIds.includes(docId);
      },

      toggleFavoriteDocument: async (docId: string) => {
        const { favoriteDocumentIds, documents } = get();
        const wasFavorite = favoriteDocumentIds.includes(docId);
        const nextFavorite = !wasFavorite;

        // Optimistic UI state update
        set({
          favoriteDocumentIds: nextFavorite
            ? [...favoriteDocumentIds, docId]
            : favoriteDocumentIds.filter((id) => id !== docId),
          documents: documents.map((d) =>
            d.id === docId ? { ...d, isFavorite: nextFavorite } : d
          ),
        });

        try {
          const res = await fetch(`/api/documents/${docId}/favorite`, {
            method: "POST",
          });

          if (!res.ok) {
            throw new Error(`Failed to toggle favorite (${res.status})`);
          }

          const data = await res.json();
          if (data.isFavorite !== undefined && data.isFavorite !== nextFavorite) {
            // Reconcile with actual server status if different
            set((state) => ({
              favoriteDocumentIds: data.isFavorite
                ? [...state.favoriteDocumentIds.filter((id) => id !== docId), docId]
                : state.favoriteDocumentIds.filter((id) => id !== docId),
              documents: state.documents.map((d) =>
                d.id === docId ? { ...d, isFavorite: data.isFavorite } : d
              ),
            }));
          }
        } catch (err) {
          console.error("Error toggling favorite on server:", err);
          // Revert optimistic update on failure
          set((state) => ({
            favoriteDocumentIds: wasFavorite
              ? [...state.favoriteDocumentIds.filter((id) => id !== docId), docId]
              : state.favoriteDocumentIds.filter((id) => id !== docId),
            documents: state.documents.map((d) =>
              d.id === docId ? { ...d, isFavorite: wasFavorite } : d
            ),
          }));
        }
      },

      isDocumentFavorite: (docId: string) => {
        const doc = get().documents.find((d) => d.id === docId);
        if (doc?.isFavorite !== undefined) {
          return doc.isFavorite;
        }
        return get().favoriteDocumentIds.includes(docId);
      },
    }),
    {
      name: "docsy-document-store-v5",
      partialize: (state) => ({
        openedDocumentIds: state.openedDocumentIds,
        favoriteDocumentIds: state.favoriteDocumentIds,
      }),
    }
  )
);
