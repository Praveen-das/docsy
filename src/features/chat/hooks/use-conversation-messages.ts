import { useInfiniteQuery, InfiniteData, QueryClient } from "@tanstack/react-query";
import { Message, PaginatedMessagesResponse } from "@/types";
import { api } from "@/lib/api-client";
import axios from "axios";

import { saveOfflineMessages, getOfflineMessages } from "@/lib/offline-db";

import { mockMessages } from "@/lib/mock-data";

export const MESSAGES_PAGE_SIZE = 30;

/**
 * Helper to retrieve all currently cached messages for a conversation from React Query.
 */
export function getCachedMessages(queryClient: QueryClient, conversationId: string): Message[] {
  const cachedData = queryClient.getQueryData<InfiniteData<PaginatedMessagesResponse>>([
    "conversations",
    conversationId,
    "messages",
  ]);
  const pages = cachedData?.pages;
  if (!pages || pages.length === 0) return [];
  return pages.flatMap((page) => page.messages || []);
}

/**
 * Appends a message to the latest page in React Query cache.
 * If cache is uninitialized, creates the first page.
 */
export function appendMessageToCache(queryClient: QueryClient, conversationId: string, message: Message): void {
  queryClient.setQueryData<InfiniteData<PaginatedMessagesResponse>>(
    ["conversations", conversationId, "messages"],
    (oldData) => {
      if (!oldData || oldData.pages.length === 0) {
        return {
          pages: [
            {
              messages: [message],
              nextCursor: null,
              hasMore: false,
            },
          ],
          pageParams: [null],
        };
      }

      const lastPageIndex = oldData.pages.length - 1;
      const updatedPages = oldData.pages.map((page, idx) => {
        if (idx !== lastPageIndex) return page;
        const existingMessages = page.messages || [];
        if (existingMessages.some((m) => m.id === message.id)) {
          return {
            ...page,
            messages: existingMessages.map((m) => (m.id === message.id ? message : m)),
          };
        }
        return {
          ...page,
          messages: [...existingMessages, message],
        };
      });

      return {
        ...oldData,
        pages: updatedPages,
      };
    },
  );
}

/**
 * Updates a message's content directly in React Query cache by ID.
 */
export function updateMessageInCache(
  queryClient: QueryClient,
  conversationId: string,
  messageId: string,
  content: string,
): void {
  queryClient.setQueryData<InfiniteData<PaginatedMessagesResponse>>(
    ["conversations", conversationId, "messages"],
    (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          messages: (page.messages || []).map((m) => (m.id === messageId ? { ...m, content } : m)),
        })),
      };
    },
  );
}

/**
 * React Query infinite query hook for bi-directional chat message pagination.
 * - Initial pageParam is null (loads latest 30 messages).
 * - getPreviousPageParam prepends older pages when scrolling up.
 * - Naturally maintains top-to-bottom chronological order across data.pages.
 */
export function useConversationMessages(conversationId: string | null | undefined) {
  return useInfiniteQuery<
    PaginatedMessagesResponse,
    Error,
    InfiniteData<PaginatedMessagesResponse>,
    (string | null | undefined)[],
    string | null
  >({
    queryKey: ["conversations", conversationId, "messages"],
    queryFn: async ({ pageParam }): Promise<PaginatedMessagesResponse> => {
      if (!conversationId) {
        return { messages: [], nextCursor: null, hasMore: false };
      }
      if (conversationId.startsWith("conv-ref-") || mockMessages[conversationId]) {
        return { messages: mockMessages[conversationId] || [], nextCursor: null, hasMore: false };
      }
      try {
        const params: Record<string, string | number> = {
          limit: MESSAGES_PAGE_SIZE,
        };
        if (pageParam) {
          params.cursor = pageParam;
        }
        const res = await api.get<PaginatedMessagesResponse>(`/api/conversations/${conversationId}/messages`, {
          params,
        });
        if (res.data?.messages) {
          saveOfflineMessages(conversationId, res.data.messages).catch(() => {});
        }
        return res.data;
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          return { messages: [], nextCursor: null, hasMore: false };
        }
        // Fallback to offline IndexedDB cache
        try {
          const offlineMsgs = await getOfflineMessages(conversationId);
          if (offlineMsgs && offlineMsgs.length > 0) {
            return { messages: offlineMsgs, nextCursor: null, hasMore: false };
          }
        } catch (_) {}
        throw err;
      }
    },
    initialPageParam: null,
    getPreviousPageParam: (firstPage) => (firstPage?.hasMore ? firstPage.nextCursor : undefined),
    getNextPageParam: () => undefined,
    enabled: Boolean(conversationId),
  });
}
