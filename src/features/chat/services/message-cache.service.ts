import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { Message, PaginatedMessagesResponse } from "@/types";

export const MESSAGES_PAGE_SIZE = 30;

const MESSAGE_QUERY_KEYS = {
  messages: (conversationId: string) => ["conversations", conversationId, "messages"] as const,
};

/**
 * Helper to retrieve all currently cached messages for a conversation from React Query.
 */
export function getCachedMessages(queryClient: QueryClient, conversationId: string): Message[] {
  const cachedData = queryClient.getQueryData<InfiniteData<PaginatedMessagesResponse>>(
    MESSAGE_QUERY_KEYS.messages(conversationId)
  );
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
    MESSAGE_QUERY_KEYS.messages(conversationId),
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
    MESSAGE_QUERY_KEYS.messages(conversationId),
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
