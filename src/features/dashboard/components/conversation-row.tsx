"use client";

import React, { useState } from "react";
import { MessageSquare, FileText, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowRow } from "@/components/ui/glow-row";
import { ConversationOptionsMenu } from "@/features/documents/components/conversation-options-menu";

export interface ConversationRowProps {
  id: string;
  title: string;
  docName: string;
  preview: string;
  timeText: string;
  isPinned?: boolean;
  onClick: () => void;
}

export function ConversationRow({ id, title, docName, preview, timeText, isPinned, onClick }: ConversationRowProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <GlowRow onClick={onClick}>
      {/* Left: Chat Icon & Title */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1 relative z-10">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            "bg-indigo-300/4  text-[#b8c3ee]",
          )}
        >
          <MessageSquare className="h-4 w-4" />
        </div>

        {/* Title */}
        <span className="text-xs sm:text-sm font-semibold text-white truncate max-w-[220px] shrink-0 transition-colors">
          {title}
        </span>

        {/* Linked Document Pill Badge */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-300/4 text-[11px] text-[#8fa2d4] shrink-0">
          <FileText className="h-3 w-3 text-[#728bd6]" />
          <span className="truncate max-w-[150px]">{docName}</span>
        </div>

        {/* Snippet preview */}
        <span className="hidden lg:inline text-xs text-(--sidebar-nav-muted) truncate flex-1 min-w-0 font-normal">
          {preview}
        </span>
      </div>

      {/* Right: Relative Timestamp & Menu */}
      <div className="flex items-center gap-3 shrink-0 relative z-10">
        <span className="text-xs text-zinc-500">{timeText}</span>
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(true);
            }}
            className="rounded-lg p-1 text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors cursor-pointer"
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
