"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useConversationStore } from "@/stores/conversation-store";

/**
 * Hook for managing draft message text with active conversation synchronization.
 */
export function useChatDraft(conversationId: string) {
  const drafts = useConversationStore((state) => state.drafts);
  const saveDraft = useConversationStore((state) => state.saveDraft);

  const currentDraft = (conversationId && drafts[conversationId]) || "";
  const [inputText, setInputText] = useState(currentDraft);
  const prevConvIdRef = useRef(conversationId);

  // Sync draft text when active conversation changes
  useEffect(() => {
    if (prevConvIdRef.current !== conversationId) {
      prevConvIdRef.current = conversationId;
      setInputText(currentDraft);
    }
  }, [conversationId, currentDraft]);

  const handleInputChange = useCallback(
    (value: string) => {
      setInputText(value);
      if (conversationId) {
        saveDraft(conversationId, value);
      }
    },
    [conversationId, saveDraft]
  );

  const clearInput = useCallback(() => {
    setInputText("");
    if (conversationId) {
      saveDraft(conversationId, "");
    }
  }, [conversationId, saveDraft]);

  return {
    inputText,
    handleInputChange,
    clearInput,
  };
}
