"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { useConversationStore } from "@/stores/conversation-store";
import { useActiveConversation } from "@/features/conversations/hooks/use-conversations";
import { useDocuments } from "@/features/documents/hooks/use-documents";
import { useConversationMessages } from "./use-conversation-messages";
import { useChatSessionSync } from "./use-chat-session-sync";
import { useChatActions } from "./use-chat-actions";
import { shareMessageContent } from "../utils/chat-message.utils";

export interface UseChatConversationOptions {
  documentId?: string;
}

/**
 * Top-level chat conversation orchestrator hook.
 * Composes message pagination, active session synchronization, and message dispatch.
 */
export function useChatConversation({ documentId: propDocumentId }: UseChatConversationOptions = {}) {
  const searchParams = useSearchParams();

  const urlConvId = searchParams?.get("conv") || "";
  const storeActiveId = useConversationStore((state) => state.activeConversationId) || "";
  const activeConvId = urlConvId || storeActiveId;

  const {
    regeneratingMessageId,
    isLoadingAi,
    isAiTyping,
    streamingContent,
    activeStreams,
  } = useConversationStore(
    useShallow((state) => ({
      regeneratingMessageId: state.regeneratingMessageId,
      isLoadingAi: state.isLoadingAi,
      isAiTyping: state.isAiTyping,
      streamingContent: state.streamingContent,
      activeStreams: state.activeStreams,
    })),
  );

  const { data: activeConv } = useActiveConversation(activeConvId);
  const { data: documents = [] } = useDocuments();

  const activeStream = activeConvId ? activeStreams[activeConvId] : undefined;

  // Sync stream recovery and token pre-seeding
  useChatSessionSync(activeConvId, activeStream?.streamChannelId, activeConv?.streamToken);

  // Resolve active document context
  const convDocId = activeConv?.documentIds[0];
  const urlDocId = searchParams?.get("doc") || undefined;
  const effectiveDocId = propDocumentId || urlDocId || convDocId;

  const primaryDoc = useMemo(() => {
    if (documents.length === 0) return undefined;
    if (effectiveDocId) {
      const match = documents.find((d) => d.id === effectiveDocId);
      if (match) return match;
    }
    return documents[0];
  }, [documents, effectiveDocId]);

  const title = activeConv?.title || "New Conversation";

  // Message pagination query
  const {
    data: infiniteData,
    isLoading: isQueryLoading,
    isFetchingPreviousPage: isLoadingOlderMessages,
    hasPreviousPage: hasMoreMessages,
    isError: isErrorOlderMessages,
    fetchPreviousPage: fetchOlderMessages,
  } = useConversationMessages(activeConvId);

  const pages = infiniteData?.pages;
  const isWorking = isLoadingAi || isAiTyping;
  const hasHistory = Boolean(pages?.some((p) => p.messages && p.messages.length > 0));
  const isLoadingMessages = isQueryLoading && !hasHistory;
  const isLoading = isWorking || isLoadingMessages;

  // Actions
  const {
    handleSendMessage,
    handleEditMessage,
    handleRegenerateMessage,
    handleRetryMessage,
  } = useChatActions({
    activeConvId,
    effectiveDocId,
    primaryDocId: primaryDoc?.id,
    isWorking,
  });

  return {
    activeConvId,
    title,
    primaryDoc,
    pages,
    isLoading,
    isAiTyping,
    streamingContent,
    regeneratingMessageId,
    isLoadingMessages,
    hasMoreMessages: Boolean(hasMoreMessages),
    isLoadingOlderMessages,
    isErrorOlderMessages,
    fetchOlderMessages,
    handleSendMessage,
    handleEditMessage,
    handleRegenerateMessage,
    handleRetryMessage,
    handleShareMessage: shareMessageContent,
  };
}
