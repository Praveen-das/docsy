"use client";

import React, { useState, useRef, useEffect } from "react";
import { Message } from "@/types";
import { cn } from "@/lib/utils";
import {
  Copy,
  Check,
  Pencil,
  RotateCcw,
  Share2,
  AlertCircle,
  Loader2,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { formatTime } from "@/lib/format-time";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { DocsyIcon } from "@/components/ui/logo";
import { useUser } from "@clerk/nextjs";

export interface ChatMessageItemProps {
  message: Message;
  isStreaming?: boolean;
  isRegenerating?: boolean;
  streamingContent?: string | null;
  onEdit?: (messageId: string, newContent: string) => Promise<void>;
  onRegenerate?: (messageId: string) => Promise<void>;
  onRetry?: (messageId: string) => Promise<void>;
  onShare?: (message: Message) => Promise<boolean> | boolean;
  onCitationClick?: (pageNumber: number) => void;
}

export const ChatMessageItem = React.memo(function ChatMessageItem({
  message,
  isRegenerating = false,
  streamingContent = null,
  onEdit,
  onRegenerate,
  onRetry,
  onShare,
  onCitationClick,
}: ChatMessageItemProps) {
  const { user } = useUser();
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(message.content);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const formattedTime = formatTime(message.createdAt) || "10:24 AM";
  const displayContent =
    isRegenerating && streamingContent !== null ? streamingContent : message.content;
  const isErrorMessage =
    !isUser &&
    (message.content.startsWith("⚠️ **Request Notice**:") ||
      message.content.startsWith("⚠️"));

  const displayName = user?.fullName || user?.firstName || "Praveen Das";
  const userInitials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : displayName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "PD";

  // Keep draft in sync
  useEffect(() => {
    if (!isEditing) {
      setDraftText(message.content);
    }
  }, [message.content, isEditing]);

  // Autofocus when editing
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleSaveEdit = async () => {
    const trimmed = draftText.trim();
    if (!trimmed || isSubmittingEdit) return;

    if (trimmed === message.content) {
      setIsEditing(false);
      return;
    }

    if (onEdit) {
      setIsSubmittingEdit(true);
      try {
        await onEdit(message.id, trimmed);
        setIsEditing(false);
      } finally {
        setIsSubmittingEdit(false);
      }
    }
  };

  // ─── USER MESSAGE ──────────────────────────────────────────
  if (isUser) {
    return (
      <div className="flex justify-end text-sm w-full py-2">
        <div className="flex items-start gap-3 max-w-[85%] sm:max-w-[75%]">
          {isEditing ? (
            <div className="w-full rounded-2xl border border-indigo-500/40 bg-[#121422] p-3 shadow-sm space-y-2">
              <textarea
                ref={textareaRef}
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                className="w-full text-xs text-white bg-transparent resize-none focus:outline-none"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-2.5 py-1 text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-end">
              {/* User Bubble matching Image 2 */}
              <div className="rounded-2xl rounded-tr-xs bg-[#191b26] border border-white/[0.08] text-white px-4 py-3 text-[13.5px] leading-relaxed shadow-sm">
                {message.content}
              </div>

              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-zinc-500 select-none">
                <span>{formattedTime}</span>
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="hover:text-zinc-300 transition-colors p-0.5"
                    title="Edit prompt"
                  >
                    <Pencil className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* User Avatar Circle matching Image 2 */}
          <div className="shrink-0 mt-0.5">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={displayName}
                className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-900/60 to-indigo-950/80 text-[11px] font-bold text-purple-200 border border-purple-500/30">
                {userInitials}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── ERROR MESSAGE ─────────────────────────────────────────
  if (isErrorMessage) {
    return (
      <div className="flex justify-start text-sm w-full py-2">
        <div className="w-full max-w-[90%] rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-rose-400 font-semibold">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Request Failed</span>
            </div>
            {onRetry && (
              <button
                type="button"
                onClick={() => onRetry(message.id)}
                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-500 cursor-pointer"
              >
                Retry
              </button>
            )}
          </div>
          <div className="text-xs text-rose-200 leading-relaxed">
            <MarkdownRenderer content={message.content} />
          </div>
        </div>
      </div>
    );
  }

  // ─── ASSISTANT MESSAGE matching Image 2 ────────────────────
  return (
    <div className="flex justify-start text-sm w-full py-3 group">
      <div className="flex items-start gap-3.5 w-full max-w-[95%] sm:max-w-[90%]">
        {/* Glowing Docsy D Logo Avatar */}
        <div className="shrink-0 mt-1">
          <DocsyIcon className="h-7 w-7" />
        </div>

        {/* Message Content Body */}
        <div className="flex-1 min-w-0 space-y-2.5">
          {/* Header Row: "Docsy AI" + Timestamp */}
          <div className="flex items-center gap-2 select-none">
            <span className="font-bold text-white text-xs font-sans tracking-tight">
              Docsy AI
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">
              {formattedTime}
            </span>
            {isRegenerating && (
              <span className="flex items-center gap-1 text-[11px] text-indigo-400 font-medium">
                <Loader2 className="h-3 w-3 animate-spin" />
                Thinking...
              </span>
            )}
          </div>

          {/* Clean Markdown Rendering directly on canvas */}
          <div className="text-[13.5px] leading-relaxed text-zinc-200">
            <MarkdownRenderer
              content={displayContent}
              onCitationClick={onCitationClick}
            />
          </div>

          {/* Message Action Toolbar matching Image 2: Copy, Regenerate, Thumbs */}
          <div className="flex items-center gap-2 pt-1 text-xs text-zinc-400 select-none">
            {/* Copy button */}
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-zinc-400"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-xs">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span className="text-xs">Copy</span>
                </>
              )}
            </button>

            {/* Regenerate button */}
            {onRegenerate && (
              <button
                type="button"
                onClick={() => onRegenerate(message.id)}
                disabled={isRegenerating}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-zinc-400 disabled:opacity-40"
              >
                <RotateCcw
                  className={cn("h-3.5 w-3.5", isRegenerating && "animate-spin text-indigo-400")}
                />
                <span className="text-xs">Regenerate</span>
              </button>
            )}

            {/* Thumbs Up / Down */}
            <div className="flex items-center gap-1 pl-2 border-l border-white/[0.08]">
              <button
                type="button"
                onClick={() => setFeedback(feedback === "up" ? null : "up")}
                className={cn(
                  "p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer",
                  feedback === "up" ? "text-indigo-400" : "text-zinc-500 hover:text-zinc-300"
                )}
                title="Helpful"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setFeedback(feedback === "down" ? null : "down")}
                className={cn(
                  "p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer",
                  feedback === "down" ? "text-rose-400" : "text-zinc-500 hover:text-zinc-300"
                )}
                title="Not helpful"
              >
                <ThumbsDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
