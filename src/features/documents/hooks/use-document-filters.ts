"use client";

import { useState, useMemo } from "react";
import { Document } from "@/types";
import { DocumentFilterTab } from "@/features/documents/components/document-filter-tabs";

export type DocumentSortOption = "newest" | "oldest" | "name" | "size";

export interface UseDocumentFiltersOptions {
  documents: Document[];
  favoriteDocumentIds?: string[];
}

export function useDocumentFilters({ documents, favoriteDocumentIds = [] }: UseDocumentFiltersOptions) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<DocumentFilterTab>("all");
  const [sortBy, setSortBy] = useState<DocumentSortOption>("newest");

  const filteredAndSortedDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = documents.filter((doc) => {
      const matchesSearch = query === "" || doc.originalName.toLowerCase().includes(query);
      if (!matchesSearch) return false;

      if (activeTab === "favorites") {
        return doc.isFavorite ?? favoriteDocumentIds.includes(doc.id);
      }
      if (activeTab === "processing") {
        return ["UPLOADING", "EXTRACTING", "CHUNKING", "EMBEDDING", "INDEXING"].includes(doc.status);
      }
      if (activeTab === "failed") {
        return doc.status === "FAILED";
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "name") {
        return a.originalName.localeCompare(b.originalName);
      }
      if (sortBy === "size") {
        return b.fileSize - a.fileSize;
      }
      return 0;
    });
  }, [documents, searchQuery, activeTab, sortBy, favoriteDocumentIds]);

  return {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    sortBy,
    setSortBy,
    filteredAndSortedDocuments,
  };
}
