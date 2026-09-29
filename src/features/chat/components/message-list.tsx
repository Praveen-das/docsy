"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { VList, VListHandle } from "virtua";
import { Loader2 } from "lucide-react";
import { Message, PaginatedMessagesResponse } from "@/types";
import { EmptyChatState } from "./empty-chat-state";
import { ChatMessageItem } from "./chat-message-item";

// ─── Constants ───────────────────────────────────────────────

/** Pixel threshold to consider the user "at the bottom" of the scroll container */
const SCROLL_BOTTOM_THRESHOLD = 80;

/** Pixel threshold from top to trigger loading older messages */
const SCROLL_TOP_THRESHOLD = 150;

// ─── Helpers ─────────────────────────────────────────────────

/** Filters out empty placeholder assistant messages (no visible content) */
const isDisplayable = (message: Message) => message.role !== "assistant" || message.content.trim().length > 0;

// ─── Sub-components ──────────────────────────────────────────

function MessageRow({
  message,
  isStreaming = false,
  isRegenerating = false,
  streamingContent = null,
  onEditMessage,
  onRegenerateMessage,
  onRetryMessage,
  onShareMessage,
}: {
  message: Message;
  isStreaming?: boolean;
  isRegenerating?: boolean;
  streamingContent?: string | null;
  onEditMessage?: (messageId: string, newContent: string) => Promise<void>;
  onRegenerateMessage?: (messageId: string) => Promise<void>;
  onRetryMessage?: (messageId: string) => Promise<void>;
  onShareMessage?: (message: Message) => Promise<boolean> | boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl pb-6">
      <ChatMessageItem
        message={message}
        isStreaming={isStreaming}
        isRegenerating={isRegenerating}
        streamingContent={isRegenerating ? streamingContent : null}
        onEdit={onEditMessage}
        onRegenerate={onRegenerateMessage}
        onRetry={onRetryMessage}
        onShare={onShareMessage}
      />
    </div>
  );
}

const TypingIndicator = React.memo(function TypingIndicator() {
  return (
    <div className="mx-auto w-full max-w-2xl flex items-center gap-2.5 text-sm justify-start pb-6">
      <div className="flex items-center gap-1.5 px-3.5 py-2.5">
        <BounceDot delay="-0.32s" />
        <BounceDot delay="-0.16s" />
        <BounceDot />
      </div>
    </div>
  );
});

function BounceDot({ delay }: { delay?: string }) {
  return (
    <span
      className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-400 animate-bounce"
      style={{ animationDelay: delay, animationDuration: "1s" }}
    />
  );
}

function HistoryBeginningMarker() {
  return (
    <div className="mx-auto w-full max-w-2xl flex items-center justify-center gap-2 py-4 mb-2 text-xs text-zinc-400 dark:text-zinc-500 select-none">
      <div className="h-px w-12 bg-zinc-200 dark:bg-zinc-800" />
      <span>Beginning of conversation history</span>
      <div className="h-px w-12 bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}

function MessageListLoading() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-zinc-400 dark:text-zinc-500" />
    </div>
  );
}

function MessageListEmpty({ onSelectStarterQuestion }: { onSelectStarterQuestion?: (question: string) => void }) {
  return (
    <div className="flex-1 overflow-y-auto [overflow-y:overlay] [scrollbar-gutter:stable_both-edges] p-4 pb-36 sm:p-6 sm:pb-40">
      <div className="mx-auto w-full max-w-2xl h-full flex flex-col justify-center">
        <EmptyChatState onSelectQuestion={onSelectStarterQuestion} />
      </div>
    </div>
  );
}

// ─── Props ───────────────────────────────────────────────────

export interface MessageListProps {
  pages?: PaginatedMessagesResponse[];
  isLoadingMessages?: boolean;
  isAiTyping?: boolean;
  streamingContent?: string | null;
  regeneratingMessageId?: string | null;
  onSelectStarterQuestion?: (question: string) => void;
  // Infinite scroll controls
  hasMoreMessages?: boolean;
  isLoadingOlderMessages?: boolean;
  isErrorOlderMessages?: boolean;
  onLoadOlderMessages?: () => void;
  // Message actions
  onEditMessage?: (messageId: string, newContent: string) => Promise<void>;
  onRegenerateMessage?: (messageId: string) => Promise<void>;
  onRetryMessage?: (messageId: string) => Promise<void>;
  onShareMessage?: (message: Message) => Promise<boolean> | boolean;
}

// ─── Component ───────────────────────────────────────────────

