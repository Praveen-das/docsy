"use client";

import { useQuery, useInfiniteQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { conversationService, type ConversationListParams } from "@/features/chat/services/conversation.service";
import { useConversationStore } from "@/stores/conversation-store";
import { createClientConversation } from "@/features/chat/utils/message-factory";

import {
  CONVERSATION_QUERY_KEYS,
  ConversationsData,
  updateConversationInCache,
  addConversationToCache,
  removeConversationFromCache,
  togglePinInCache,
  snapshotConversationsCache,
  rollbackConversationsCache,
  invalidateConversationsCache,
} from "../services/conversation-cache.service";

export { type ConversationsData };

import { saveOfflineConversations, getOfflineConversations } from "@/lib/offline-db";

const RECENTS_PAGE_SIZE = 20;

/**
 * Paginated conversations. Filters/sort/search run on the server; loads one page at a time.
 * With no filters this is the "recent" list used by the sidebar and dashboard.
 */
export function useRecentConversations(
  filters: Omit<ConversationListParams, "limit" | "offset"> = {},
  pageSize = RECENTS_PAGE_SIZE,
) {
  const query = useInfiniteQuery({
    queryKey: [...CONVERSATION_QUERY_KEYS.recent, filters, pageSize],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      conversationService.fetchConversations({ ...filters, limit: pageSize, offset: pageParam }),
    getNextPageParam: (last) => last.nextOffset ?? undefined,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
  });

  return {
    ...query,
    conversations: query.data?.pages.flatMap((p) => p.conversations) ?? [],
    pinnedIds: new Set(query.data?.pages[0]?.pinnedIds ?? []),
  };
}

/**
 * Conversations of a single document, filtered server-side.
 */
export function useDocumentConversations(documentId?: string | null) {
  const query = useQuery({
    queryKey: CONVERSATION_QUERY_KEYS.byDocument(documentId ?? ""),
    queryFn: () => conversationService.fetchConversations({ documentId: documentId! }),
    enabled: !!documentId,
    staleTime: 1000 * 30,
  });

  return { ...query, conversations: query.data?.conversations ?? [] };
}

/**
 * Total and per-document conversation counts (no list payload).
 */
export function useConversationCounts() {
  const query = useQuery({
    queryKey: CONVERSATION_QUERY_KEYS.counts,
    queryFn: conversationService.fetchCounts,
    staleTime: 1000 * 30,
  });

  return { ...query, total: query.data?.total ?? 0, byDocument: query.data?.byDocument ?? {} };
}

/**
 * Single conversation by id (title, documentIds, stream token). Avoids loading the whole list.
 */
export function useActiveConversation(convId?: string | null) {
  return useQuery({
    queryKey: CONVERSATION_QUERY_KEYS.detail(convId ?? ""),
    queryFn: () => conversationService.fetchConversation(convId!),
    enabled: !!convId,
    staleTime: 1000 * 30,
    retry: false,
  });
}

/**
 * Hook to retrieve ALL user conversations and pinned IDs. Prefer the scoped hooks above;
 * use `enabled` to defer this heavy fetch until it is actually needed.
 */
export function useConversations({ enabled = true }: { enabled?: boolean } = {}) {
  const query = useQuery<ConversationsData>({
    enabled,
    queryKey: CONVERSATION_QUERY_KEYS.all,
    queryFn: async () => {
      try {
        const data = await conversationService.fetchConversations();
        const convList = data.conversations || [];

        const result = {
          conversations: convList,
          pinnedIds: data.pinnedIds || [],
        };
        // Save to IndexedDB offline storage
        saveOfflineConversations(result.conversations).catch(() => {});
        return result;
      } catch (err) {
        // Fallback to offline cache
        try {
          const cached = await getOfflineConversations();
          if (cached && cached.length > 0) {
            return {
              conversations: cached,
              pinnedIds: [],
            };
          }
        } catch (_) {}
        throw err;
      }
    },
    staleTime: 1000 * 30,
  });

  return {
    ...query,
    conversations: query.data?.conversations ?? [],
    pinnedIds: new Set(query.data?.pinnedIds ?? []),
    rawPinnedIds: query.data?.pinnedIds ?? [],
  };
}

/**
 * Hook to create a new conversation optimistically.
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: string | { documentId: string; initialTitle?: string }): Promise<string> => {
      const documentId = typeof params === "string" ? params : params.documentId;
      const initialTitle = typeof params === "string" ? undefined : params.initialTitle;
      const currentData = queryClient.getQueryData<ConversationsData>(CONVERSATION_QUERY_KEYS.all);
      const existingForDoc = (currentData?.conversations || []).filter((c) => c.documentIds?.includes(documentId));
      const title = initialTitle || `Conversation ${existingForDoc.length + 1}`;

      const clientConv = createClientConversation(documentId, title);
      const newConvId = clientConv.id;

      // Optimistic update across all query caches (all, detail, recent pages, document list, counts)
      addConversationToCache(clientConv);

      useConversationStore.getState().setActiveConversation(newConvId);

      try {
        const serverConv = await conversationService.createConversation(newConvId, [documentId], title);
        if (serverConv?.streamToken) {
          useConversationStore.getState().setStreamToken(newConvId, serverConv.streamToken);
        }
      } catch (err) {
        console.error("Failed to sync new conversation to server:", err);
      }

      return newConvId;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATION_QUERY_KEYS.all });
    },
  });
}

/**
 * Hook to rename a conversation optimistically.
 */
export function useRenameConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ convId, newTitle }: { convId: string; newTitle: string }) => {
      const trimmed = newTitle.trim();
      if (!trimmed) return;
      await conversationService.renameConversation(convId, trimmed);
    },
    onMutate: async ({ convId, newTitle }) => {
      const trimmed = newTitle.trim();
      if (!trimmed) return;

      const previousData = await snapshotConversationsCache(queryClient);
      updateConversationInCache(convId, { title: trimmed, updatedAt: new Date().toISOString() });

      return { previousData };
    },
    onError: (_err, _vars, context) => rollbackConversationsCache(queryClient, context),
    onSettled: () => invalidateConversationsCache(queryClient),
  });
}

