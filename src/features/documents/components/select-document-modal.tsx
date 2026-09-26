"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Document, Conversation } from "@/types";
import { useDocuments } from "../hooks/use-documents";
import { useConversations } from "@/features/conversations/hooks/use-conversations";
import { useUIStore } from "@/stores/ui-store";
import { formatRelativeTime } from "@/lib/format-time";
import { FileText, Search, ArrowRight, Plus, X, MessageSquare, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowContainer } from "@/components/ui/glow-container";
import { GlowCard } from "@/components/ui/glow-card";
import { ModalBackdrop } from "@/components/ui/modal-backdrop";

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
  const inputRef = useRef<HTMLInputElement>(null);
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

  const { data: documents = [], isLoading: isLoadingDocs } = useDocuments();
  const { conversations } = useConversations();

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!effectiveIsOpen) {
      setSearchQuery("");
    } else {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
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
        (c.lastMessageSnippet && c.lastMessageSnippet.toLowerCase().includes(query))
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

  const handleSelectDocument = (doc: Document) => {
    if (onSelectDocument) {
      onSelectDocument(doc);
    } else {
      router.push(`/conversation?doc=${doc.id}`);
    }
    effectiveOnClose();
  };

  const handleSelectConversation = (conv: Conversation) => {
    const docId = conv.documentIds?.[0] || "";
    router.push(`/conversation?doc=${docId}&conv=${conv.id}`);
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
      <ModalBackdrop onClose={effectiveOnClose} />

      {/* Modal Container */}
      <GlowContainer
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-modal-title"
        className="w-full h-full max-w-xl rounded-[24px] sm:rounded-[28px] p-4 xs:p-5 sm:p-6 transition-all duration-150 ease-out transform animate-in fade-in zoom-in-95"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 pb-3.5 sm:pb-4 border-b border-white/[0.06] relative z-10">
          <div className="min-w-0 flex-1">
            <h2 id="search-modal-title" className="text-base sm:text-lg font-semibold tracking-tight text-[#f1f3f9]">
              Search
            </h2>
            <p className="text-xs sm:text-[13px] text-[#7d879d] mt-0.5 sm:mt-1 font-normal leading-relaxed">
              Search across all your documents and conversation history.
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
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents and conversations..."
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

          {/* Results List */}
          <div className="max-h-[min(420px,55dvh)] overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            {isLoadingDocs && documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-[#8b95a8]">
                <Loader2 className="h-7 w-7 animate-spin text-indigo-400 mb-2" />
                <p className="text-xs sm:text-[13.5px] font-medium">Loading...</p>
              </div>
            ) : !query ? (
              /* Empty initial prompt state before user types */
              <div className="py-12 sm:py-16 text-center select-none">
                <div className="mx-auto flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06] text-[#727f9d] mb-3 shadow-inner">
                  <Search className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-[#f1f3f9]">Search Docsy</h3>
                <p className="text-[11px] sm:text-xs text-[#7d879d] mt-1 max-w-xs mx-auto leading-relaxed px-4">
                  Type to search across all uploaded documents and past conversations.
                </p>
              </div>
            ) : filteredDocuments.length === 0 && filteredConversations.length === 0 ? (
              /* No matches found */
              <div className="py-12 sm:py-16 text-center select-none">
                <AlertCircle className="mx-auto h-7 w-7 sm:h-8 sm:w-8 text-[#727f9d] mb-2" />
                <p className="text-xs sm:text-sm font-medium text-[#f1f3f9]">No results found</p>
                <p className="text-[11px] sm:text-xs text-[#7d879d] mt-1 px-4">
                  No documents or conversations match &ldquo;{searchQuery}&rdquo;.
                </p>
              </div>
            ) : (
              /* Matches found: separate lists for Documents & Conversations */
              <div className="space-y-4">
                {/* Documents Section */}
                {filteredDocuments.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#818ea8]">
                        Documents ({filteredDocuments.length})
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {filteredDocuments.map((doc) => {
                        const convCount = conversationCountMap[doc.id] || 0;
                        const isReady = doc.status === "READY" || !doc.status;

                        return (
                          <GlowCard
                            key={doc.id}
                            onClick={() => handleSelectDocument(doc)}
                            hasHoverEffect={false}
                            className="group relative flex items-center justify-between rounded-xl sm:rounded-2xl p-2.5 sm:p-3 transition-all duration-150 cursor-pointer active:scale-[0.99]"
                          >
                            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 pr-2 flex-1">
                              <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-[#171b2e] border border-white/[0.08] text-[#a3b8fc] group-hover:scale-105 transition-transform shadow-inner">
                                <FileText className="h-4 w-4 stroke-[1.8]" />
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

                                <div className="mt-0.5 flex flex-wrap items-center gap-1 sm:gap-2 text-[10.5px] sm:text-[11.5px] text-[#7d879d]">
                                  <span>{doc.pageCount || 1} pgs</span>
                                  <span>•</span>
                                  <span>{formatFileSize(doc.fileSize)}</span>
                                  <span>•</span>
                                  <span>{formatRelativeTime(doc.createdAt || doc.updatedAt)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                              {convCount > 0 && (
                                <div className="hidden xs:flex items-center gap-1 text-[11px] text-[#7d879d] bg-white/[0.03] border border-white/[0.05] px-2 py-0.5 rounded-lg">
                                  <MessageSquare className="h-3 w-3 text-[#8b95a8]" />
                                  <span>{convCount}</span>
                                </div>
                              )}
                              <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-white/[0.04] text-[#7d879d] border border-white/[0.06] group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-all">
                                <ArrowRight className="h-3 w-3 sm:h-3.5 w-3.5" />
                              </div>
                            </div>
                          </GlowCard>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Conversations Section */}
                {filteredConversations.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#818ea8]">
                        Conversations ({filteredConversations.length})
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {filteredConversations.map((conv) => {
                        const linkedDoc = conv.documentIds?.[0] ? documentMap.get(conv.documentIds[0]) : undefined;

                        return (
                          <GlowCard
                            key={conv.id}
                            onClick={() => handleSelectConversation(conv)}
                            hasHoverEffect={false}
                            className="group relative flex items-center justify-between rounded-xl sm:rounded-2xl p-2.5 sm:p-3 transition-all duration-150 cursor-pointer active:scale-[0.99]"
                          >
                            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 pr-2 flex-1">
                              <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-transform shadow-inner">
                                <MessageSquare className="h-4 w-4 stroke-[1.8]" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <span className="truncate text-xs sm:text-[13.5px] font-semibold text-[#f1f3f9] group-hover:text-white transition-colors">
                                    {conv.title}
                                  </span>
                                </div>

                                {conv.lastMessageSnippet && (
                                  <p className="truncate text-[11px] sm:text-[12px] text-[#818ea8] mt-0.5">
                                    {conv.lastMessageSnippet}
                                  </p>
                                )}

                                <div className="mt-0.5 flex flex-wrap items-center gap-1 sm:gap-2 text-[10.5px] sm:text-[11.5px] text-[#7d879d]">
                                  {linkedDoc && (
                                    <>
                                      <span className="text-indigo-400/90 truncate max-w-[150px]">
                                        {linkedDoc.originalName}
                                      </span>
                                      <span>•</span>
                                    </>
                                  )}
                                  <span>{formatRelativeTime(conv.updatedAt)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                              <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-white/[0.04] text-[#7d879d] border border-white/[0.06] group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-all">
                                <ArrowRight className="h-3 w-3 sm:h-3.5 w-3.5" />
                              </div>
                            </div>
                          </GlowCard>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </GlowContainer>
    </div>
  );
}
