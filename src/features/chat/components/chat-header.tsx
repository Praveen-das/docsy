"use client";

import React, { useState } from "react";
import { MoreHorizontal, Pencil, FileText, Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConversationOptionsMenu } from "@/features/documents/components/conversation-options-menu";

export interface ChatHeaderProps {
  conversationId: string;
  conversationTitle: string;
  documentName?: string;
  pageCount?: number;
  lastUpdated?: string;
  isViewerOpen?: boolean;
  onToggleViewer?: () => void;
  onRenameTitle?: (newTitle: string) => void;
}

export function ChatHeader({
  conversationId,
  conversationTitle,
  documentName = "System Design Notes.pdf",
  pageCount = 24,
  lastUpdated = "2 hours ago",
  isViewerOpen = true,
  onToggleViewer,
  onRenameTitle,
}: ChatHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(conversationTitle);

  const handleSaveTitle = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = editedTitle.trim();
    if (trimmed && trimmed !== conversationTitle) {
      onRenameTitle?.(trimmed);
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="border-b border-white/[0.06] bg-[#08090d]/90 backdrop-blur-md will-change-transform px-6 py-3.5 select-none shrink-0 space-y-2.5">
      {/* Conversation Title & Subtitle matching Image 2 */}
      <div className="flex justify-between items-center pt-0.5">
        {isEditingTitle ? (
          <form onSubmit={handleSaveTitle} className="flex items-center gap-2">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              autoFocus
              className="text-base sm:text-lg font-bold text-white bg-[#141624] border border-indigo-500/40 rounded-lg px-2 py-0.5 focus:outline-none"
            />
            <button type="submit" className="p-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-500">
              <Check className="h-3.5 w-3.5" />
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2 group/title">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
              {conversationTitle || "Summarize the key findings"}
            </h2>
            <button
              type="button"
              onClick={() => {
                setIsEditingTitle(true);
                setEditedTitle(conversationTitle);
              }}
              className="opacity-0 group-hover/title:opacity-100 text-zinc-400 hover:text-white transition-opacity p-0.5 cursor-pointer"
              title="Edit title"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-white/8 transition-colors cursor-pointer"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          <ConversationOptionsMenu
            conversationId={conversationId}
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            showShare
            showRename
            showDelete
            onRename={() => {
              setIsEditingTitle(true);
              setEditedTitle(conversationTitle);
            }}
          />
        </div>
      </div>
    </div>
  );
}
