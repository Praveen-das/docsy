"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import type { PaginatedMessagesResponse } from "@/types";
import { useConversationStore } from "@/stores/conversation-store";
import { useCreateConversation } from "@/features/conversations/hooks/use-conversations";
import {
  getAllConversationMessages,
  extractConversationTurns,
  findPrecedingUserTurn,
} from "../utils/chat-message.utils";

interface UseChatActionsProps {
  activeConvId: string;
  effectiveDocId?: string;
  primaryDocId?: string;
  isWorking: boolean;
}

export function useChatActions({ activeConvId, effectiveDocId, primaryDocId, isWorking }: UseChatActionsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutateAsync: createConversation } = useCreateConversation();

  const setActiveConversation = useConversationStore((s) => s.setActiveConversation);
  const pollConversationTitle = useConversationStore((s) => s.pollConversationTitle);
  const editMessage = useConversationStore((s) => s.editMessage);
  const regenerateMessage = useConversationStore((s) => s.regenerateMessage);
  const sendStoreMessage = useConversationStore((s) => s.sendMessage);

  const handleSendMessage = useCallback(
    async (text: string, onSuccess?: () => void) => {
      const content = text.trim();
      if (!content || isWorking) return;

      let targetConvId = activeConvId;
      if (!targetConvId) {
        const targetDocId = effectiveDocId || primaryDocId || "doc-1";
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
      primaryDocId,
      createConversation,
      setActiveConversation,
      router,
      pollConversationTitle,
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

      // Optimistically update React Query cache in-place
      queryClient.setQueryData<InfiniteData<PaginatedMessagesResponse>>(queryKey, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            messages: page.messages.map((m) => (m.id === messageId ? { ...m, content: trimmed } : m)),
          })),
        };
      });

      try {
        await editMessage(activeConvId, messageId, trimmed);
      } catch (err) {
        if (previousData) {
          queryClient.setQueryData(queryKey, previousData);
        }
        console.error("Failed to update message on server:", err);
        return;
      }

      const allMsgs = getAllConversationMessages(queryClient, activeConvId);
      const userMsgIdx = allMsgs.findIndex((m) => m.id === messageId);
      const nextMsg = userMsgIdx !== -1 ? allMsgs[userMsgIdx + 1] : undefined;
      const conversationHistory = extractConversationTurns(allMsgs, userMsgIdx);

      if (nextMsg?.role === "assistant") {
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

      const turn = findPrecedingUserTurn(allMsgs, assistantIdx);
      if (!turn) {
        console.warn("Cannot regenerate message: No preceding user prompt found.");
        return;
      }

      const conversationHistory = extractConversationTurns(turn.priorTurns);
      await regenerateMessage(activeConvId, assistantMessageId, {
        promptContent: turn.promptContent,
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
        return;
      }

      const targetIdx = allMsgs.findIndex((m) => m.id === messageId);
      const nextMsg = targetIdx !== -1 ? allMsgs[targetIdx + 1] : undefined;
      if (nextMsg?.role === "assistant") {
        await handleRegenerateMessage(nextMsg.id);
      } else {
        await handleSendMessage(targetMsg.content);
      }
    },
    [activeConvId, isWorking, queryClient, handleRegenerateMessage, handleSendMessage],
  );

  return {
    handleSendMessage,
    handleEditMessage,
    handleRegenerateMessage,
    handleRetryMessage,
  };
}
