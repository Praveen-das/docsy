"use client";

import { useRef, useEffect, useCallback } from "react";
import type { VListHandle } from "virtua";

const SCROLL_BOTTOM_THRESHOLD = 80;
const SCROLL_TOP_THRESHOLD = 150;

interface UseMessageListScrollOptions {
  messageCount: number;
  totalChildCount: number;
  hasActiveStreamingText: boolean;
  streamingContent: string | null;
  isAiTyping: boolean;
  regeneratingMessageId: string | null;
  lastHistoryMsgId?: string;
  hasMoreMessages: boolean;
  isLoadingOlderMessages: boolean;
  isErrorOlderMessages: boolean;
  onLoadOlderMessages?: () => void;
}

export function useMessageListScroll({
  messageCount,
  totalChildCount,
  hasActiveStreamingText,
  streamingContent,
  isAiTyping,
  regeneratingMessageId,
  lastHistoryMsgId,
  hasMoreMessages,
  isLoadingOlderMessages,
  isErrorOlderMessages,
  onLoadOlderMessages,
}: UseMessageListScrollOptions) {
  const listRef = useRef<VListHandle>(null);
  const isStuckToBottomRef = useRef(true);
  const prevLastMessageIdRef = useRef<string | null>(null);
  const prevMessageCountRef = useRef(messageCount);
  const isInitialMountRef = useRef(true);

  const handleScroll = useCallback(() => {
    const list = listRef.current;
    if (!list) return;

    const distFromBottom = list.scrollSize - list.scrollOffset - list.viewportSize;
    isStuckToBottomRef.current = distFromBottom < SCROLL_BOTTOM_THRESHOLD;

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

  useEffect(() => {
    const currentLastId = hasActiveStreamingText
      ? "streaming-assistant-row"
      : (lastHistoryMsgId ?? null);

    const isAppendedMessage = Boolean(
      currentLastId &&
        currentLastId !== prevLastMessageIdRef.current &&
        messageCount > prevMessageCountRef.current,
    );

    prevLastMessageIdRef.current = currentLastId;
    prevMessageCountRef.current = messageCount;

    const scrollToEnd = () => {
      requestAnimationFrame(() => {
        listRef.current?.scrollToIndex(totalChildCount - 1, { align: "end" });
      });
    };

    if (isInitialMountRef.current && messageCount > 0) {
      isInitialMountRef.current = false;
      isStuckToBottomRef.current = true;
      scrollToEnd();
      return;
    }

    if (isAppendedMessage) {
      if (isStuckToBottomRef.current) scrollToEnd();
    } else if (
      isStuckToBottomRef.current &&
      (hasActiveStreamingText || isAiTyping || Boolean(regeneratingMessageId))
    ) {
      scrollToEnd();
    }
  }, [
    totalChildCount,
    messageCount,
    hasActiveStreamingText,
    streamingContent,
    isAiTyping,
    regeneratingMessageId,
    lastHistoryMsgId,
  ]);

  return { listRef, handleScroll };
}
