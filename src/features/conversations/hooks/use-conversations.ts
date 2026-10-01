"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { conversationService } from "@/features/chat/services/conversation.service";
import { useConversationStore } from "@/stores/conversation-store";
import { createClientConversation } from "@/features/chat/utils/message-factory";

import {
  CONVERSATION_QUERY_KEYS,
  ConversationsData,
  updateConversationInCache,
  snapshotConversationsCache,
  rollbackConversationsCache,
  invalidateConversationsCache,
} from "../services/conversation-cache.service";

export { type ConversationsData };

import { saveOfflineConversations, getOfflineConversations } from "@/lib/offline-db";

/**
 * Hook to retrieve all user conversations and pinned IDs.
 */
export function useConversations() {
  const query = useQuery<ConversationsData>({
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

      // Optimistic update
      queryClient.setQueryData<ConversationsData>(CONVERSATION_QUERY_KEYS.all, (old) => ({
        conversations: [clientConv, ...(old?.conversations || [])],
        pinnedIds: old?.pinnedIds || [],
      }));

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

      if (previousData) {
        queryClient.setQueryData<ConversationsData>(CONVERSATION_QUERY_KEYS.all, {
          ...previousData,
          conversations: previousData.conversations.map((c) =>
            c.id === convId ? { ...c, title: trimmed, updatedAt: new Date().toISOString() } : c,
          ),
        });
      }

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

      if (previousData) {
        queryClient.setQueryData<ConversationsData>(CONVERSATION_QUERY_KEYS.all, {
          ...previousData,
          conversations: previousData.conversations.filter((c) => c.id !== convId),
          pinnedIds: previousData.pinnedIds.filter((id) => id !== convId),
        });
      }

      const activeId = useConversationStore.getState().activeConversationId;
      if (activeId === convId) {
        useConversationStore.getState().setActiveConversation(null);
      }

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

      if (previousData) {
        const isPinned = previousData.pinnedIds.includes(convId);
        const updatedPinned = isPinned
          ? previousData.pinnedIds.filter((id) => id !== convId)
          : [...previousData.pinnedIds, convId];

        queryClient.setQueryData<ConversationsData>(CONVERSATION_QUERY_KEYS.all, {
          ...previousData,
          pinnedIds: updatedPinned,
        });
      }

      return { previousData };
    },
    onError: (_err, _convId, context) => rollbackConversationsCache(queryClient, context),
    onSettled: () => invalidateConversationsCache(queryClient),
  });
}
