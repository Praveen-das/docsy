import { useQuery } from "@tanstack/react-query";
import { Message } from "@/types";

/**
 * React Query hook to fetch and cache messages for a specific conversation.
 * Provides caching, automatic deduplication, and stale-while-revalidate behavior.
 */
export function useConversationMessages(conversationId: string | null | undefined) {
  return useQuery<Message[], Error>({
    queryKey: ["conversations", conversationId, "messages"],
    queryFn: async (): Promise<Message[]> => {
      if (!conversationId) return [];
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      if (!res.ok) {
        if (res.status === 404) {
          return [];
        }
        throw new Error(`Failed to load messages (${res.status})`);
      }
      return res.json();
    },
    enabled: Boolean(conversationId),
  });
}
