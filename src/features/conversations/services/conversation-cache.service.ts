import { Conversation } from "@/types";
import { getQueryClient } from "@/lib/query-client";
import { InfiniteData, QueryClient } from "@tanstack/react-query";

export const CONVERSATION_QUERY_KEYS = {
  all: ["conversations"] as const,
  recent: ["conversations", "recent"] as const,
  counts: ["conversations", "counts"] as const,
  documents: ["conversations", "document"] as const,
  byDocument: (documentId: string) => ["conversations", "document", documentId] as const,
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
  const patch = <T extends { id: string }>(list: T[]): T[] =>
    list.map((c) => (c.id === convId ? { ...c, ...updates } : c));

  client.setQueryData<ConversationsData>(CONVERSATION_QUERY_KEYS.all, (old) =>
    old ? { ...old, conversations: patch(old.conversations) } : old
  );
  client.setQueryData<Partial<Conversation>>(CONVERSATION_QUERY_KEYS.detail(convId), (old) =>
    old ? { ...old, ...updates } : old
  );
  client.setQueriesData<InfiniteData<{ conversations: Conversation[]; pinnedIds?: string[]; nextOffset: number | null }>>(
    { queryKey: CONVERSATION_QUERY_KEYS.recent },
    (old) =>
      old && { ...old, pages: old.pages.map((p) => ({ ...p, conversations: patch(p.conversations) })) }
  );
  client.setQueriesData<{ conversations: Conversation[] }>(
    { queryKey: CONVERSATION_QUERY_KEYS.documents },
    (old) => old && { ...old, conversations: patch(old.conversations) }
  );
}

/**
 * Optimistically prepend a newly created conversation to all active caches.
 */
export function addConversationToCache(conv: Conversation): void {
  const client = getQueryClient();

  client.setQueryData<ConversationsData>(CONVERSATION_QUERY_KEYS.all, (old) => ({
    conversations: [conv, ...(old?.conversations || [])],
    pinnedIds: old?.pinnedIds || [],
  }));

  client.setQueryData(CONVERSATION_QUERY_KEYS.detail(conv.id), conv);

  client.setQueriesData<InfiniteData<{ conversations: Conversation[]; pinnedIds?: string[]; nextOffset: number | null }>>(
    { queryKey: CONVERSATION_QUERY_KEYS.recent },
    (old) => {
      if (!old || old.pages.length === 0) return old;
      const firstPage = old.pages[0];
      return {
        ...old,
        pages: [
          {
            ...firstPage,
            conversations: [conv, ...firstPage.conversations.filter((c) => c.id !== conv.id)],
          },
          ...old.pages.slice(1),
        ],
      };
    }
  );

  conv.documentIds?.forEach((docId) => {
    client.setQueryData<{ conversations: Conversation[] }>(
      CONVERSATION_QUERY_KEYS.byDocument(docId),
      (old) =>
        old && {
          ...old,
          conversations: [conv, ...old.conversations.filter((c) => c.id !== conv.id)],
        }
    );
  });

  client.setQueryData<{ total: number; byDocument: Record<string, number> }>(
    CONVERSATION_QUERY_KEYS.counts,
    (old) => {
      if (!old) return old;
      const nextByDoc = { ...old.byDocument };
      conv.documentIds?.forEach((docId) => {
        nextByDoc[docId] = (nextByDoc[docId] || 0) + 1;
      });
      return {
        ...old,
        total: old.total + 1,
        byDocument: nextByDoc,
      };
    }
  );
}

/**
 * Optimistically remove a conversation from all active caches.
 */
export function removeConversationFromCache(convId: string): void {
  const client = getQueryClient();

  client.setQueryData<ConversationsData>(CONVERSATION_QUERY_KEYS.all, (old) =>
    old
      ? {
          ...old,
          conversations: old.conversations.filter((c) => c.id !== convId),
          pinnedIds: old.pinnedIds.filter((id) => id !== convId),
        }
      : old
  );

  client.setQueriesData<InfiniteData<{ conversations: Conversation[]; pinnedIds?: string[]; nextOffset: number | null }>>(
    { queryKey: CONVERSATION_QUERY_KEYS.recent },
    (old) =>
      old && {
        ...old,
        pages: old.pages.map((p) => ({
          ...p,
          conversations: p.conversations.filter((c) => c.id !== convId),
          pinnedIds: p.pinnedIds ? p.pinnedIds.filter((id) => id !== convId) : p.pinnedIds,
        })),
      }
  );

  client.setQueriesData<{ conversations: Conversation[] }>(
    { queryKey: CONVERSATION_QUERY_KEYS.documents },
    (old) =>
      old && {
        ...old,
        conversations: old.conversations.filter((c) => c.id !== convId),
      }
  );

  client.setQueryData<{ total: number; byDocument: Record<string, number> }>(
    CONVERSATION_QUERY_KEYS.counts,
    (old) => {
      if (!old) return old;
      return {
        ...old,
        total: Math.max(0, old.total - 1),
      };
    }
  );

  client.removeQueries({ queryKey: CONVERSATION_QUERY_KEYS.detail(convId) });
}

/**
 * Optimistically toggle pin status across all active caches.
 */
export function togglePinInCache(convId: string): void {
  const client = getQueryClient();
  const toggle = (list: string[]) =>
    list.includes(convId) ? list.filter((id) => id !== convId) : [...list, convId];

  client.setQueryData<ConversationsData>(CONVERSATION_QUERY_KEYS.all, (old) =>
    old ? { ...old, pinnedIds: toggle(old.pinnedIds) } : old
  );

  client.setQueriesData<InfiniteData<{ conversations: Conversation[]; pinnedIds?: string[]; nextOffset: number | null }>>(
    { queryKey: CONVERSATION_QUERY_KEYS.recent },
    (old) =>
      old && {
        ...old,
        pages: old.pages.map((p) => ({
          ...p,
          pinnedIds: p.pinnedIds ? toggle(p.pinnedIds) : p.pinnedIds,
        })),
      }
  );
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

