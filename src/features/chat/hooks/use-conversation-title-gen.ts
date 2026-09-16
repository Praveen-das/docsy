"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useConversationStore } from "@/stores/conversation-store";
import { conversationService } from "../services/conversation.service";
import { getAllConversationMessages } from "../utils/chat-message.utils";

/**
 * Hook to manage on-demand conversation title/label generation.
 */
export function useConversationTitleGen(activeConvId: string) {
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const queryClient = useQueryClient();

  const handleGenerateTitle = useCallback(async () => {
    if (!activeConvId || isGeneratingTitle) return;

    setIsGeneratingTitle(true);
    try {
      const allMsgs = getAllConversationMessages(queryClient, activeConvId);
      const firstUser = allMsgs.find((m) => m.role === "user")?.content;
      const firstAi = allMsgs.find((m) => m.role === "assistant")?.content;

      const newTitle = await conversationService.generateConversationTitle(
        activeConvId,
        firstUser,
        firstAi
      );

      if (newTitle) {
        useConversationStore.setState((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === activeConvId
              ? { ...c, title: newTitle, updatedAt: new Date().toISOString() }
              : c
          ),
        }));
      }
    } catch (err) {
      console.error("Failed to generate label for conversation:", err);
    } finally {
      setIsGeneratingTitle(false);
    }
  }, [activeConvId, isGeneratingTitle, queryClient]);

  return {
    isGeneratingTitle,
    handleGenerateTitle,
  };
}
