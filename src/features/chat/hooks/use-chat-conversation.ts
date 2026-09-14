"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Message } from "@/types";
import { useConversationStore } from "@/stores/conversation-store";
import { useDocumentStore } from "@/stores/document-store";
import { useConversationMessages } from "./use-conversation-messages";

export interface UseChatConversationOptions {
  conversationId?: string;
  conversationTitle?: string;
  documentId?: string;
  propMessages?: Message[];
  propIsLoading?: boolean;
  propOnSendMessage?: (content: string) => void;
  onDeleteChat?: () => void;
}

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
  const conversations = useConversationStore((state) => state.conversations);
  const messagesRecord = useConversationStore((state) => state.messages);
  const storeIsLoading = useConversationStore((state) => state.isLoadingAi);
  const sendMessage = useConversationStore((state) => state.sendMessage);
  const setMessages = useConversationStore((state) => state.setMessages);
  const deleteConversation = useConversationStore((state) => state.deleteConversation);
  const createConversation = useConversationStore((state) => state.createConversation);
  const setActiveConversation = useConversationStore((state) => state.setActiveConversation);
  const pollConversationTitle = useConversationStore((state) => state.pollConversationTitle);

  const documents = useDocumentStore((state) => state.documents);

  // Derived state
  const activeConvId = propConversationId || storeActiveConvId || "";
  const activeConv = conversations.find((c) => c.id === activeConvId);
  const convDocId = activeConv?.documentIds[0];
  const urlDocId = searchParams?.get("doc") || undefined;
  const effectiveDocId = propDocumentId || urlDocId || convDocId;
  const primaryDoc = (effectiveDocId ? documents.find((d) => d.id === effectiveDocId) : undefined) || documents[0];

  const title = propConversationTitle || activeConv?.title || "New Conversation";

  // React Query for declarative message fetching & caching
  const { data: queryMessages, isLoading: isQueryLoading } = useConversationMessages(activeConvId);

  const storeMsgs = activeConvId ? messagesRecord[activeConvId] : undefined;

  // Synchronize server-fetched messages into Zustand when initial fetch completes
  useEffect(() => {
    if (activeConvId && queryMessages && !storeIsLoading) {
      if (!storeMsgs || storeMsgs.length === 0) {
        setMessages(activeConvId, queryMessages);
      }
    }
  }, [activeConvId, queryMessages, storeIsLoading, storeMsgs, setMessages]);

  const messages = propMessages ?? (storeMsgs && storeMsgs.length > 0 ? storeMsgs : (queryMessages ?? []));
  const isLoading =
    propIsLoading !== undefined
      ? propIsLoading
      : storeIsLoading || (isQueryLoading && (!storeMsgs || storeMsgs.length === 0));

  // Single unified message sending action
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

        sendMessage(targetConvId, content, primaryDoc);
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
    ],
  );

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

    const remaining = conversations.filter((c) => c.documentIds.includes(docTargetId) && c.id !== activeConvId);
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

  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);

  // Manually trigger title/label assignment for testing or user request
  const handleGenerateTitle = useCallback(async () => {
    if (!activeConvId || isGeneratingTitle) return;

    setIsGeneratingTitle(true);
    try {
      const firstUser = messages.find((m) => m.role === "user")?.content;
      const firstAi = messages.find((m) => m.role === "assistant")?.content;

      const res = await fetch(`/api/conversations/${activeConvId}/title`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: firstUser,
          assistantMessage: firstAi,
          force: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.title) {
          useConversationStore.setState((s) => ({
            conversations: s.conversations.map((c) =>
              c.id === activeConvId ? { ...c, title: data.title, updatedAt: new Date().toISOString() } : c,
            ),
          }));
        }
      }
    } catch (err) {
      console.error("Failed to assign label to conversation:", err);
    } finally {
      setIsGeneratingTitle(false);
    }
  }, [activeConvId, isGeneratingTitle, messages]);

  return {
    activeConvId,
    title,
    primaryDoc,
    messages,
    isLoading,
    isGeneratingTitle,
    handleSendMessage,
    handleDelete,
    handleGenerateTitle,
  };
}
