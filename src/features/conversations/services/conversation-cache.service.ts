import { Conversation } from "@/types";
import { getQueryClient } from "@/lib/query-client";
import { QueryClient } from "@tanstack/react-query";

export const CONVERSATION_QUERY_KEYS = {
  all: ["conversations"] as const,
  detail: (id: string) => ["conversations", id] as const,
};

export interface ConversationsData {
  conversations: Conversation[];
  pinnedIds: string[];
}

/**
 * Update partial conversation fields in React Query cache.
 */
export function updateConversationInCache(
  convId: string,
  updates: Partial<Conversation>
): void {
  const client = getQueryClient();
  client.setQueryData<ConversationsData>(CONVERSATION_QUERY_KEYS.all, (old) => {
    if (!old) return old;
    return {
      ...old,
      conversations: old.conversations.map((c) =>
        c.id === convId ? { ...c, ...updates } : c
      ),
    };
  });
}

/**
 * Cancels active queries and snapshots current conversation cache for optimistic rollback.
 */
export async function snapshotConversationsCache(queryClient: QueryClient): Promise<ConversationsData | undefined> {
  await queryClient.cancelQueries({ queryKey: CONVERSATION_QUERY_KEYS.all });
  return queryClient.getQueryData<ConversationsData>(CONVERSATION_QUERY_KEYS.all);
}

/**
 * Restores conversation cache from snapshot on mutation error.
 */
export function rollbackConversationsCache(
  queryClient: QueryClient,
  context?: { previousData?: ConversationsData }
): void {
  if (context?.previousData) {
    queryClient.setQueryData(CONVERSATION_QUERY_KEYS.all, context.previousData);
  }
}

/**
 * Invalidates conversation queries to refetch fresh data.
 */
export function invalidateConversationsCache(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: CONVERSATION_QUERY_KEYS.all });
}

