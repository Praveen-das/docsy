"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Document, Conversation } from "@/types";
import { useDocuments } from "../hooks/use-documents";
import { useConversations } from "@/features/conversations/hooks/use-conversations";
import { useDocumentSearch } from "../hooks/use-document-search";
import { useUIStore } from "@/stores/ui-store";
import { Search, Plus, X } from "lucide-react";
import { GlowContainer } from "@/components/ui/glow-container";
import { ModalBackdrop, useModalDismiss } from "@/components/ui/modal-backdrop";
import {
  SearchDocumentResultItem,
  SearchConversationResultItem,
} from "./search-result-items";
import { SearchModalEmptyStates } from "./search-modal-empty-states";

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
  const { conversations } = useConversations({ enabled: effectiveIsOpen });

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!effectiveIsOpen) {
      setSearchQuery("");
    } else {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [effectiveIsOpen]);

  useModalDismiss(effectiveIsOpen, effectiveOnClose);

  const {
    query,
    filteredDocuments,
    filteredConversations,
    documentMap,
    conversationCountMap,
  } = useDocumentSearch(documents, conversations, searchQuery);

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

  if (!effectiveIsOpen) return null;

  const hasResults = filteredDocuments.length > 0 || filteredConversations.length > 0;
  const showEmptyState = (isLoadingDocs && documents.length === 0) || !query || !hasResults;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 xs:p-4 sm:p-6 select-none">
      <ModalBackdrop onClose={effectiveOnClose} />

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
            {showEmptyState ? (
              <SearchModalEmptyStates
                isLoading={isLoadingDocs && documents.length === 0}
                query={query}
                searchQuery={searchQuery}
              />
            ) : (
              <div className="space-y-4">
                {filteredDocuments.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#818ea8]">
                        Documents ({filteredDocuments.length})
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {filteredDocuments.map((doc) => (
                        <SearchDocumentResultItem
                          key={doc.id}
                          doc={doc}
                          convCount={conversationCountMap[doc.id] || 0}
                          onSelect={handleSelectDocument}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {filteredConversations.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#818ea8]">
                        Conversations ({filteredConversations.length})
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {filteredConversations.map((conv) => (
                        <SearchConversationResultItem
                          key={conv.id}
                          conv={conv}
                          linkedDoc={conv.documentIds?.[0] ? documentMap.get(conv.documentIds[0]) : undefined}
                          onSelect={handleSelectConversation}
                        />
                      ))}
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