export function MessageList({
  pages,
  isLoadingMessages = false,
  isAiTyping = false,
  streamingContent = null,
  regeneratingMessageId = null,
  onSelectStarterQuestion,
  hasMoreMessages = false,
  isLoadingOlderMessages = false,
  isErrorOlderMessages = false,
  onLoadOlderMessages,
  onEditMessage,
  onRegenerateMessage,
  onRetryMessage,
  onShareMessage,
}: MessageListProps) {
  const listRef = useRef<VListHandle>(null);
  const isStuckToBottomRef = useRef(true);

  const displayPages = pages ?? [];

  const lastHistoryMsg = displayPages.at(-1)?.messages?.findLast(isDisplayable);

  // Count total displayable messages without allocating flat arrays
  let historyCount = 0;
  for (const page of displayPages) {
    for (const msg of page.messages ?? []) {
      if (isDisplayable(msg)) historyCount++;
    }
  }

  const messageCount = historyCount;
  const hasActiveStreamingText = Boolean(
    !regeneratingMessageId && streamingContent && streamingContent.trim().length > 0,
  );
  const showTypingIndicator = isAiTyping && !hasActiveStreamingText && !regeneratingMessageId;
  const showBeginningMarker = !hasMoreMessages && historyCount > 0;
  const totalChildCount = messageCount + +hasActiveStreamingText + +showTypingIndicator + +showBeginningMarker;

  // ── Scroll tracking & upward trigger ──────────────────────

  const handleScroll = useCallback(() => {
    const list = listRef.current;
    if (!list) return;

    const distFromBottom = list.scrollSize - list.scrollOffset - list.viewportSize;
    isStuckToBottomRef.current = distFromBottom < SCROLL_BOTTOM_THRESHOLD;

    // Trigger sequential older message load when user scrolls near the top
    if (
      list.scrollOffset <= SCROLL_TOP_THRESHOLD &&
      hasMoreMessages &&
      !isLoadingOlderMessages &&
      !isErrorOlderMessages &&
      onLoadOlderMessages
    ) {
      onLoadOlderMessages();
    }
  }, [hasMoreMessages, isLoadingOlderMessages, isErrorOlderMessages, onLoadOlderMessages]);

  // ── Snap to bottom for new incoming/outgoing messages ────

  const prevLastMessageIdRef = useRef<string | null>(null);
  const prevMessageCountRef = useRef(messageCount);
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    const currentLastId = hasActiveStreamingText ? "streaming-assistant-row" : (lastHistoryMsg?.id ?? null);

    const isAppendedMessage = Boolean(
      currentLastId && currentLastId !== prevLastMessageIdRef.current && messageCount > prevMessageCountRef.current,
    );

    prevLastMessageIdRef.current = currentLastId;
    prevMessageCountRef.current = messageCount;

    // Initial mount: snap to bottom of conversation
    if (isInitialMountRef.current && messageCount > 0) {
      isInitialMountRef.current = false;
      isStuckToBottomRef.current = true;
      requestAnimationFrame(() => {
        listRef.current?.scrollToIndex(totalChildCount - 1, {
          align: "end",
        });
      });
      return;
    }

    if (isAppendedMessage) {
      // Outgoing message from user or AI turn: stick to bottom if user is already near bottom
      if (isStuckToBottomRef.current) {
        requestAnimationFrame(() => {
          listRef.current?.scrollToIndex(totalChildCount - 1, {
            align: "end",
          });
        });
      }
    } else if (isStuckToBottomRef.current && (hasActiveStreamingText || isAiTyping || Boolean(regeneratingMessageId))) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToIndex(totalChildCount - 1, {
          align: "end",
        });
      });
    }
  }, [
    totalChildCount,
    messageCount,
    hasActiveStreamingText,
    streamingContent,
    isAiTyping,
    regeneratingMessageId,
    lastHistoryMsg,
  ]);

  // ── Early returns ────────────────────────────────────────

  if (isLoadingMessages && messageCount === 0) {
    return <MessageListLoading />;
  }

  if (messageCount === 0 && !isAiTyping) {
    return <MessageListEmpty onSelectStarterQuestion={onSelectStarterQuestion} />;
  }

  // ── Main render ──────────────────────────────────────────

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Floating top loading indicator when fetching earlier history */}
      {isLoadingOlderMessages && (
        <div className="pointer-events-none absolute top-3 left-0 right-0 z-20 flex justify-center">
          <div className="flex items-center gap-2 rounded-full border border-zinc-200/90 bg-white/90 px-3.5 py-1 text-xs font-medium text-zinc-600 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/90 dark:text-zinc-300">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600 dark:text-blue-400" />
            <span>Loading earlier messages...</span>
          </div>
        </div>
      )}

      {/* Floating top error banner with retry option */}
      {isErrorOlderMessages && (
        <div className="absolute top-3 left-0 right-0 z-20 flex justify-center px-4">
          <div className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50/95 px-3.5 py-1 text-xs font-medium text-red-700 shadow-sm backdrop-blur-md dark:border-red-900/40 dark:bg-red-950/90 dark:text-red-300">
            <span>Failed to load earlier messages.</span>
            {onLoadOlderMessages && (
              <button
                type="button"
                onClick={onLoadOlderMessages}
                className="cursor-pointer font-semibold underline hover:no-underline ml-1"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      <VList
        ref={listRef}
        className="flex-1 overflow-y-auto [overflow-y:overlay] [scrollbar-gutter:stable_both-edges] p-4 pb-36 sm:p-4.5 sm:pb-40"
        // shift
        onScroll={handleScroll}
      >
        {showBeginningMarker && <HistoryBeginningMarker key="history-beginning-marker" />}

        {displayPages.map((page) =>
          page.messages?.map((msg) =>
            isDisplayable(msg) ? (
              <MessageRow
                key={msg.id}
                message={msg}
                isRegenerating={regeneratingMessageId === msg.id}
                streamingContent={streamingContent}
                onEditMessage={onEditMessage}
                onRegenerateMessage={onRegenerateMessage}
                onRetryMessage={onRetryMessage}
                onShareMessage={onShareMessage}
              />
            ) : null,
          ),
        )}

        {hasActiveStreamingText && (
          <MessageRow
            key="streaming-assistant-row"
            message={{
              id: "streaming-assistant-row",
              conversationId: "",
              role: "assistant",
              content: streamingContent!,
              createdAt: new Date().toISOString(),
            }}
            isStreaming
          />
        )}

        {showTypingIndicator && <TypingIndicator />}
      </VList>
    </div>
  );
}
