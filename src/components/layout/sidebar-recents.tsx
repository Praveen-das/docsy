"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { MessageSquare, Clock, ArrowRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format-time";
import { handleGlowMouseEnter, handleGlowMouseMove, handleGlowMouseLeave } from "@/lib/interactive-glow";
import { useConversationStore } from "@/stores/conversation-store";
import { DeleteConversationDialog } from "@/features/conversations/components/delete-conversation-dialog";
import { Conversation } from "@/types";

export interface SidebarRecentsProps {
  isCollapsed: boolean;
  onClose?: () => void;
}

interface RecentsRowProps {
  conversation: Conversation;
  isActive?: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export const RecentsRow = React.memo(function RecentsRow({
  conversation,
  isActive = false,
  onSelect,
  onDelete,
}: RecentsRowProps) {
  const [isHovered, setIsHovered] = useState(false);

  const timeText = conversation.updatedAt ? formatRelativeTime(conversation.updatedAt) : "";

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative flex items-center justify-between gap-2 rounded-xl px-2.5 h-8 text-xs select-none cursor-pointer shrink-0 active:scale-[0.98] transition-colors duration-150",
        isActive || isHovered
          ? "bg-(--card-spotlight-mid) text-white"
          : "border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-(--card-spotlight-mid)",
      )}
    >
      {/* Conversation Title & Left Icon */}
      <div className="flex items-center gap-2 min-w-0 flex-1 relative z-10">
        <span
          className={cn(
            "truncate text-[12.5px] leading-none",
            isActive || isHovered ? "text-white" : "font-normal text-zinc-300 group-hover:text-white",
          )}
          title={conversation.title}
        >
          {conversation.title}
        </span>
      </div>

      {/* Right Side Action Slot: Fixed layout to eliminate any layout shift between time and delete button */}
      <div className="relative shrink-0 flex items-center justify-end min-w-[50px] h-5 z-10">
        {/* Time Text: Fades out on hover without shifting width or flexbox layout */}
        {timeText && (
          <span className="text-[10px] text-zinc-500 font-mono transition-opacity duration-150 group-hover:opacity-0 group-hover:pointer-events-none truncate text-right">
            {timeText}
          </span>
        )}

        {/* Delete button: Positioned absolutely within the fixed slot to crossfade seamlessly */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute right-0 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto flex items-center justify-center h-5 w-5 rounded text-zinc-400 hover:text-rose-400 hover:bg-rose-500/15 transition-all duration-150 cursor-pointer"
          title="Delete conversation"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
});

export function SidebarRecents({ isCollapsed, onClose }: SidebarRecentsProps) {
  const router = useRouter();
  const conversations = useConversationStore((state) => state.conversations);
  const activeConversationId = useConversationStore((state) => state.activeConversationId);
  const fetchConversations = useConversationStore((state) => state.fetchConversations);
  const switchConversation = useConversationStore((state) => state.switchConversation);
  const deleteConversation = useConversationStore((state) => state.deleteConversation);

  const [convToDelete, setConvToDelete] = useState<Conversation | null>(null);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Sort by updatedAt descending
  const sortedConversations = useMemo(() => {
    return [...conversations].sort(
      (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime(),
    );
  }, [conversations]);

  const handleSelectConversation = useCallback(
    (conv: Conversation) => {
      switchConversation(conv.id);
      const docId = conv.documentIds[0];
      if (docId) {
        router.push(`/conversation?doc=${docId}&conv=${conv.id}`);
      } else {
        router.push(`/conversation?conv=${conv.id}`);
      }
      onClose?.();
    },
    [router, switchConversation, onClose],
  );

  if (isCollapsed) {
    return (
      <div className="flex-1 min-h-0 flex flex-col py-2 border-t border-white/[0.06] overflow-hidden">
        <div className="flex justify-center mb-1 shrink-0">
          <Link
            href="/conversations"
            onClick={onClose}
            title="Recent Conversations"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Clock className="h-4 w-4" />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col items-center gap-1 scrollbar-none py-1">
          {sortedConversations.map((conv) => {
            const isActive = activeConversationId === conv.id;
            return (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                title={conv.title}
                className={cn(
                  "group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-[border-color,background-color,color] duration-150 cursor-pointer",
                  isActive ? "active-row-glow text-white" : "text-zinc-400 hover:text-white hover:bg-white/5",
                )}
              >
                <MessageSquare
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive
                      ? "text-[#a3b8fc] drop-shadow-[0_0_6px_rgba(163,184,252,0.6)]"
                      : "text-zinc-400 group-hover:text-zinc-200",
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col mx-2 pt-4 pb-4 border-t border-white/[0.06] select-none overflow-hidden">
      {/* Header with Title and "View all" link matching Docsy typography */}
      <div className="flex items-center justify-between px-2.5 pb-3 text-[10px] font-bold tracking-widest text-zinc-500 uppercase shrink-0">
        <span className="flex items-center gap-1.5 text-zinc-400">RECENT CONVERSATIONS</span>
      </div>

      {/* Recents Scrollable List */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-0.5 space-y-1 [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.08)_transparent] hover:[scrollbar-color:rgba(255,255,255,0.18)_transparent]">
        {sortedConversations.length === 0 ? (
          <div className="px-3 py-4 rounded-2xl bg-[#0c1017]/50 border border-white/[0.05] text-center my-1">
            <MessageSquare className="h-4 w-4 text-zinc-600 mx-auto mb-1.5" />
            <p className="text-[12px] font-medium text-zinc-400">No conversations yet</p>
            <Link
              href="/conversation"
              onClick={onClose}
              className="inline-block mt-2 text-[11.5px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              + Start a conversation
            </Link>
          </div>
        ) : (
          sortedConversations.map((conv) => (
            <RecentsRow
              key={conv.id}
              conversation={conv}
              onSelect={() => handleSelectConversation(conv)}
              onDelete={() => setConvToDelete(conv)}
            />
          ))
        )}
      </div>

      <DeleteConversationDialog
        conversation={convToDelete}
        onClose={() => setConvToDelete(null)}
        onConfirm={deleteConversation}
      />
    </div>
  );
}
