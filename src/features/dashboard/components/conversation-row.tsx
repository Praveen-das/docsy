"use client";

import React, { useState } from "react";
import { MessageSquare, FileText, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowRow } from "@/components/ui/glow-row";
import { ConversationOptionsMenu } from "@/features/documents/components/conversation-options-menu";
import { useConversationStore } from "@/stores/conversation-store";

export interface ConversationRowProps {
  id: string;
  title: string;
  docName: string;
  preview: string;
  timeText: string;
  isPinned?: boolean;
  onClick: () => void;
}

export function ConversationRow({ id, title, docName, preview, timeText, isPinned: isPinnedProp, onClick }: ConversationRowProps) {
  const pinnedIds = useConversationStore((s) => s.pinnedIds);
  const isPinned = isPinnedProp ?? pinnedIds.has(id);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <GlowRow onClick={onClick} className="px-3.5 sm:px-4 py-2.5 sm:py-3.5 rounded-2xl cursor-pointer active:scale-[0.99] transition-all">
      {/* Left: Chat Icon & Title */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 relative z-10">
        <div
          className={cn(
            "flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl",
            "bg-indigo-500/10 border border-indigo-500/20 text-[#b8c3ee]",
          )}
        >
          <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-400" />
        </div>

        {/* Title: Fluid flex-1 min-w-0 truncate prevents row wrapping while maximizing title visibility */}
        <span className="text-[12.5px] sm:text-sm font-semibold text-white truncate min-w-0 flex-1 transition-colors">
          {title}
        </span>

        {/* Linked Document Pill Badge - shown on md (tablets) and up */}
        <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/15 text-[11px] text-[#a5b4fc] shrink-0">
          <FileText className="h-3 w-3 text-[#818cf8]" />
          <span className="truncate max-w-[140px]">{docName}</span>
        </div>

        {/* Snippet preview - shown on xl and up */}
        <span className="hidden xl:inline text-xs text-(--sidebar-nav-muted) truncate flex-1 min-w-0 font-normal">
          {preview}
        </span>
      </div>

      {/* Right: Relative Timestamp & Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 relative z-10 pl-2">
        <span className="text-[11px] sm:text-xs text-zinc-400 whitespace-nowrap">{timeText}</span>
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(true);
            }}
            className="flex items-center justify-center h-8 w-8 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Conversation options"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          <ConversationOptionsMenu
            conversationId={id}
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            showShare
            showRename
            showPin
            showDelete
            showOpenInNewWindow
            isPinned={isPinned}
          />
        </div>
      </div>
    </GlowRow>
  );
}
