"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Document } from "@/types";
import { useDocumentStore } from "@/stores/document-store";
import { useConversationStore } from "@/stores/conversation-store";
import { useUIStore } from "@/stores/ui-store";
import { formatRelativeTime } from "@/lib/format-time";
import {
  FileText,
  Search,
  UploadCloud,
  ArrowRight,
  Plus,
  X,
  MessageSquare,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectDocumentModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSelectDocument?: (doc: Document) => void;
  onOpenUpload?: () => void;
}

export function SelectDocumentModal({
  isOpen,
  onClose,
  onSelectDocument,
  onOpenUpload,
}: SelectDocumentModalProps = {}) {
  const router = useRouter();
  const storeIsOpen = useUIStore((state) => state.isSearchOpen);
  const setSearchOpen = useUIStore((state) => state.setSearchOpen);
  const openUpload = useUIStore((state) => state.openUpload);

  const effectiveIsOpen = isOpen ?? storeIsOpen;
  const effectiveOnClose = onClose ?? (() => setSearchOpen(false));
  const effectiveOpenUpload = onOpenUpload ?? (() => {
    setSearchOpen(false);
    openUpload();
  });

  const documents = useDocumentStore((state) => state.documents);
  const isLoadingDocs = useDocumentStore((state) => state.isLoading);
  const fetchDocuments = useDocumentStore((state) => state.fetchDocuments);
  const conversations = useConversationStore((state) => state.conversations);

  const [searchQuery, setSearchQuery] = useState("");

  // Ensure documents are loaded when modal opens
  useEffect(() => {
    if (effectiveIsOpen && documents.length === 0) {
      fetchDocuments();
    }
  }, [effectiveIsOpen, documents.length, fetchDocuments]);

  // Reset search when modal opens/closes
  useEffect(() => {
    if (!effectiveIsOpen) {
      setSearchQuery("");
    }
  }, [effectiveIsOpen]);

  // Filter documents by title / filename
  const filteredDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return documents;
    return documents.filter((doc) =>
      doc.originalName.toLowerCase().includes(query)
    );
  }, [documents, searchQuery]);

  // Conversation count mapping per document
  const conversationCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const conv of conversations) {
      for (const docId of conv.documentIds) {
        map[docId] = (map[docId] || 0) + 1;
      }
    }
    return map;
  }, [conversations]);

  const handleSelect = (doc: Document) => {
    if (onSelectDocument) {
      onSelectDocument(doc);
    } else {
      router.push(`/conversation?doc=${doc.id}`);
    }
    effectiveOnClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return "0 KB";
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = Math.round(bytes / 1024);
    return `${kb} KB`;
  };

  return (
    <Dialog
      isOpen={effectiveIsOpen}
      onClose={effectiveOnClose}
      title="Select a Document"
      description="Choose a document from your library to open in the conversation workspace."
      className="max-w-xl"
    >
      <div className="space-y-4 pt-1">
        {/* Search input & upload button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents by name..."
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 pl-9 pr-8 py-2 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-zinc-400 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-[#16161b] dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-white/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {effectiveOpenUpload && (
            <Button
              onClick={() => {
                effectiveOnClose();
                effectiveOpenUpload();
              }}
              variant="outline"
              size="sm"
              className="shrink-0 h-9 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Upload</span>
            </Button>
          )}
        </div>

        {/* Documents list */}
        <div className="max-h-[380px] overflow-y-auto space-y-2 pr-0.5 custom-scrollbar">
          {isLoadingDocs && documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
              <Loader2 className="h-7 w-7 animate-spin text-zinc-600 dark:text-zinc-400 mb-2" />
              <p className="text-sm font-medium">Loading documents...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            searchQuery ? (
              <div className="py-10 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-zinc-400 dark:text-zinc-500 mb-2" />
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  No documents found
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  No matches for &ldquo;{searchQuery}&rdquo;. Try another search term.
                </p>
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-800 dark:bg-white/5 dark:text-white mb-3">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  No documents uploaded yet
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                  Upload your first PDF document to begin chatting with Docsy AI.
                </p>
                {effectiveOpenUpload && (
                  <Button
                    onClick={() => {
                      effectiveOnClose();
                      effectiveOpenUpload();
                    }}
                    variant="accent"
                    className="mt-4 gap-1.5"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Upload Document</span>
                  </Button>
                )}
              </div>
            )
          ) : (
            filteredDocuments.map((doc) => {
              const convCount = conversationCountMap[doc.id] || 0;
              const isReady = doc.status === "READY" || !doc.status;

              return (
                <div
                  key={doc.id}
                  onClick={() => handleSelect(doc)}
                  className={cn(
                    "group relative flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3.5 transition-all duration-150 hover:border-zinc-300 hover:bg-zinc-50/70 cursor-pointer shadow-2xs",
                    "dark:border-white/5 dark:bg-[#16161b] dark:hover:border-white/10 dark:hover:bg-[#1a1a22]"
                  )}
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-white/5 dark:text-zinc-300 dark:border-white/5 group-hover:scale-105 transition-transform">
                      <FileText className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-zinc-900 group-hover:text-zinc-950 dark:text-zinc-100 dark:group-hover:text-white transition-colors">
                          {doc.originalName}
                        </span>
                        {!isReady && (
                          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400 shrink-0">
                            {doc.status}
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <span>{doc.pageCount || 1} pages</span>
                        <span>•</span>
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(doc.createdAt || doc.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {convCount > 0 && (
                      <div className="hidden sm:flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>{convCount}</span>
                      </div>
                    )}
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white dark:bg-white/5 dark:text-zinc-500 dark:group-hover:bg-white/10 dark:group-hover:text-white transition-colors">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Dialog>
  );
}
