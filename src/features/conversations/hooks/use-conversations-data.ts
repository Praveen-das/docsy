import { useEffect, useMemo, useState } from "react";
import { Document } from "@/types";
import { formatRelativeTime } from "@/lib/format-time";
import { ConversationItemData } from "@/features/conversations/components/conversation-list-row";
import {
  ConversationFilterTab,
  ConversationSortOption,
} from "@/features/conversations/components/conversations-toolbar";
import { useRecentConversations } from "./use-conversations";

interface UseConversationsDataProps {
  documents: Document[];
  searchQuery: string;
  activeTab: ConversationFilterTab;
  selectedDocFilter: string;
  sortBy: ConversationSortOption;
}

const SEARCH_DEBOUNCE_MS = 300;
const RECENT_TAB_SIZE = 5;

/**
 * Server-driven conversations list: search, tab, document filter and sort are query params,
 * so only the visible page is fetched.
 */
export function useConversationsData({
  documents,
  searchQuery,
  activeTab,
  selectedDocFilter,
  sortBy,
}: UseConversationsDataProps) {
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const documentId = useMemo(
    () => (selectedDocFilter === "all" ? undefined : documents.find((d) => d.originalName === selectedDocFilter)?.id),
    [documents, selectedDocFilter],
  );

  const { conversations, pinnedIds, ...query } = useRecentConversations(
    {
      search: debouncedSearch.trim() || undefined,
      documentId,
      pinned: activeTab === "pinned" ? true : undefined,
      sort: activeTab === "recent" ? "newest" : sortBy,
    },
    activeTab === "recent" ? RECENT_TAB_SIZE : undefined,
  );

  const items = useMemo<ConversationItemData[]>(
    () =>
      conversations.map((c, index) => {
        const linkedDoc = documents.find((d) => c.documentIds?.includes(d.id));
        return {
          id: c.id,
          title: c.title,
          preview: c.lastMessageSnippet || "No messages yet in this conversation.",
          docName: linkedDoc?.originalName || (documents[0]?.originalName ?? "Document.pdf"),
          docId: linkedDoc?.id || c.documentIds?.[0] || "",
          timeText: formatRelativeTime(c.updatedAt),
          timestamp: new Date(c.updatedAt).getTime(),
          isPinned: pinnedIds.has(c.id),
          index,
        };
      }),
    [conversations, documents, pinnedIds],
  );

  const uniqueDocNames = useMemo(() => Array.from(new Set(documents.map((d) => d.originalName))), [documents]);

  return {
    uniqueDocNames,
    items,
    isLoading: query.isLoading,
    hasNextPage: activeTab !== "recent" && query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
  };
}
