import { useMemo } from "react";
import type { Document, Conversation } from "@/types";

export function useDocumentSearch(
  documents: Document[],
  conversations: Conversation[],
  searchQuery: string,
) {
  const query = searchQuery.trim().toLowerCase();

  const filteredDocuments = useMemo(() => {
    if (!query) return [];
    return documents.filter((doc) => doc.originalName.toLowerCase().includes(query));
  }, [documents, query]);

  const filteredConversations = useMemo(() => {
    if (!query) return [];
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        Boolean(c.lastMessageSnippet && c.lastMessageSnippet.toLowerCase().includes(query)),
    );
  }, [conversations, query]);

  const documentMap = useMemo(() => {
    const map = new Map<string, Document>();
    for (const doc of documents) {
      map.set(doc.id, doc);
    }
    return map;
  }, [documents]);

  const conversationCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const conv of conversations) {
      for (const docId of conv.documentIds) {
        map[docId] = (map[docId] || 0) + 1;
      }
    }
    return map;
  }, [conversations]);

  return {
    query,
    filteredDocuments,
    filteredConversations,
    documentMap,
    conversationCountMap,
  };
}
