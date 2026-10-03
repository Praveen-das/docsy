import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";
import { PaginatedMessagesResponse } from "@/types";
import { api } from "@/lib/api-client";
import axios from "axios";
import { saveOfflineMessages, getOfflineMessages } from "@/lib/offline-db";
import { mockMessages } from "@/lib/mock-data";
import { MESSAGES_PAGE_SIZE } from "../services/message-cache.service";
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
