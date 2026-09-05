"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Document } from "@/types";

interface DocumentState {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  openedDocumentIds: string[];

  // Actions
  fetchDocuments: () => Promise<void>;
  addDocument: (doc: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => Promise<boolean>;
  reprocessDocument: (id: string) => Promise<boolean>;
  markDocumentAsOpened: (docId: string) => void;
  isDocumentOpened: (docId: string) => boolean;
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      documents: [],
      isLoading: false,
      error: null,
      openedDocumentIds: [],

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
          set({ documents: data, isLoading: false });
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

      markDocumentAsOpened: (docId: string) => {
        const { openedDocumentIds } = get();
        if (!openedDocumentIds.includes(docId)) {
          set({ openedDocumentIds: [...openedDocumentIds, docId] });
        }
      },

      isDocumentOpened: (docId: string) => {
        return get().openedDocumentIds.includes(docId);
      },
    }),
    {
      name: "docsy-document-store-v4",
      partialize: (state) => ({
        openedDocumentIds: state.openedDocumentIds,
      }),
    }
  )
);
