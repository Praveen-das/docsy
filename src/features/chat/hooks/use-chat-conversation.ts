"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { Message, type PaginatedMessagesResponse } from "@/types";
import { useConversationStore } from "@/stores/conversation-store";
import { useConversations, useCreateConversation } from "@/features/conversations/hooks/use-conversations";
import { useDocuments } from "@/features/documents/hooks/use-documents";
import { useConversationMessages } from "./use-conversation-messages";
import { shareMessageContent, getAllConversationMessages, extractConversationTurns } from "../utils/chat-message.utils";

export interface UseChatConversationOptions {
  documentId?: string;
}

/**
 * Top-level chat conversation orchestrator hook.
 * Composes message pagination, active session synchronization, and message dispatch.
 * Directly integrates with useConversationStore and TanStack Query cache.
 */
export function useChatConversation({ documentId: propDocumentId }: UseChatConversationOptions = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Zustand selectors: reactive values grouped with useShallow, stable action references selected individually
  const {
    activeConvId,
    regeneratingMessageId,
    isLoadingAi,
    isAiTyping,
    streamingContent,
    activeStreams,
  } = useConversationStore(
    useShallow((state) => ({
      activeConvId: state.activeConversationId || "",
      regeneratingMessageId: state.regeneratingMessageId,
      isLoadingAi: state.isLoadingAi,
      isAiTyping: state.isAiTyping,
      streamingContent: state.streamingContent,
      activeStreams: state.activeStreams,
    })),
  );

  const setActiveConversation = useConversationStore((state) => state.setActiveConversation);
  const pollConversationTitle = useConversationStore((state) => state.pollConversationTitle);
  const editMessage = useConversationStore((state) => state.editMessage);
  const regenerateMessage = useConversationStore((state) => state.regenerateMessage);
  const sendStoreMessage = useConversationStore((state) => state.sendMessage);
  const resumeActiveStream = useConversationStore((state) => state.resumeActiveStream);

  const { conversations } = useConversations();
  const { mutateAsync: createConversation } = useCreateConversation();
  const { data: documents = [] } = useDocuments();

  const activeStream = useMemo(() => {
    return activeConvId ? activeStreams[activeConvId] : undefined;
  }, [activeConvId, activeStreams]);

  const activeStreamChannelId = activeStream?.streamChannelId;

  // Auto-resume any in-flight stream on reload or conversation switch
  useEffect(() => {
    if (activeConvId && activeStreamChannelId) {
      resumeActiveStream(activeConvId);
    }
  }, [activeConvId, activeStreamChannelId, resumeActiveStream]);

  // Derived state
  const activeConv = conversations.find((c) => c.id === activeConvId);
  const convDocId = activeConv?.documentIds[0];
  const urlDocId = searchParams?.get("doc") || undefined;
  const effectiveDocId = propDocumentId || urlDocId || convDocId;

  // Pre-seed streamToken for active conversation if present on activeConv
  useEffect(() => {
    if (activeConvId && activeConv?.streamToken) {
      const store = useConversationStore.getState();
      if (!store.getStreamToken(activeConvId)) {
        store.setStreamToken(activeConvId, activeConv.streamToken);
      }
    }
  }, [activeConvId, activeConv?.streamToken]);

  const primaryDoc = useMemo(() => {
    if (documents.length === 0) return undefined;
    if (effectiveDocId) {
      const match = documents.find((d) => d.id === effectiveDocId);
      if (match) return match;
    }
    return documents[0];
  }, [documents, effectiveDocId]);

  const title = activeConv?.title || "New Conversation";

  // React Query infinite query for bi-directional message fetching.
  // Prepend pagination via getPreviousPageParam keeps data.pages in natural chronological order.
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

  // ── Actions colocated directly in hook ─────────────────────────

  const handleSendMessage = useCallback(
    async (text: string, onSuccess?: () => void) => {
      const content = text.trim();
      if (!content || isWorking) return;

      let targetConvId = activeConvId;
      if (!targetConvId) {
        const targetDocId = effectiveDocId || primaryDoc?.id || "doc-1";
        try {
          targetConvId = await createConversation({
            documentId: targetDocId,
            initialTitle: content,
          });
          setActiveConversation(targetConvId);
          router.replace(`/conversation?doc=${targetDocId}&conv=${targetConvId}`);
          pollConversationTitle(targetConvId, content);
        } catch (err) {
          console.error("Failed to initialize conversation before sending:", err);
          return;
        }
      }

      onSuccess?.();

      const allMsgs = getAllConversationMessages(queryClient, targetConvId);
      const conversationHistory = extractConversationTurns(allMsgs);

      await sendStoreMessage(targetConvId, content, { conversationHistory });
    },
    [
      isWorking,
      activeConvId,
      effectiveDocId,
      primaryDoc,
      createConversation,
      setActiveConversation,
      pollConversationTitle,
      router,
      queryClient,
      sendStoreMessage,
    ],
  );

  const handleEditMessage = useCallback(
    async (messageId: string, newContent: string) => {
      const trimmed = newContent.trim();
      if (!trimmed || !activeConvId) return;

      const queryKey = ["conversations", activeConvId, "messages"];
      const previousData = queryClient.getQueryData<InfiniteData<PaginatedMessagesResponse>>(queryKey);

      // 1. Optimistically update React Query cache in-place
      queryClient.setQueryData<InfiniteData<PaginatedMessagesResponse>>(
        queryKey,
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              messages: page.messages.map((m) => (m.id === messageId ? { ...m, content: trimmed } : m)),
            })),
          };
        },
      );

      // 2. Persist update in DB with rollback on failure
      try {
        await editMessage(activeConvId, messageId, trimmed);
      } catch (err) {
        if (previousData) {
          queryClient.setQueryData(queryKey, previousData);
        }
        console.error("Failed to update message on server:", err);
        return;
      }

      // 3. Find subsequent assistant turn to regenerate in place, or send fresh turn
      const allMsgs = getAllConversationMessages(queryClient, activeConvId);
      const userMsgIdx = allMsgs.findIndex((m) => m.id === messageId);
      const nextMsg = userMsgIdx !== -1 ? allMsgs[userMsgIdx + 1] : undefined;

      const conversationHistory = extractConversationTurns(allMsgs, userMsgIdx);

      if (nextMsg && nextMsg.role === "assistant") {
        await regenerateMessage(activeConvId, nextMsg.id, {
          promptContent: trimmed,
          conversationHistory,
        });
      } else {
        await sendStoreMessage(activeConvId, trimmed, { conversationHistory });
      }
    },
    [activeConvId, queryClient, editMessage, regenerateMessage, sendStoreMessage],
  );

  const handleRegenerateMessage = useCallback(
    async (assistantMessageId: string) => {
      if (!activeConvId || isWorking) return;

      const allMsgs = getAllConversationMessages(queryClient, activeConvId);
      const assistantIdx = allMsgs.findIndex((m) => m.id === assistantMessageId);
      if (assistantIdx === -1) return;

      let promptContent = "";
      let priorTurns: Message[] = [];

      for (let i = assistantIdx - 1; i >= 0; i--) {
        if (allMsgs[i].role === "user") {
          promptContent = allMsgs[i].content;
          priorTurns = allMsgs.slice(0, i);
          break;
        }
      }

      if (!promptContent) {
        console.warn("Cannot regenerate message: No preceding user prompt found.");
        return;
      }

      const conversationHistory = extractConversationTurns(priorTurns);

      await regenerateMessage(activeConvId, assistantMessageId, {
        promptContent,
        conversationHistory,
      });
    },
    [activeConvId, isWorking, queryClient, regenerateMessage],
  );

  const handleRetryMessage = useCallback(
    async (messageId: string) => {
      if (!activeConvId || isWorking) return;

      const allMsgs = getAllConversationMessages(queryClient, activeConvId);
      const targetMsg = allMsgs.find((m) => m.id === messageId);
      if (!targetMsg) return;

      if (targetMsg.role === "assistant") {
        await handleRegenerateMessage(messageId);
      } else {
        const targetIdx = allMsgs.findIndex((m) => m.id === messageId);
        const nextMsg = targetIdx !== -1 ? allMsgs[targetIdx + 1] : undefined;
        if (nextMsg && nextMsg.role === "assistant") {
          await handleRegenerateMessage(nextMsg.id);
        } else {
          await handleSendMessage(targetMsg.content);
        }
      }
    },
    [activeConvId, isWorking, queryClient, handleRegenerateMessage, handleSendMessage],
  );

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
