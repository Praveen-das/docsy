"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Message } from "@/types";
import { useConversationStore } from "@/stores/conversation-store";
import { useConversations, useDeleteConversation } from "@/features/conversations/hooks/use-conversations";
import { useDocuments } from "@/features/documents/hooks/use-documents";
import {
  useConversationMessages,
  extractMessagesFromInfiniteData,
} from "./use-conversation-messages";
import { useSyncRegeneratedCache } from "./use-sync-regenerated-cache";
import { useConversationTitleGen } from "./use-conversation-title-gen";
import { useChatActions } from "./use-chat-actions";
import { shareMessageContent } from "../utils/chat-message.utils";

const EMPTY_MESSAGES: Message[] = [];

export interface UseChatConversationOptions {
  conversationId?: string;
  conversationTitle?: string;
  documentId?: string;
  propMessages?: Message[];
  propIsLoading?: boolean;
  propOnSendMessage?: (content: string) => void;
  onDeleteChat?: () => void;
}

/**
 * Top-level chat conversation orchestrator hook.
 * Composes message pagination, active session synchronization, title generation, and message dispatch.
 */
export function useChatConversation({
  conversationId: propConversationId,
  conversationTitle: propConversationTitle,
  documentId: propDocumentId,
  propMessages,
  propIsLoading,
  propOnSendMessage,
  onDeleteChat,
}: UseChatConversationOptions = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Zustand selectors following strict selector rule
  const storeActiveConvId = useConversationStore((state) => state.activeConversationId);
  const { conversations } = useConversations();
  const storeIsLoading = useConversationStore((state) => state.isLoadingAi);
  const isAiTyping = useConversationStore((state) => state.isAiTyping);
  const streamingContent = useConversationStore((state) => state.streamingContent);
  const regeneratingMessageId = useConversationStore((state) => state.regeneratingMessageId);
  const { mutateAsync: deleteConversation } = useDeleteConversation();
  const setActiveConversation = useConversationStore((state) => state.setActiveConversation);

  const { data: documents = [] } = useDocuments();

  // Derived state
  const activeConvId = propConversationId || storeActiveConvId || "";
  const activeConv = conversations.find((c) => c.id === activeConvId);
  const convDocId = activeConv?.documentIds[0];
  const urlDocId = searchParams?.get("doc") || undefined;
  const effectiveDocId = propDocumentId || urlDocId || convDocId;
  const primaryDoc =
    (effectiveDocId ? documents.find((d) => d.id === effectiveDocId) : undefined) || documents[0];

  const title = propConversationTitle || activeConv?.title || "New Conversation";

  // React Query infinite query for declarative message fetching & sequential caching
  const {
    data: infiniteData,
    isLoading: isQueryLoading,
    isFetchingNextPage: isLoadingOlderMessages,
    hasNextPage: hasMoreMessages,
    isError: isErrorOlderMessages,
    fetchNextPage: fetchOlderMessages,
  } = useConversationMessages(activeConvId);

  // Targeted selector: only re-renders when THIS conversation's session messages change.
  const activeSessionMessages = useConversationStore(
    (state) => (activeConvId ? state.sessionMessages[activeConvId] : undefined) ?? EMPTY_MESSAGES
  );

  // Server history extracted from React Query cache
  const queryMessages = useMemo(() => {
    return extractMessagesFromInfiniteData(infiniteData);
  }, [infiniteData]);

  const historyMessages = propMessages ?? queryMessages;

  // Pending session turns not yet persisted in server history
  const pendingMessages = useMemo(() => {
    if (propMessages) return EMPTY_MESSAGES;
    if (activeSessionMessages === EMPTY_MESSAGES || activeSessionMessages.length === 0) {
      return EMPTY_MESSAGES;
    }
    if (!historyMessages.length) return activeSessionMessages;
    const historyIds = new Set(historyMessages.map((m) => m.id));
    const filtered = activeSessionMessages.filter((m) => !historyIds.has(m.id));
    return filtered.length > 0 ? filtered : EMPTY_MESSAGES;
  }, [propMessages, historyMessages, activeSessionMessages]);

  // Sync regenerated AI turns into React Query cache upon stream finish
  useSyncRegeneratedCache(activeConvId, storeIsLoading, regeneratingMessageId);

  const isLoadingMessages =
    isQueryLoading && historyMessages.length === 0 && pendingMessages.length === 0;
  const isLoading = (propIsLoading ?? storeIsLoading) || isLoadingMessages;

  // Title generation hook
  const { isGeneratingTitle, handleGenerateTitle } = useConversationTitleGen(activeConvId);

  // Message mutation actions hook
  const {
    handleSendMessage,
    handleEditMessage,
    handleRegenerateMessage,
    handleRetryMessage,
  } = useChatActions({
    activeConvId,
    effectiveDocId,
    primaryDoc,
    isLoading,
    propOnSendMessage,
  });

  // Conversation deletion and route reconciliation
  const handleDelete = useCallback(() => {
    if (!activeConvId) return;
    if (onDeleteChat) {
      onDeleteChat();
      return;
    }
    deleteConversation(activeConvId);

    const docTargetId = effectiveDocId || convDocId || "";
    if (!docTargetId) {
      setActiveConversation(null);
      router.replace("/conversation");
      return;
    }

    const remaining = conversations.filter(
      (c) => c.documentIds.includes(docTargetId) && c.id !== activeConvId
    );
    if (remaining.length > 0) {
      setActiveConversation(remaining[0].id);
      router.replace(`/conversation?doc=${docTargetId}&conv=${remaining[0].id}`);
    } else {
      setActiveConversation(null);
      router.replace(`/conversation?doc=${docTargetId}`);
    }
  }, [
    activeConvId,
    onDeleteChat,
    deleteConversation,
    effectiveDocId,
    convDocId,
    conversations,
    setActiveConversation,
    router,
  ]);

  return {
    activeConvId,
    title,
    primaryDoc,
    historyMessages,
    pendingMessages,
    isLoading,
    isAiTyping,
    streamingContent,
    regeneratingMessageId,
    isLoadingMessages,
    hasMoreMessages: Boolean(hasMoreMessages),
    isLoadingOlderMessages,
    isErrorOlderMessages,
    fetchOlderMessages,
    isGeneratingTitle,
    handleSendMessage,
    handleEditMessage,
    handleRegenerateMessage,
    handleRetryMessage,
    handleShareMessage: shareMessageContent,
    handleDelete,
    handleGenerateTitle,
  };
}
