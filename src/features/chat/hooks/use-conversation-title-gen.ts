"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { updateConversationInCache } from "@/features/conversations/hooks/use-conversations";
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
        updateConversationInCache(activeConvId, {
          title: newTitle,
          updatedAt: new Date().toISOString(),
        });
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
