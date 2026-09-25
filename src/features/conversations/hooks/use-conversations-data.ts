import { useMemo } from "react";
import { Conversation, Document } from "@/types";
import { formatRelativeTime } from "@/lib/format-time";
import { ConversationItemData } from "@/features/conversations/components/conversation-list-row";
import {
  ConversationFilterTab,
  ConversationSortOption,
} from "@/features/conversations/components/conversations-toolbar";

interface UseConversationsDataProps {
  conversations: Conversation[];
  documents: Document[];
  pinnedIds: Set<string>;
  searchQuery: string;
  activeTab: ConversationFilterTab;
  selectedDocFilter: string;
  sortBy: ConversationSortOption;
}

export function useConversationsData({
  conversations,
  documents,
  pinnedIds,
  searchQuery,
  activeTab,
  selectedDocFilter,
  sortBy,
}: UseConversationsDataProps) {
  // Map real store conversations to presentation items
  const items = useMemo<ConversationItemData[]>(() => {
    return conversations.map((c, index) => {
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
    });
  }, [conversations, documents, pinnedIds]);

  // Unique document names for dropdown filter
  const uniqueDocNames = useMemo(() => {
    const names = new Set<string>();
    items.forEach((it) => {
      if (it.docName) names.add(it.docName);
    });
    return Array.from(names);
  }, [items]);

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    let result = items;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (it) =>
          it.title.toLowerCase().includes(q) ||
          it.preview.toLowerCase().includes(q) ||
          it.docName.toLowerCase().includes(q),
      );
    }

    // Tab filter
    if (activeTab === "pinned") {
      result = result.filter((it) => it.isPinned);
    } else if (activeTab === "recent") {
      result = result.slice(0, 5);
    }

    // Document filter
    if (selectedDocFilter !== "all") {
      result = result.filter((it) => it.docName === selectedDocFilter);
    }

    // Sort
    return [...result].sort((a, b) => {
      if (sortBy === "newest") return b.timestamp - a.timestamp;
      if (sortBy === "oldest") return a.timestamp - b.timestamp;
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return 0;
    });
  }, [items, searchQuery, activeTab, selectedDocFilter, sortBy]);

  return {
    items,
    uniqueDocNames,
    filteredItems,
  };
}
