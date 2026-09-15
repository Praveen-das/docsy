"use client";

import React, { useState, useRef, useEffect } from "react";
import { Message } from "@/types";
import { cn } from "@/lib/utils";
import { Copy, Check, Pencil, RotateCcw, Share2, AlertCircle, Loader2 } from "lucide-react";
import { formatTime } from "@/lib/format-time";
import { MarkdownRenderer } from "@/components/markdown-renderer";

export interface ChatMessageItemProps {
  message: Message;
  isStreaming?: boolean;
  isRegenerating?: boolean;
  streamingContent?: string | null;
  onEdit?: (messageId: string, newContent: string) => Promise<void>;
  onRegenerate?: (messageId: string) => Promise<void>;
  onRetry?: (messageId: string) => Promise<void>;
  onShare?: (message: Message) => Promise<boolean> | boolean;
}

export const ChatMessageItem = React.memo(function ChatMessageItem({
  message,
  isRegenerating = false,
  streamingContent = null,
  onEdit,
  onRegenerate,
  onRetry,
  onShare,
}: ChatMessageItemProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(message.content);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const formattedTime = formatTime(message.createdAt);
  const displayContent = isRegenerating && streamingContent !== null ? streamingContent : message.content;
  const isErrorMessage =
    !isUser && (message.content.startsWith("⚠️ **Request Notice**:") || message.content.startsWith("⚠️"));

  // Keep draft in sync if message content updates externally
  useEffect(() => {
    if (!isEditing) {
      setDraftText(message.content);
    }
  }, [message.content, isEditing]);

  // Autofocus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
      textareaRef.current.selectionEnd = textareaRef.current.value.length;
    }
  }, [isEditing]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const handleShare = async () => {
    if (onShare) {
      const result = await onShare(message);
      if (result) {
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
      return;
    }

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: isUser ? "User Prompt - Docsy" : "Docsy Assistant Response",
          text: displayContent,
          url: typeof window !== "undefined" ? window.location.href : undefined,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } else {
        await navigator.clipboard.writeText(displayContent);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      // Ignored if cancelled
    }
  };

  const handleSaveEdit = async () => {
    const trimmed = draftText.trim();
    if (!trimmed || isSubmittingEdit) return;

    if (trimmed === message.content) {
      setIsEditing(false);
      return;
    }

    setIsSubmittingEdit(true);
    try {
      if (onEdit) {
        await onEdit(message.id, trimmed);
      }
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to submit edit:", err);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setIsEditing(false);
      setDraftText(message.content);
    } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit();
    }
  };

  // ─── USER MESSAGE ──────────────────────────────────────────
  if (isUser) {
    return (
      <div className="flex justify-end text-sm group">
        <div className="flex flex-col items-end max-w-[92%] sm:max-w-[84%]">
          {isEditing ? (
            /* Inline Edit Mode */
            <div className="w-full min-w-[280px] sm:min-w-[400px] max-w-[560px] rounded-2xl rounded-tr-xs bg-white dark:bg-[#1a1a22] p-3 border border-zinc-300 dark:border-white/15 shadow-sm space-y-2.5 transition-all">
              <textarea
                ref={textareaRef}
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSubmittingEdit}
                rows={Math.min(8, Math.max(2, draftText.split("\n").length))}
                className="w-full resize-none bg-transparent text-[13px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none leading-relaxed font-normal p-1"
                placeholder="Edit your message..."
              />
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-white/5 text-xs text-zinc-400">
                <span className="text-[11px] select-none text-zinc-400 dark:text-zinc-500">
                  <kbd className="font-sans px-1 py-0.5 rounded bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-300">
                    Esc
                  </kbd>{" "}
                  to cancel •{" "}
                  <kbd className="font-sans px-1 py-0.5 rounded bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-300">
                    ⌘Enter
                  </kbd>{" "}
                  to submit
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setDraftText(message.content);
                    }}
                    disabled={isSubmittingEdit}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={isSubmittingEdit || !draftText.trim()}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-[#202027] dark:hover:bg-[#2a2a35] transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
                  >
                    {isSubmittingEdit && <Loader2 className="h-3 w-3 animate-spin shrink-0" />}
                    Submit
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* User Message Bubble */
            <div className="relative group/bubble flex flex-col items-end">
              <div className="rounded-2xl rounded-tr-xs bg-zinc-900 text-white dark:bg-[#24242d] px-4 py-2.5 shadow-2xs leading-relaxed text-[13px] font-medium border border-zinc-800 dark:border-white/10">
                {message.content}
              </div>

              {/* Hover Action Toolbar */}
              <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150 text-[11px] text-zinc-400 dark:text-zinc-500 select-none">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="rounded p-1 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 dark:hover:bg-white/5 dark:text-zinc-500 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                    title="Edit message"
                    aria-label="Edit message"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded p-1 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 dark:hover:bg-white/5 dark:text-zinc-500 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  title="Copy message"
                  aria-label="Copy message"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="rounded p-1 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 dark:hover:bg-white/5 dark:text-zinc-500 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  title="Share message"
                  aria-label="Share message"
                >
                  {shared ? (
                    <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Share2 className="h-3 w-3" />
                  )}
                </button>
                <span className="text-[10px] ml-0.5">{formattedTime}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── ASSISTANT ERROR CARD ──────────────────────────────────
  if (isErrorMessage) {
    return (
      <div className="flex justify-start text-sm w-full">
        <div className="flex flex-col items-start w-full max-w-[92%] sm:max-w-[84%]">
          <div className="w-full rounded-xl border border-rose-200/80 bg-rose-50/70 p-4 shadow-2xs space-y-3 dark:border-rose-900/40 dark:bg-rose-950/25">
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/30 pb-2 text-xs">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Request Failed</span>
              </div>

              {onRetry && (
                <button
                  type="button"
                  onClick={() => onRetry(message.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 transition-colors cursor-pointer shadow-xs"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Retry Request</span>
                </button>
              )}
            </div>

            <div className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed font-mono">
              <MarkdownRenderer content={message.content} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── ASSISTANT EDITORIAL CARD ──────────────────────────────
  return (
    <div className="flex justify-start text-sm w-full group">
      <div className="flex flex-col items-start w-full max-w-[92%] sm:max-w-[84%]">
        <div className="w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs space-y-3 dark:border-white/10 dark:bg-[#121215] transition-colors">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-600 text-white text-[10px] font-bold shrink-0">
                D
              </div>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">Docsy Assistant</span>
              {isRegenerating && (
                <span className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Regenerating...
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500">
              <span>{formattedTime}</span>

              {/* Copy action */}
              <button
                type="button"
                onClick={handleCopy}
                className="rounded p-1 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 dark:hover:bg-white/5 dark:text-zinc-500 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                title="Copy response"
                aria-label="Copy response"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>

              {/* Regenerate action */}
              {onRegenerate && (
                <button
                  type="button"
                  onClick={() => onRegenerate(message.id)}
                  disabled={isRegenerating}
                  className="rounded p-1 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 dark:hover:bg-white/5 dark:text-zinc-500 dark:hover:text-zinc-200 transition-colors cursor-pointer disabled:opacity-40"
                  title="Regenerate response"
                  aria-label="Regenerate response"
                >
                  <RotateCcw className={cn("h-3 w-3", isRegenerating && "animate-spin text-blue-600")} />
                </button>
              )}

              {/* Share action */}
              <button
                type="button"
                onClick={handleShare}
                className="rounded p-1 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 dark:hover:bg-white/5 dark:text-zinc-500 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                title="Share response"
                aria-label="Share response"
              >
                {shared ? (
                  <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Share2 className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>

          {/* Content Body */}
          <MarkdownRenderer content={displayContent} />
        </div>
      </div>
    </div>
  );
});
