"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Document, Conversation } from "@/types";
import { useConversationStore } from "@/stores/conversation-store";
import { formatRelativeTime } from "@/lib/format-time";
import { MessageSquare, Plus, ArrowRight, FileText, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

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

  if (!document) return null;

  // Filter conversations for this document, sorted by most recently updated
  const docConversations = conversations
    .filter((c) => c.documentIds.includes(document.id))
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  const handleOpenConversation = (conv: Conversation) => {
    switchConversation(conv.id);
    onClose();
    router.push(`/conversation?doc=${document.id}&conv=${conv.id}`);
  };

  const handleCreateNew = () => {
    const newConvId = createConversation(document.id);
    onClose();
    router.push(`/conversation?doc=${document.id}&conv=${newConvId}`);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={document.originalName}
      description="Select an existing conversation or start a new independent topic for this document."
    >
      <div className="space-y-4 pt-2">
        {/* Document Quick Metadata Banner */}
        <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 border border-zinc-200 dark:bg-[#141418] dark:border-white/5 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              {document.pageCount} pages
            </span>
            <span>•</span>
            <span>{(document.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
          </div>
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-600/15 dark:text-blue-300">
            {docConversations.length} conversation{docConversations.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Section Header with + New Conversation CTA */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Conversations
          </span>
          <Button
            size="sm"
            variant="accent"
            onClick={handleCreateNew}
            className="h-7 px-2.5 text-xs gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New conversation</span>
          </Button>
        </div>

        {/* Conversation List */}
        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {docConversations.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-200 p-6 text-center dark:border-zinc-800">
              <MessageSquare className="h-6 w-6 text-zinc-400 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                No conversations yet
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Start a fresh conversation to begin exploring this document.
              </p>
              <Button
                size="sm"
                variant="accent"
                onClick={handleCreateNew}
                className="mt-3 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Start conversation</span>
              </Button>
            </div>
          ) : (
            docConversations.map((conv) => {
              const isActive = activeConversationId === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => handleOpenConversation(conv)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer group",
                    isActive
                      ? "border-blue-500/40 bg-blue-50/50 dark:border-blue-500/30 dark:bg-blue-950/20"
                      : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/70 dark:border-white/10 dark:bg-[#16161c] dark:hover:border-white/20 dark:hover:bg-[#1a1a22]"
                  )}
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full shrink-0",
                          isActive
                            ? "bg-blue-600 dark:bg-blue-400 ring-2 ring-blue-500/20"
                            : "bg-zinc-300 dark:bg-zinc-700"
                        )}
                      />
                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {conv.title}
                      </h4>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        ({conv.messageCount} msg{conv.messageCount === 1 ? "" : "s"})
                      </span>
                    </div>

                    {conv.lastMessageSnippet && (
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-1 pl-4">
                        {conv.lastMessageSnippet}
                      </p>
                    )}

                    <div className="flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 pl-4">
                      <Clock className="h-2.5 w-2.5" />
                      <span>{formatRelativeTime(conv.updatedAt)}</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isActive ? "accent" : "ghost"}
                    className="h-7 text-xs shrink-0 gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenConversation(conv);
                    }}
                  >
                    <span>{isActive ? "Continue" : "Open"}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Dialog>
  );
}
