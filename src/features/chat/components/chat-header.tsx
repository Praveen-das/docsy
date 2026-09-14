"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Share2, Pin, Archive, Trash2, Sparkles, Loader2 } from "lucide-react";

export interface ChatHeaderProps {
  conversationTitle: string;
  onShareChat?: () => void;
  onPinChat?: () => void;
  onArchiveChat?: () => void;
  onDeleteChat?: () => void;
  onGenerateTitle?: () => void;
  isGeneratingTitle?: boolean;
  canGenerateTitle?: boolean;
}

const MENU_ITEM_BASE =
  "w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center gap-2 transition-colors cursor-pointer";
const MENU_ITEM_DEFAULT = `${MENU_ITEM_BASE} text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/5`;
const MENU_ITEM_DANGER = `${MENU_ITEM_BASE} text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 font-medium`;

export function ChatHeader({
  conversationTitle,
  onShareChat,
  onPinChat,
  onArchiveChat,
  onDeleteChat,
  onGenerateTitle,
  isGeneratingTitle = false,
  canGenerateTitle = true,
}: ChatHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const handleShare = () => {
    if (onShareChat) {
      onShareChat();
    } else if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
    }
    setShareCopied(true);
    setTimeout(() => {
      setShareCopied(false);
      setIsMenuOpen(false);
    }, 1200);
  };

  const handleTogglePin = () => {
    setIsPinned((prev) => !prev);
    onPinChat?.();
    setIsMenuOpen(false);
  };

  const handleArchive = () => {
    setIsArchived((prev) => !prev);
    onArchiveChat?.();
    setIsMenuOpen(false);
  };

  const handleDelete = () => {
    setIsMenuOpen(false);
    onDeleteChat?.();
  };

  return (
    <div className="flex items-center justify-between border-b border-zinc-200 bg-white/95 px-4 py-3 text-xs gap-3 dark:border-white/5 dark:bg-[#0e0e12]/95 shrink-0 min-h-[49px]">
      {/* Left: Conversation Title & Pinned Badge */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate" title={conversationTitle}>
          {conversationTitle}
        </h2>
        {isPinned && (
          <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 border border-blue-200 dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-500/20 shrink-0">
            <Pin className="h-2.5 w-2.5 rotate-45" />
            Pinned
          </span>
        )}
      </div>

      {/* Right: Actions & Menu Button */}
      <div className="flex items-center gap-2 shrink-0">
        {onGenerateTitle && (
          <Button
            variant="outline"
            size="sm"
            onClick={onGenerateTitle}
            disabled={!canGenerateTitle || isGeneratingTitle}
            className="h-7 px-2.5 text-xs gap-1.5 border-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 font-medium text-zinc-700 dark:text-zinc-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              !canGenerateTitle
                ? "Start or select a conversation first to assign a label"
                : "Manually trigger AI label/title assignment (test)"
            }
          >
            {isGeneratingTitle ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600 dark:text-blue-400" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
            )}
            <span>{isGeneratingTitle ? "Assigning..." : "Assign Label"}</span>
          </Button>
        )}

        <div className="relative shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="h-7 w-7 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-white/5"
            title="Chat options"
            aria-label="Chat options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>

          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 z-40 w-48 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-[#141418] animate-in fade-in zoom-in-95 duration-100">
                <button onClick={handleShare} className={`${MENU_ITEM_DEFAULT} justify-between`}>
                  <div className="flex items-center gap-2">
                    <Share2 className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
                    <span>Share chat</span>
                  </div>
                  {shareCopied && (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Copied!</span>
                  )}
                </button>

                <button onClick={handleTogglePin} className={MENU_ITEM_DEFAULT}>
                  <Pin className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
                  <span>{isPinned ? "Unpin chat" : "Pin chat"}</span>
                </button>

                <button onClick={handleArchive} className={MENU_ITEM_DEFAULT}>
                  <Archive className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
                  <span>{isArchived ? "Unarchive chat" : "Archive chat"}</span>
                </button>

                {onGenerateTitle && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onGenerateTitle();
                    }}
                    disabled={isGeneratingTitle}
                    className={MENU_ITEM_DEFAULT}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>{isGeneratingTitle ? "Assigning label..." : "Assign label (AI)"}</span>
                  </button>
                )}

                <div className="border-t border-zinc-100 dark:border-white/5 my-1" />

                <button onClick={handleDelete} className={MENU_ITEM_DANGER}>
                  <Trash2 className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  <span>Delete chat</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
