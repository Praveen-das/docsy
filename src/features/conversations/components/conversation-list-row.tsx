"use client";

import React from "react";
import { MessageSquare, MoreVertical, ExternalLink, Pin, Share2, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompactMenu } from "@/components/ui/compact-menu";
import { PinMarker } from "./pin-marker";
import { GlowRow } from "@/components/ui/glow-row";

export interface ConversationItemData {
  id: string;
  title: string;
  preview: string;
  docName: string;
  docId: string;
  timeText: string;
  timestamp: number;
  isPinned: boolean;
  index: number;
}

export interface ConversationListRowProps {
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

export function ConversationListRow({
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
}: ConversationListRowProps) {
  return (
    <GlowRow onClick={onSelect} className="px-3.5 sm:px-4 py-2.5 sm:py-3.5 rounded-2xl cursor-pointer active:scale-[0.99] transition-all">
      {/* Left Section: Chat Icon + Fluid Title + Snippet */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 pr-2 sm:pr-4 z-10">
        {/* Chat Bubble Icon Box */}
        <div
          className={cn(
            "flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
            isSelected
              ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/25"
              : "bg-white/[0.03] text-[#727f9d] border border-white/[0.05] group-hover:text-white",
          )}
        >
          <MessageSquare className="h-4 w-4 stroke-[1.8]" />
        </div>

        {/* Text Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[13px] sm:text-[13.5px] font-semibold text-[#f1f3f9] truncate group-hover:text-white transition-colors">
              {item.title}
            </span>

            {item.isPinned && <PinMarker />}
          </div>

          <p className="text-[11.5px] sm:text-[12px] text-[#727f9d] truncate mt-0.5 font-normal leading-normal">
            {item.preview}
          </p>
        </div>
      </div>

      {/* Right Section: Linked PDF Badge Pill (md+) + Relative Time + 3 Dots Options */}
      <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 shrink-0 z-10">
        {/* Document Badge Pill - hidden on phones */}
        <div className="hidden md:flex justify-center items-center gap-2 px-2.5 py-1 rounded-xl border border-white/[0.06] bg-white/[0.02] max-w-[160px] lg:max-w-[220px]">
          <span className="text-[11.5px] text-[#818ea8] truncate font-normal">{item.docName}</span>
        </div>

        {/* Relative Timestamp */}
        <span className="text-[11px] sm:text-[12px] text-[#525f7a] whitespace-nowrap text-right font-normal">
          {item.timeText}
        </span>

        {/* 3-Dots Options Menu with Touch-Friendly Size */}
        <div className="relative">
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
    </GlowRow>
  );
}
