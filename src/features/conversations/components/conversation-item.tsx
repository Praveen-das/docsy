"use client";

import React, { useState } from "react";
import { Conversation } from "@/types";
import { cn } from "@/lib/utils";
import { MessageSquare, Edit2, Trash2, Check, X } from "lucide-react";
import { useConversationStore } from "@/stores/conversation-store";
import { formatRelativeTime } from "@/lib/format-time";

export interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  isCollapsed: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename?: (newTitle: string) => void;
}

export function ConversationItem({
  conversation,
  isActive,
  isCollapsed,
  onSelect,
  onDelete,
  onRename,
}: ConversationItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);
  const renameConversation = useConversationStore((state) => state.renameConversation);

  const handleStartRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditTitle(conversation.title);
  };

  const handleSaveRename = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== conversation.title) {
      if (onRename) {
        onRename(trimmed);
      } else {
        renameConversation(conversation.id, trimmed);
      }
    }
    setIsEditing(false);
  };

  const timeText = conversation.updatedAt
    ? formatRelativeTime(conversation.updatedAt)
    : "2 hours ago";

  if (isCollapsed) {
    return (
      <button
        onClick={onSelect}
        title={conversation.title}
        className={cn(
          "group relative flex h-10 w-full items-center justify-center rounded-xl transition-all duration-150 cursor-pointer",
          isActive
            ? "border border-indigo-500/40 bg-[#141624] text-white shadow-[0_0_12px_rgba(99,102,241,0.2)]"
            : "text-zinc-400 hover:text-white hover:bg-white/5"
        )}
      >
        <MessageSquare
          className={cn(
            "h-4 w-4 transition-colors",
            isActive ? "text-indigo-400" : "text-zinc-400 group-hover:text-zinc-200"
          )}
        />
      </button>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col justify-center rounded-xl px-3 py-2 text-xs transition-all duration-150 select-none cursor-pointer",
        isActive
          ? "border border-indigo-500/35 bg-[#121422] shadow-[0_0_15px_rgba(99,102,241,0.12)] text-white"
          : "border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
      )}
    >
      {isEditing ? (
        <form
          onSubmit={handleSaveRename}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 w-full"
        >
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            autoFocus
            className="w-full text-xs font-semibold text-white bg-[#1a1c29] border border-indigo-500/40 rounded-lg px-2 py-1 focus:outline-none"
          />
          <button
            type="submit"
            className="p-1 text-emerald-400 hover:text-emerald-300"
          >
            <Check className="h-3 w-3" />
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <MessageSquare
              className={cn(
                "h-3.5 w-3.5 shrink-0 transition-colors",
                isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300"
              )}
            />
            <span
              className={cn(
                "truncate text-[12.5px]",
                isActive ? "font-semibold text-white" : "font-normal text-zinc-300 group-hover:text-white"
              )}
            >
              {conversation.title}
            </span>
          </div>

          <span className="text-[10px] text-zinc-500 shrink-0 font-mono">
            {timeText}
          </span>
        </div>
      )}
    </div>
  );
}