/**
 * Hook to delete a conversation optimistically.
 */
export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (convId: string) => conversationService.deleteConversation(convId),
    onMutate: async (convId: string) => {
      const previousData = await snapshotConversationsCache(queryClient);

      removeConversationFromCache(convId);
      useConversationStore.getState().removeConversation(convId);

      return { previousData };
    },
    onError: (_err, _convId, context) => rollbackConversationsCache(queryClient, context),
    onSettled: () => invalidateConversationsCache(queryClient),
  });
}

/**
 * Hook to delete all conversations.
 */
export function useDeleteAllConversations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => conversationService.deleteAllConversations(),
    onMutate: async () => {
      const previousData = await snapshotConversationsCache(queryClient);

      queryClient.setQueryData<ConversationsData>(CONVERSATION_QUERY_KEYS.all, {
        conversations: [],
        pinnedIds: [],
      });

      useConversationStore.getState().resetToDefaults();

      return { previousData };
    },
    onError: (_err, _vars, context) => rollbackConversationsCache(queryClient, context),
    onSettled: () => invalidateConversationsCache(queryClient),
  });
}

/**
 * Hook to toggle pin on a conversation optimistically.
 */
export function useTogglePinConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (convId: string) => conversationService.togglePinConversation(convId),
    onMutate: async (convId: string) => {
      const previousData = await snapshotConversationsCache(queryClient);

      togglePinInCache(convId);

      return { previousData };
    },
    onError: (_err, _convId, context) => rollbackConversationsCache(queryClient, context),
    onSettled: () => invalidateConversationsCache(queryClient),
  });
}
