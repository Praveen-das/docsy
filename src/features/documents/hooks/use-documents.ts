"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Document, DocumentStatusDto } from "@/types";
import { documentApiService } from "../services/document-api.service";
import { getQueryClient } from "@/lib/query-client";

import { saveOfflineDocuments, getOfflineDocuments } from "@/lib/offline-db";

export const DOCUMENT_QUERY_KEYS = {
  all: ["documents"] as const,
  detail: (id: string) => ["documents", id] as const,
};

/**
 * Hook to retrieve all user documents with automatic polling when any document is in-flight.
 */
export function useDocuments() {
  return useQuery<Document[]>({
    queryKey: DOCUMENT_QUERY_KEYS.all,
    queryFn: async () => {
      try {
        const docs = await documentApiService.fetchDocuments();
        saveOfflineDocuments(docs).catch(() => {});
        return docs;
      } catch (err) {
        try {
          const cached = await getOfflineDocuments();
          if (cached && cached.length > 0) {
            return cached;
          }
        } catch (_) {}
        throw err;
      }
    },
    staleTime: 1000 * 30,
    refetchInterval: (query) => {
      const docs = query.state.data;
      if (!docs || docs.length === 0) return false;
      const hasInFlight = docs.some(
        (d) => d.status !== "READY" && d.status !== "FAILED"
      );
      return hasInFlight ? 3000 : false;
    },
  });
}

/**
 * Optimistically delete a document.
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentApiService.deleteDocument(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: DOCUMENT_QUERY_KEYS.all });
      const previousDocs = queryClient.getQueryData<Document[]>(DOCUMENT_QUERY_KEYS.all);

      if (previousDocs) {
        queryClient.setQueryData<Document[]>(
          DOCUMENT_QUERY_KEYS.all,
          previousDocs.filter((d) => d.id !== id)
        );
      }

      return { previousDocs };
    },
    onError: (_err, _id, context) => {
      if (context?.previousDocs) {
        queryClient.setQueryData(DOCUMENT_QUERY_KEYS.all, context.previousDocs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENT_QUERY_KEYS.all });
    },
  });
}

/**
 * Delete all documents.
 */
export function useDeleteAllDocuments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => documentApiService.deleteAllDocuments(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: DOCUMENT_QUERY_KEYS.all });
      const previousDocs = queryClient.getQueryData<Document[]>(DOCUMENT_QUERY_KEYS.all);
      queryClient.setQueryData<Document[]>(DOCUMENT_QUERY_KEYS.all, []);
      return { previousDocs };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousDocs) {
        queryClient.setQueryData(DOCUMENT_QUERY_KEYS.all, context.previousDocs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENT_QUERY_KEYS.all });
    },
  });
}

/**
 * Reprocess a document with optimistic status update.
 */
export function useReprocessDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentApiService.reprocessDocument(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: DOCUMENT_QUERY_KEYS.all });
      const previousDocs = queryClient.getQueryData<Document[]>(DOCUMENT_QUERY_KEYS.all);

      if (previousDocs) {
        queryClient.setQueryData<Document[]>(
          DOCUMENT_QUERY_KEYS.all,
          previousDocs.map((d) =>
            d.id === id
              ? { ...d, status: "UPLOADING", error: null, processingProgress: 10 }
              : d
          )
        );
      }

      return { previousDocs };
    },
    onError: (_err, id, context) => {
      if (context?.previousDocs) {
        queryClient.setQueryData(DOCUMENT_QUERY_KEYS.all, context.previousDocs);
      } else {
        updateDocumentInCache(id, {
          status: "FAILED",
          error: "Reprocessing request failed",
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENT_QUERY_KEYS.all });
    },
  });
}

/**
 * Toggle favorite document with optimistic UI update.
 */
export function useToggleFavoriteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentApiService.toggleFavorite(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: DOCUMENT_QUERY_KEYS.all });
      const previousDocs = queryClient.getQueryData<Document[]>(DOCUMENT_QUERY_KEYS.all);

      if (previousDocs) {
        queryClient.setQueryData<Document[]>(
          DOCUMENT_QUERY_KEYS.all,
          previousDocs.map((d) =>
            d.id === id ? { ...d, isFavorite: !d.isFavorite } : d
          )
        );
      }

      return { previousDocs };
    },
    onSuccess: (data, id) => {
      if (data && typeof data.isFavorite === "boolean") {
        updateDocumentInCache(id, { isFavorite: data.isFavorite });
      }
    },
    onError: (_err, _id, context) => {
      if (context?.previousDocs) {
        queryClient.setQueryData(DOCUMENT_QUERY_KEYS.all, context.previousDocs);
      }
    },
  });
}

/**
 * Manually check a document's status and update the cache.
 */
export function useCheckDocumentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<DocumentStatusDto | null> => {
      const statusItem = await documentApiService.checkDocumentStatus(id);
      if (statusItem) {
        updateDocumentInCache(statusItem.id, {
          status: statusItem.status,
          processingProgress: statusItem.processingProgress,
          error: statusItem.error,
          pageCount: statusItem.pageCount,
          chunkCount: statusItem.chunkCount,
          updatedAt: statusItem.updatedAt,
        });

        if (statusItem.status === "READY") {
          queryClient.invalidateQueries({ queryKey: DOCUMENT_QUERY_KEYS.all });
        }
      }
      return statusItem;
    },
  });
}

/**
 * Directly add or update an optimistic document in the query cache.
 * Safe to call inside or outside React components.
 */
export function addOptimisticDocument(doc: Document) {
  const client = getQueryClient();
  client.setQueryData<Document[]>(DOCUMENT_QUERY_KEYS.all, (old = []) => [
    doc,
    ...old.filter((d) => d.id !== doc.id),
  ]);
}

/**
 * Update partial fields of a document in the query cache.
 */
export function updateDocumentInCache(id: string, updates: Partial<Document>) {
  const client = getQueryClient();
  client.setQueryData<Document[]>(DOCUMENT_QUERY_KEYS.all, (old = []) =>
    old.map((d) => (d.id === id ? { ...d, ...updates } : d))
  );
}
