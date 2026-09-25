"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DocumentUIState {
  openedDocumentIds: string[];
  markDocumentAsOpened: (docId: string) => void;
  isDocumentOpened: (docId: string) => boolean;
}

/**
 * Global Zustand store strictly for client-side Document UI state.
 * Server state (documents list, CRUD, status, polling) is managed via React Query (useDocuments).
 */
export const useDocumentStore = create<DocumentUIState>()(
  persist(
    (set, get) => ({
      openedDocumentIds: [],

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
      name: "docsy-document-store-v5",
      partialize: (state) => ({
        openedDocumentIds: state.openedDocumentIds,
      }),
    }
  )
);
