"use client";

import React from "react";
import { MoreVertical, ExternalLink, Pin, Share2, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompactMenu } from "@/components/ui/compact-menu";

export interface ConversationActionMenuProps {
  isPinned: boolean;
  isMenuOpen: boolean;
  onOpenMenu: () => void;
  onCloseMenu: () => void;
  onSelect: () => void;
  onTogglePin: () => void;
  onShare: () => void;
  onRename: () => void;
  onRequestDelete: () => void;
  className?: string;
}

export function ConversationActionMenu({
  isPinned,
  isMenuOpen,
  onOpenMenu,
  onCloseMenu,
  onSelect,
  onTogglePin,
  onShare,
  onRename,
  onRequestDelete,
  className,
}: ConversationActionMenuProps) {
  return (
    <div className={cn("relative shrink-0", className)}>
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
                label: isPinned ? "Unpin conversation" : "Pin conversation",
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
  );
}
