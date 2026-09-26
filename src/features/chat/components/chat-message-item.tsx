"use client";

import React, { useState, useEffect } from "react";
import { MessageEditBox } from "./message-edit-box";
import { Message } from "@/types";
import { cn } from "@/lib/utils";
import { Copy, Check, Pencil, RotateCcw, Share2, AlertCircle, Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
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
  isStreaming = false,
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

  const formattedTime = formatTime(message.createdAt) || "10:24 AM";
  const displayContent = isRegenerating && streamingContent !== null ? streamingContent : message.content;
  const isStreamingActive = isStreaming || isRegenerating || message.id === "streaming-ai-message";
  const isErrorMessage =
    !isUser && (message.content.startsWith("⚠️ **Request Notice**:") || message.content.startsWith("⚠️"));

  const displayName = user?.fullName || user?.firstName || "Praveen Das";

  // Keep draft in sync
  useEffect(() => {
    if (!isEditing) {
      setDraftText(message.content);
    }
  }, [message.content, isEditing]);

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
        <div className={isEditing ? "w-full" : "flex items-start gap-3 max-w-[85%] sm:max-w-[75%]"}>
          {isEditing ? (
            <MessageEditBox
              value={draftText}
              onChange={setDraftText}
              onSave={handleSaveEdit}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="flex flex-col items-end">
              {/* User Bubble matching Image 2 */}
              <div className="bg-indigo-600 rounded-2xl rounded-tr-xs! text-white px-4 py-3 text-[13.5px] leading-relaxed shadow-sm">
                {message.content}
              </div>

              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-zinc-500 select-none">
                <span>{formattedTime}</span>
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-zinc-400"
                    title="Edit prompt"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
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
        {/* Message Content Body */}
        <div className="flex-1 min-w-0 space-y-2.5">
          {/* Header Row: "Docsy AI" + Timestamp */}
          <div className="flex items-center gap-2 select-none">
            {isRegenerating && (
              <span className="flex items-center gap-1 text-[11px] text-indigo-400 font-medium">
                <Loader2 className="h-3 w-3 animate-spin" />
                Thinking...
              </span>
            )}
          </div>

          {/* Clean Markdown Rendering directly on canvas */}
          <div className="text-[13.5px] leading-relaxed text-zinc-200">
            <MarkdownRenderer content={displayContent} onCitationClick={onCitationClick} />
          </div>

          {/* Message Action Toolbar: Copy, Regenerate - display only after stream completion */}
          {!isStreamingActive && (
            <div className="flex items-center gap-2 pt-1 text-xs text-zinc-400 select-none -ml-2">
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
                  <RotateCcw className={cn("h-3.5 w-3.5", isRegenerating && "animate-spin text-indigo-400")} />
                  <span className="text-xs">Regenerate</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
