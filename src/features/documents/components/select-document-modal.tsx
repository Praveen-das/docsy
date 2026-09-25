"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { GlowContainer } from "@/components/ui/glow-container";
import { GlowCard } from "@/components/ui/glow-card";

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
  const effectiveOpenUpload =
    onOpenUpload ??
    (() => {
      setSearchOpen(false);
      openUpload();
    });

  const documents = useDocumentStore((state) => state.documents);
  const isLoadingDocs = useDocumentStore((state) => state.isLoading);
  const fetchDocuments = useDocumentStore((state) => state.fetchDocuments);
  const conversations = useConversationStore((state) => state.conversations);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (effectiveIsOpen && documents.length === 0) {
      fetchDocuments();
    }
  }, [effectiveIsOpen, documents.length, fetchDocuments]);

  useEffect(() => {
    if (!effectiveIsOpen) {
      setSearchQuery("");
    }
  }, [effectiveIsOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && effectiveIsOpen) {
        effectiveOnClose();
      }
    };

    if (effectiveIsOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [effectiveIsOpen, effectiveOnClose]);

  const filteredDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return documents;
    return documents.filter((doc) => doc.originalName.toLowerCase().includes(query));
  }, [documents, searchQuery]);

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

  if (!effectiveIsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 xs:p-4 sm:p-6 select-none">
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={effectiveOnClose}
        className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-sm transition-opacity duration-150 animate-in fade-in"
      />

      {/* Modal Container */}
      <GlowContainer
        role="dialog"
        aria-modal="true"
        aria-labelledby="select-doc-title"
        className="w-full max-w-xl rounded-[24px] sm:rounded-[28px] p-4 xs:p-5 sm:p-6 max-h-[calc(100dvh-1.5rem)] overflow-y-auto custom-scrollbar transition-all duration-150 ease-out transform animate-in fade-in zoom-in-95"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 pb-3.5 sm:pb-4 border-b border-white/[0.06] relative z-10">
          <div className="min-w-0 flex-1">
            <h2 id="select-doc-title" className="text-base sm:text-lg font-semibold tracking-tight text-[#f1f3f9]">
              Select a Document
            </h2>
            <p className="text-xs sm:text-[13px] text-[#7d879d] mt-0.5 sm:mt-1 font-normal leading-relaxed">
              Choose a document from your library to open in conversation.
            </p>
          </div>

          <button
            type="button"
            onClick={effectiveOnClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[#7d879d] hover:text-white hover:bg-white/5 transition-colors cursor-pointer active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3.5 sm:space-y-4 pt-3.5 sm:pt-4 relative z-10">
          {/* Search Input & Upload Action */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#727f9d] stroke-[1.8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents by name..."
                className="w-full h-10 rounded-xl border border-(--tile-border) bg-(--tile-bg) pl-9 sm:pl-10 pr-8 text-xs sm:text-[13.5px] text-[#f1f3f9] placeholder-[#687593] transition-colors focus:border-indigo-400/40 focus:bg-[#141824]/90 focus:outline-none focus:ring-1 focus:ring-indigo-400/30"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#727f9d] hover:text-white transition-colors p-1"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {effectiveOpenUpload && (
              <button
                type="button"
                onClick={() => {
                  effectiveOnClose();
                  effectiveOpenUpload();
                }}
                className="flex items-center gap-1.5 h-10 px-3 sm:px-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-xs sm:text-[13px] font-medium text-[#c5cbe0] hover:text-white hover:bg-white/[0.08] hover:border-white/15 transition-all active:scale-[0.98] shrink-0 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#8b95a8]" />
                <span>Upload</span>
              </button>
            )}
          </div>

          {/* Documents List */}
          <div className="max-h-[min(380px,50dvh)] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {isLoadingDocs && documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-[#8b95a8]">
                <Loader2 className="h-7 w-7 animate-spin text-indigo-400 mb-2" />
                <p className="text-xs sm:text-[13.5px] font-medium">Loading documents...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              searchQuery ? (
                <div className="py-10 sm:py-12 text-center">
                  <AlertCircle className="mx-auto h-7 w-7 sm:h-8 sm:w-8 text-[#727f9d] mb-2" />
                  <p className="text-xs sm:text-sm font-medium text-[#f1f3f9]">No documents found</p>
                  <p className="text-[11px] sm:text-xs text-[#7d879d] mt-1 px-4">
                    No matches for &ldquo;{searchQuery}&rdquo;. Try another search term.
                  </p>
                </div>
              ) : (
                <div className="py-10 sm:py-12 text-center">
                  <div className="mx-auto flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06] text-indigo-300 mb-3 shadow-inner">
                    <UploadCloud className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-[#f1f3f9]">No documents uploaded yet</h3>
                  <p className="text-[11px] sm:text-xs text-[#7d879d] mt-1 max-w-xs mx-auto leading-relaxed px-4">
                    Upload your first PDF document to begin chatting with Docsy AI.
                  </p>
                  {effectiveOpenUpload && (
                    <button
                      type="button"
                      onClick={() => {
                        effectiveOnClose();
                        effectiveOpenUpload();
                      }}
                      className="mt-3.5 inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/30 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Upload Document</span>
                    </button>
                  )}
                </div>
              )
            ) : (
              filteredDocuments.map((doc) => {
                const convCount = conversationCountMap[doc.id] || 0;
                const isReady = doc.status === "READY" || !doc.status;

                return (
                  <GlowCard
                    key={doc.id}
                    onClick={() => handleSelect(doc)}
                    hasHoverEffect={false}
                    className={cn(
                      "group relative flex items-center justify-between rounded-2xl p-2.5 sm:p-3.5 transition-all duration-150 cursor-pointer active:scale-[0.99]",
                    )}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 pr-2 flex-1">
                      <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-[#171b2e] border border-white/[0.08] text-[#a3b8fc] group-hover:scale-105 transition-transform shadow-inner">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 stroke-[1.8]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="truncate text-xs sm:text-[13.5px] font-semibold text-[#f1f3f9] group-hover:text-white transition-colors">
                            {doc.originalName}
                          </span>
                          {!isReady && (
                            <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[9.5px] sm:text-[10px] font-medium text-amber-400 shrink-0">
                              {doc.status}
                            </span>
                          )}
                        </div>

                        <div className="mt-0.5 sm:mt-1 flex flex-wrap items-center gap-1 sm:gap-2 text-[10.5px] sm:text-[12px] text-[#7d879d]">
                          <span>{doc.pageCount || 1} pgs</span>
                          <span>•</span>
                          <span>{formatFileSize(doc.fileSize)}</span>
                          <span>•</span>
                          <span>{formatRelativeTime(doc.createdAt || doc.updatedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      {convCount > 0 && (
                        <div className="hidden xs:flex items-center gap-1 text-[11px] sm:text-xs text-[#7d879d] bg-white/[0.03] border border-white/[0.05] px-2 py-0.5 sm:py-1 rounded-lg">
                          <MessageSquare className="h-3 w-3 text-[#8b95a8]" />
                          <span>{convCount}</span>
                        </div>
                      )}
                      <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-white/[0.04] text-[#7d879d] border border-white/[0.06] group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-all">
                        <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </div>
                    </div>
                  </GlowCard>
                );
              })
            )}
          </div>
        </div>
      </GlowContainer>
    </div>
  );
}
