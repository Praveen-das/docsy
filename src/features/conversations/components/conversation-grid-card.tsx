"use client";

import React from "react";
import { MessageSquare, MoreVertical, ExternalLink, Pin, Share2, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowCard } from "@/components/ui/glow-card";
import { CompactMenu } from "@/components/ui/compact-menu";
import { PinMarker } from "./pin-marker";
import { ConversationItemData } from "./conversation-list-row";

export interface ConversationGridCardProps {
  item: ConversationItemData;
  isSelected: boolean;
  isMenuOpen: boolean;
  onSelect: () => void;
  onOpenMenu: () => void;
  onCloseMenu: () => void;
  onTogglePin: () => void;
  onShare: () => void;
  onRename: () => void;
  onRequestDelete: () => void;
}

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
              <h4 className="font-semibold text-white text-[13.5px] truncate">{item.title}</h4>
              {item.isPinned && <PinMarker />}
            </div>
          </div>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isMenuOpen) {
                  onCloseMenu();
                } else {
                  onOpenMenu();
                }
              }}
              className="flex items-center justify-center h-8 w-8 rounded-lg text-[#525f7a] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            <CompactMenu
              isOpen={isMenuOpen}
              onClose={onCloseMenu}
              width="w-44"
              align="right"
              sections={[
                {
                  items: [
                    {
                      label: "Open in chat",
                      icon: ExternalLink,
                      onClick: onSelect,
                    },
                    {
                      label: item.isPinned ? "Unpin conversation" : "Pin conversation",
                      icon: Pin,
                      onClick: onTogglePin,
                    },
                    {
                      label: "Share link",
                      icon: Share2,
                      onClick: onShare,
                    },
                    {
                      label: "Rename",
                      icon: Pencil,
                      onClick: onRename,
                    },
                  ],
                },
              ]}
              destructiveAction={{
                label: "Delete conversation",
                icon: Trash2,
                onClick: onRequestDelete,
              }}
            />
          </div>
        </div>

        <p className="text-[12px] text-[#818ea8] line-clamp-2 leading-relaxed">{item.preview}</p>
      </div>

      <div className="mt-3.5 sm:mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs text-[#6b7794]">
        <div className="flex items-center gap-1.5 truncate max-w-[180px]">
          <span className="truncate text-[11.5px] text-[#818ea8]">{item.docName}</span>
        </div>

        <span className="text-[11px] text-[#525f7a] shrink-0 whitespace-nowrap">{item.timeText}</span>
      </div>
    </GlowCard>
  );
}
