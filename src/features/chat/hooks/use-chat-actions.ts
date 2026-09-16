"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { Document, Message, type PaginatedMessagesResponse } from "@/types";
import { useConversationStore } from "@/stores/conversation-store";
import {
  getAllConversationMessages,
  extractConversationTurns,
} from "../utils/chat-message.utils";

interface UseChatActionsParams {
  activeConvId: string;
  effectiveDocId?: string;
  primaryDoc?: Document;
  isLoading: boolean;
  propOnSendMessage?: (content: string) => void;
}

/**
 * Hook grouping message dispatch, editing, regeneration, and retry actions.
 */
export function useChatActions({
  activeConvId,
  effectiveDocId,
  primaryDoc,
  isLoading,
  propOnSendMessage,
}: UseChatActionsParams) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const sendMessage = useConversationStore((state) => state.sendMessage);
  const editMessage = useConversationStore((state) => state.editMessage);
  const regenerateMessage = useConversationStore((state) => state.regenerateMessage);
  const createConversation = useConversationStore((state) => state.createConversation);
  const setActiveConversation = useConversationStore((state) => state.setActiveConversation);
  const pollConversationTitle = useConversationStore((state) => state.pollConversationTitle);

  const handleSendMessage = useCallback(
    async (text: string, onSuccess?: () => void) => {
      const content = text.trim();
      if (!content || isLoading) return;

      if (propOnSendMessage) {
        propOnSendMessage(content);
      } else {
        let targetConvId = activeConvId;
        if (!targetConvId) {
          const targetDocId = effectiveDocId || primaryDoc?.id || "doc-1";
          try {
            targetConvId = await createConversation(targetDocId, content);
            setActiveConversation(targetConvId);
            router.replace(`/conversation?doc=${targetDocId}&conv=${targetConvId}`);
            pollConversationTitle(targetConvId, content);
          } catch (err) {
            console.error("Failed to initialize conversation before sending:", err);
            return;
          }
        }

        const priorMessages = getAllConversationMessages(queryClient, targetConvId);
        sendMessage(targetConvId, content, { priorMessages, activeDoc: primaryDoc });
      }

      onSuccess?.();
    },
    [
      isLoading,
      propOnSendMessage,
      activeConvId,
      effectiveDocId,
      primaryDoc,
      createConversation,
      setActiveConversation,
      pollConversationTitle,
      router,
      sendMessage,
      queryClient,
    ]
  );

  const handleEditMessage = useCallback(
    async (messageId: string, newContent: string) => {
      const trimmed = newContent.trim();
      if (!trimmed || !activeConvId) return;

      // 1. Optimistically update React Query cache in-place
      queryClient.setQueryData<InfiniteData<PaginatedMessagesResponse>>(
        ["conversations", activeConvId, "messages"],
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              messages: page.messages.map((m) =>
                m.id === messageId ? { ...m, content: trimmed } : m
              ),
            })),
          };
        }
      );

      // 2. Persist update in DB
      try {
        await editMessage(activeConvId, messageId, trimmed);
      } catch (err) {
        console.error("Failed to update message on server:", err);
      }

      // 3. Find subsequent assistant turn to regenerate in place, or send fresh turn
      const allMsgs = getAllConversationMessages(queryClient, activeConvId);
      const userMsgIdx = allMsgs.findIndex((m) => m.id === messageId);
      const nextMsg = userMsgIdx !== -1 ? allMsgs[userMsgIdx + 1] : undefined;

      const priorTurns = userMsgIdx > 0 ? allMsgs.slice(0, userMsgIdx) : [];
      const conversationHistory = extractConversationTurns(allMsgs, userMsgIdx);

      if (nextMsg && nextMsg.role === "assistant") {
        await regenerateMessage(activeConvId, nextMsg.id, {
          promptContent: trimmed,
          conversationHistory,
        });
      } else {
        sendMessage(activeConvId, trimmed, {
          priorMessages: priorTurns,
          activeDoc: primaryDoc,
        });
      }
    },
    [activeConvId, queryClient, editMessage, regenerateMessage, sendMessage, primaryDoc]
  );

  const handleRegenerateMessage = useCallback(
    async (assistantMessageId: string) => {
      if (!activeConvId || isLoading) return;

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
        promptContent = allMsgs[assistantIdx].content;
      }

      const conversationHistory = extractConversationTurns(priorTurns);

      await regenerateMessage(activeConvId, assistantMessageId, {
        promptContent,
        conversationHistory,
      });
    },
    [activeConvId, isLoading, queryClient, regenerateMessage]
  );

  const handleRetryMessage = useCallback(
    async (messageId: string) => {
      if (!activeConvId || isLoading) return;

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
          const priorTurns = targetIdx > 0 ? allMsgs.slice(0, targetIdx) : [];
          sendMessage(activeConvId, targetMsg.content, {
            priorMessages: priorTurns,
            activeDoc: primaryDoc,
          });
        }
      }
    },
    [activeConvId, isLoading, queryClient, handleRegenerateMessage, sendMessage, primaryDoc]
  );

  return {
    handleSendMessage,
    handleEditMessage,
    handleRegenerateMessage,
    handleRetryMessage,
  };
}
