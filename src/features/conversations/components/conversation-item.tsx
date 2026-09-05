"use client";

import React, { useState } from "react";
import { Conversation } from "@/types";
import { formatRelativeTime } from "@/lib/format-time";
import { cn } from "@/lib/utils";
import { MessageSquare, Edit2, Trash2, Check, X } from "lucide-react";
import { useConversationStore } from "@/stores/conversation-store";

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
  const renameConversation = useConversationStore(
    (state) => state.renameConversation
  );

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

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditTitle(conversation.title);
  };

  if (isCollapsed) {
    return (
      <button
        onClick={onSelect}
        title={`${conversation.title} (${formatRelativeTime(conversation.updatedAt)})`}
        className={cn(
          "group relative flex h-9 items-center rounded-md text-[13px] font-medium transition-colors select-none tracking-[-0.01em] p-0 w-full overflow-hidden cursor-pointer",
          isActive
            ? "text-zinc-900 font-semibold bg-transparent dark:text-white"
            : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100/60 active:bg-zinc-200/50 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-white/[0.04] dark:active:bg-white/[0.07]"
        )}
      >
        <div className="w-10 h-9 flex items-center justify-center shrink-0">
          {isActive ? (
            <span className="h-2 w-2 rounded-full bg-zinc-900 dark:bg-white" />
          ) : (
            <MessageSquare className="h-[17px] w-[17px] text-zinc-400 group-hover:text-zinc-700 dark:text-zinc-500 dark:group-hover:text-zinc-300 transition-colors" />
          )}
        </div>
      </button>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col justify-center rounded-lg px-3 py-2 transition-colors select-none tracking-[-0.01em] w-full overflow-hidden cursor-pointer",
        isActive
          ? "bg-zinc-200/60 dark:bg-white/[0.08] text-zinc-900 dark:text-white"
          : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/60 active:bg-zinc-200/50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-white/[0.04] dark:active:bg-white/[0.07]"
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
            className="w-full text-xs font-semibold text-zinc-900 bg-white border border-zinc-300 rounded px-1.5 py-0.5 focus:outline-none dark:bg-[#1c1c24] dark:text-white dark:border-zinc-700"
          />
          <button
            type="submit"
            className="p-1 hover:text-emerald-600 text-zinc-500 cursor-pointer"
            title="Save"
          >
            <Check className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={handleCancelRename}
            className="p-1 hover:text-rose-600 text-zinc-500 cursor-pointer"
            title="Cancel"
          >
            <X className="h-3 w-3" />
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-between min-w-0">
          <span
            className={cn(
              "text-[13px] truncate leading-tight",
              isActive
                ? "font-semibold text-zinc-900 dark:text-white"
                : "font-medium text-zinc-700 group-hover:text-zinc-900 dark:text-zinc-300 dark:group-hover:text-white"
            )}
          >
            {conversation.title}
          </span>

          {/* Quick action icons on hover */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
            <button
              onClick={handleStartRename}
              className="p-0.5 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              title="Rename"
            >
              <Edit2 className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-0.5 rounded text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
              title="Delete"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Relative timestamp */}
      <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
        {formatRelativeTime(conversation.updatedAt)}
      </div>
    </div>
  );
}
