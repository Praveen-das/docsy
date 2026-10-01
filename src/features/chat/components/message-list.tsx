"use client";

import React from "react";
import { VList } from "virtua";
import { Loader2 } from "lucide-react";
import type { Message, PaginatedMessagesResponse } from "@/types";
import { EmptyChatState } from "./empty-chat-state";
import { ChatMessageItem } from "./chat-message-item";
import { ThinkingIndicator } from "./thinking-indicator";
import { MessageListBanners } from "./message-list-banners";
import { useMessageListScroll } from "../hooks/use-message-list-scroll";

/** Filters out empty placeholder assistant messages */
const isDisplayable = (message: Message) =>
  message.role !== "assistant" || message.content.trim().length > 0;

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
    <div className="mx-auto w-full max-w-2xl flex items-center text-sm justify-start pb-6 px-4">
      <ThinkingIndicator />
    </div>
  );
});

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

function MessageListEmpty({
  onSelectStarterQuestion,
}: {
  onSelectStarterQuestion?: (question: string) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto [overflow-y:overlay] [scrollbar-gutter:stable_both-edges] p-4 pb-36 sm:p-6 sm:pb-40">
      <div className="mx-auto w-full max-w-2xl h-full flex flex-col justify-center">
        <EmptyChatState onSelectQuestion={onSelectStarterQuestion} />
      </div>
    </div>
  );
}

export interface MessageListProps {
  pages?: PaginatedMessagesResponse[];
  isLoadingMessages?: boolean;
  isAiTyping?: boolean;
  streamingContent?: string | null;
  regeneratingMessageId?: string | null;
  onSelectStarterQuestion?: (question: string) => void;
  hasMoreMessages?: boolean;
  isLoadingOlderMessages?: boolean;
  isErrorOlderMessages?: boolean;
  onLoadOlderMessages?: () => void;
  onEditMessage?: (messageId: string, newContent: string) => Promise<void>;
  onRegenerateMessage?: (messageId: string) => Promise<void>;
  onRetryMessage?: (messageId: string) => Promise<void>;
  onShareMessage?: (message: Message) => Promise<boolean> | boolean;
}

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
  const displayPages = pages ?? [];
  const lastHistoryMsg = displayPages.at(-1)?.messages?.findLast(isDisplayable);

  let messageCount = 0;
  for (const page of displayPages) {
    for (const msg of page.messages ?? []) {
      if (isDisplayable(msg)) messageCount++;
    }
  }

  const hasActiveStreamingText = Boolean(
    !regeneratingMessageId && streamingContent && streamingContent.trim().length > 0,
  );
  const showTypingIndicator = isAiTyping && !hasActiveStreamingText && !regeneratingMessageId;
  const showBeginningMarker = !hasMoreMessages && messageCount > 0;
  const totalChildCount =
    messageCount + +hasActiveStreamingText + +showTypingIndicator + +showBeginningMarker;

  const { listRef, handleScroll } = useMessageListScroll({
    messageCount,
    totalChildCount,
    hasActiveStreamingText,
    streamingContent,
    isAiTyping,
    regeneratingMessageId,
    lastHistoryMsgId: lastHistoryMsg?.id,
    hasMoreMessages,
    isLoadingOlderMessages,
    isErrorOlderMessages,
    onLoadOlderMessages,
  });

  if (isLoadingMessages && messageCount === 0) {
    return <MessageListLoading />;
  }

  if (messageCount === 0 && !isAiTyping) {
    return <MessageListEmpty onSelectStarterQuestion={onSelectStarterQuestion} />;
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <MessageListBanners
        isLoadingOlderMessages={isLoadingOlderMessages}
        isErrorOlderMessages={isErrorOlderMessages}
        onLoadOlderMessages={onLoadOlderMessages}
      />

      <VList
        ref={listRef}
        className="flex-1 overflow-y-auto [overflow-y:overlay] [scrollbar-gutter:stable_both-edges] p-4 pb-36 sm:p-4.5 sm:pb-40"
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
