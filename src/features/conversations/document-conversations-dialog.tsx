"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Document, Conversation } from "@/types";
import { useConversationStore } from "@/stores/conversation-store";
import { formatRelativeTime } from "@/lib/format-time";
import {
  MessageSquare,
  Plus,
  ArrowRight,
  FileText,
  Clock,
  X,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowContainer } from "@/components/ui/glow-container";
import { GlowRow } from "@/components/ui/glow-row";

interface DocumentConversationsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
}

export function DocumentConversationsDialog({
  isOpen,
  onClose,
  document,
}: DocumentConversationsDialogProps) {
  const router = useRouter();
  const conversations = useConversationStore((state) => state.conversations);
  const activeConversationId = useConversationStore(
    (state) => state.activeConversationId
  );
  const createConversation = useConversationStore(
    (state) => state.createConversation
  );
  const switchConversation = useConversationStore(
    (state) => state.switchConversation
  );

  const [searchQuery, setSearchQuery] = useState("");

  // Handle ESC key and scroll locking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      if (typeof window !== "undefined") {
        window.document.body.style.overflow = "hidden";
      }
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [isOpen, onClose]);

  // Reset search when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Filter conversations for this document, sorted by most recently updated
  const docConversations = useMemo(() => {
    if (!document) return [];
    return conversations
      .filter((c) => c.documentIds.includes(document.id))
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }, [conversations, document]);

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return docConversations;
    return docConversations.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        (c.lastMessageSnippet && c.lastMessageSnippet.toLowerCase().includes(query))
    );
  }, [docConversations, searchQuery]);

  if (!isOpen || !document) return null;

  const handleOpenConversation = (conv: Conversation) => {
    switchConversation(conv.id);
    onClose();
    router.push(`/conversation?doc=${document.id}&conv=${conv.id}`);
  };

  const handleCreateNew = async () => {
    try {
      const newConvId = await createConversation(document.id);
      onClose();
      router.push(`/conversation?doc=${document.id}&conv=${newConvId}`);
    } catch (err) {
      console.error("Failed to create conversation:", err);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return "0 KB";
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = Math.round(bytes / 1024);
    return `${kb} KB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-sm transition-opacity duration-150 animate-in fade-in"
      />

      {/* Modal Container: Styled consistent with SelectDocumentModal */}
      <GlowContainer
        role="dialog"
        aria-modal="true"
        aria-labelledby="doc-conversations-title"
        className="w-full max-w-xl rounded-[28px] p-5 sm:p-6 transition-all duration-150 ease-out transform animate-in fade-in zoom-in-95"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.06] relative z-10">
          <div className="min-w-0 flex-1">
            <h2
              id="doc-conversations-title"
              className="text-[17px] sm:text-lg font-semibold tracking-tight text-[#f1f3f9] truncate"
            >
              {document.originalName}
            </h2>
            <div className="mt-1 flex items-center gap-2 text-[12.5px] text-[#7d879d]">
              <div className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-[#8b95a8]" />
                <span>{document.pageCount || 1} pages</span>
              </div>
              <span>•</span>
              <span>{formatFileSize(document.fileSize)}</span>
              <span>•</span>
              <span className="rounded-full bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 text-[11px] font-medium text-[#c5cbe0]">
                {docConversations.length} conversation{docConversations.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[#7d879d] hover:text-white hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 pt-4 relative z-10">
          {/* Search Input & New Conversation Action */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#727f9d] stroke-[1.8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full h-10 rounded-xl border border-white/[0.08] bg-[#141824]/60 pl-10 pr-9 text-[13.5px] text-[#f1f3f9] placeholder-[#687593] transition-colors focus:border-indigo-400/40 focus:bg-[#141824]/90 focus:outline-none focus:ring-1 focus:ring-indigo-400/30"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#727f9d] hover:text-white transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleCreateNew}
              className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-medium shadow-md shadow-indigo-600/30 transition-all active:scale-[0.98] shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>New</span>
            </button>
          </div>

          {/* Conversations List using GlowRow */}
          <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredConversations.length === 0 ? (
              searchQuery ? (
                <div className="py-12 text-center">
                  <MessageSquare className="mx-auto h-8 w-8 text-[#727f9d] mb-2" />
                  <p className="text-sm font-medium text-[#f1f3f9]">No conversations found</p>
                  <p className="text-xs text-[#7d879d] mt-1">
                    No matches for &ldquo;{searchQuery}&rdquo;. Try another search term.
                  </p>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06] text-indigo-300 mb-3 shadow-inner">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#f1f3f9]">No conversations yet</h3>
                  <p className="text-xs text-[#7d879d] mt-1 max-w-xs mx-auto leading-relaxed">
                    Start a fresh topic to explore, ask questions, and brainstorm with this document.
                  </p>
                  <button
                    type="button"
                    onClick={handleCreateNew}
                    className="mt-4 inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/30 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Start conversation</span>
                  </button>
                </div>
              )
            ) : (
              filteredConversations.map((conv) => {
                const isActive = activeConversationId === conv.id;

                return (
                  <GlowRow
                    key={conv.id}
                    onClick={() => handleOpenConversation(conv)}
                    className={cn(
                      "group relative flex items-center justify-between rounded-2xl p-3 sm:p-3.5 transition-all duration-150 cursor-pointer",
                      isActive
                        ? "border-indigo-400/40 bg-indigo-500/[0.08]"
                        : "border-white/[0.06]"
                    )}
                  >
                    {/* Left: Chat Icon & Info */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all shadow-inner",
                          isActive
                            ? "bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 scale-105"
                            : "bg-[#171b2e] border border-white/[0.08] text-[#a3b8fc] group-hover:scale-105"
                        )}
                      >
                        <MessageSquare className="h-4 w-4 stroke-[1.8]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "truncate text-[13.5px] font-semibold transition-colors",
                              isActive
                                ? "text-white"
                                : "text-[#f1f3f9] group-hover:text-white"
                            )}
                          >
                            {conv.title}
                          </span>
                          {isActive && (
                            <span className="rounded-full bg-indigo-500/20 border border-indigo-400/30 px-2 py-0.5 text-[10px] font-medium text-indigo-300 shrink-0">
                              Active
                            </span>
                          )}
                        </div>

                        {conv.lastMessageSnippet && (
                          <p className="text-[12px] text-[#7d879d] truncate mt-0.5 font-normal">
                            {conv.lastMessageSnippet}
                          </p>
                        )}

                        <div className="mt-1 flex items-center gap-2 text-[11.5px] text-[#6b7794]">
                          <span className="font-mono">
                            {conv.messageCount} msg{conv.messageCount === 1 ? "" : "s"}
                          </span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatRelativeTime(conv.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Action Indicator */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-full border transition-all",
                          isActive
                            ? "bg-indigo-600 text-white border-transparent"
                            : "bg-white/[0.04] text-[#7d879d] border-white/[0.06] group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent"
                        )}
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </GlowRow>
                );
              })
            )}
          </div>
        </div>
      </GlowContainer>
    </div>
  );
}
