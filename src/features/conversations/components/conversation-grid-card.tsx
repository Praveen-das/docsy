"use client";

import React from "react";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowCard } from "@/components/ui/glow-card";
import { PinMarker } from "./pin-marker";
import { ConversationActionMenu } from "./conversation-action-menu";
import { ConversationItemData, ConversationItemProps } from "./conversation-list-row";

export type ConversationGridCardProps = ConversationItemProps;

export function ConversationGridCard({
  item,
  isSelected,
  isMenuOpen,
  onSelect,
  onOpenMenu,
  onCloseMenu,
  onTogglePin,
  onShare,
  onRename,
  onRequestDelete,
}: ConversationGridCardProps) {
  return (
    <GlowCard
      onClick={onSelect}
      className={cn(
        "p-4 sm:p-5 rounded-[22px] sm:rounded-2xl flex-col justify-between items-stretch transition-all duration-200 cursor-pointer active:scale-[0.98]",
        isSelected ? "border-indigo-400/40" : "",
      )}
    >
      <div className="space-y-2.5 sm:space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <MessageSquare className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <h4 className="font-semibold text-zinc-900 dark:text-white text-[13.5px] truncate">{item.title}</h4>
              {item.isPinned && <PinMarker />}
            </div>
          </div>

          <ConversationActionMenu
            isPinned={item.isPinned}
            isMenuOpen={isMenuOpen}
            onOpenMenu={onOpenMenu}
            onCloseMenu={onCloseMenu}
            onSelect={onSelect}
            onTogglePin={onTogglePin}
            onShare={onShare}
            onRename={onRename}
            onRequestDelete={onRequestDelete}
          />
        </div>

        <p className="text-[12px] text-zinc-600 dark:text-[#818ea8] line-clamp-2 leading-relaxed">{item.preview}</p>
      </div>

      <div className="mt-3.5 sm:mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.05] flex items-center justify-between text-xs text-zinc-500 dark:text-[#6b7794]">
        <div className="flex items-center gap-1.5 truncate max-w-[180px]">
          <span className="truncate text-[11.5px] text-zinc-600 dark:text-[#818ea8]">{item.docName}</span>
        </div>

        <span className="text-[11px] text-zinc-500 dark:text-[#525f7a] shrink-0 whitespace-nowrap">{item.timeText}</span>
      </div>
    </GlowCard>
  );
}
