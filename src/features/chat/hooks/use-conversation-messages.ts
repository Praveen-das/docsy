import { useInfiniteQuery, InfiniteData, QueryClient } from "@tanstack/react-query";
import { Message, PaginatedMessagesResponse } from "@/types";
import { api } from "@/lib/api-client";
import axios from "axios";

export const MESSAGES_PAGE_SIZE = 30;

/**
 * Extracts and deduplicates all messages across loaded pages in strict chronological order.
 */
export function extractMessagesFromInfiniteData(
  data: InfiniteData<PaginatedMessagesResponse> | undefined
): Message[] {
  if (!data?.pages || data.pages.length === 0) return [];
  const map = new Map<string, Message>();
  // Pages are fetched starting from newest (page 0) to older pages (page 1, 2, ...).
  // Iterate in reverse (oldest page first) so later pages override any stale turns.
  for (let i = data.pages.length - 1; i >= 0; i--) {
    const page = data.pages[i];
    if (Array.isArray(page?.messages)) {
      for (const msg of page.messages) {
        map.set(msg.id, msg);
      }
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

/**
 * Helper to retrieve all currently cached messages for a conversation from React Query.
 */
export function getCachedMessages(
  queryClient: QueryClient,
  conversationId: string
): Message[] {
  const cachedData = queryClient.getQueryData<InfiniteData<PaginatedMessagesResponse>>([
    "conversations",
    conversationId,
    "messages",
  ]);
  return extractMessagesFromInfiniteData(cachedData);
}

/**
 * React Query infinite query hook to fetch and cache messages sequentially.
 * - Initial pageParam is null (loads latest 30 messages).
 * - getNextPageParam returns `nextCursor` to load older messages when user scrolls up.
 * - Automatically attaches x-conversation-token via Axios interceptor for 0ms in-memory auth.
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
      try {
        const params: Record<string, string | number> = {
          limit: MESSAGES_PAGE_SIZE,
        };
        if (pageParam) {
          params.cursor = pageParam;
        }
        const res = await api.get<PaginatedMessagesResponse>(
          `/api/conversations/${conversationId}/messages`,
          { params }
        );
        return res.data;
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          return { messages: [], nextCursor: null, hasMore: false };
        }
        throw err;
      }
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled: Boolean(conversationId),
  });
}
