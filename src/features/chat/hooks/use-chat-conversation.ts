"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { Message, type PaginatedMessagesResponse } from "@/types";
import { useConversationStore } from "@/stores/conversation-store";
import { useDocumentStore } from "@/stores/document-store";
import {
  useConversationMessages,
  getCachedMessages,
  extractMessagesFromInfiniteData,
} from "./use-conversation-messages";

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
  const storeIsLoading = useConversationStore((state) => state.isLoadingAi);
  const isAiTyping = useConversationStore((state) => state.isAiTyping);
  const streamingContent = useConversationStore((state) => state.streamingContent);
  const regeneratingMessageId = useConversationStore((state) => state.regeneratingMessageId);
  const sendMessage = useConversationStore((state) => state.sendMessage);
  const editMessage = useConversationStore((state) => state.editMessage);
  const regenerateMessage = useConversationStore((state) => state.regenerateMessage);
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
  // Uses a module-level EMPTY_MESSAGES constant so the fallback is referentially stable.
  const activeSessionMessages = useConversationStore(
    (state) => (activeConvId ? state.sessionMessages[activeConvId] : undefined) ?? EMPTY_MESSAGES,
  );

  const queryClient = useQueryClient();

  // Server history — referentially stable from React Query cache, ordered chronologically
  const queryMessages = useMemo(() => {
    return extractMessagesFromInfiniteData(infiniteData);
  }, [infiniteData]);

  const historyMessages = propMessages ?? queryMessages;

  // Pending session turns not yet persisted in server history.
  // Derived via filter (not merge) — no combined array is allocated per render.
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

  // After AI stream completes, optimistically patch the React Query cache with
  // regenerated content from sessionMessages, then invalidate for server sync.
  // Without the optimistic patch the UI would show stale data until the server
  // refetch lands because the DB write may still be in-flight.
  const prevLoadingRef = useRef(false);
  // Capture the regeneratingMessageId that was active *before* the Zustand batch
  // clears it. We track it via a ref updated each render so we can read the
  // previous value inside the effect that fires when isLoadingAi transitions.
  const lastKnownRegIdRef = useRef<string | null>(null);
  if (regeneratingMessageId) {
    lastKnownRegIdRef.current = regeneratingMessageId;
  }
  useEffect(() => {
    if (prevLoadingRef.current && !storeIsLoading && activeConvId) {
      const finishedRegId = lastKnownRegIdRef.current;

      // If we just finished a regeneration, patch the React Query cache in-place
      // so the updated content is visible immediately.
      if (finishedRegId) {
        const session = useConversationStore.getState().sessionMessages[activeConvId] || [];
        const regeneratedMsg = session.find((m) => m.id === finishedRegId);

        if (regeneratedMsg) {
          queryClient.setQueryData<InfiniteData<PaginatedMessagesResponse>>(
            ["conversations", activeConvId, "messages"],
            (oldData) => {
              if (!oldData) return oldData;
              return {
                ...oldData,
                pages: oldData.pages.map((page) => ({
                  ...page,
                  messages: page.messages.map((m) =>
                    m.id === finishedRegId ? { ...m, content: regeneratedMsg.content } : m,
                  ),
                })),
              };
            },
          );
        }

        // Clear so the same ID isn't re-applied on subsequent non-regeneration transitions
        lastKnownRegIdRef.current = null;
      }

      queryClient.invalidateQueries({ queryKey: ["conversations", activeConvId, "messages"] });
    }
    prevLoadingRef.current = storeIsLoading;
  }, [storeIsLoading, activeConvId, queryClient]);

  const isLoadingMessages = isQueryLoading && historyMessages.length === 0 && pendingMessages.length === 0;
  const isLoading = (propIsLoading ?? storeIsLoading) || isLoadingMessages;

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

        // Compute full history on-demand at send time from cached infinite pages
        const priorMessages = [
          ...getCachedMessages(queryClient, targetConvId),
          ...(useConversationStore.getState().sessionMessages[targetConvId] || []),
        ];
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
      const allMsgs = [
        ...getCachedMessages(queryClient, activeConvId),
        ...(useConversationStore.getState().sessionMessages[activeConvId] || []),
      ];
      const firstUser = allMsgs.find((m) => m.role === "user")?.content;
      const firstAi = allMsgs.find((m) => m.role === "assistant")?.content;

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
  }, [activeConvId, isGeneratingTitle, queryClient]);

  // Edit user message and regenerate response from this updated turn
  const handleEditMessage = useCallback(
    async (messageId: string, newContent: string) => {
      const trimmed = newContent.trim();
      if (!trimmed || !activeConvId) return;

      // 1. Optimistically update React Query cache
      queryClient.setQueryData<InfiniteData<PaginatedMessagesResponse>>(
        ["conversations", activeConvId, "messages"],
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

      // 2. Persist update in DB
      try {
        await editMessage(activeConvId, messageId, trimmed);
      } catch (err) {
        console.error("Failed to update message on server:", err);
      }

      // 3. Find subsequent assistant message to regenerate in place, or trigger send
      const allMsgs = [
        ...getCachedMessages(queryClient, activeConvId),
        ...(useConversationStore.getState().sessionMessages[activeConvId] || []),
      ];
      const userMsgIdx = allMsgs.findIndex((m) => m.id === messageId);
      const nextMsg = userMsgIdx !== -1 ? allMsgs[userMsgIdx + 1] : undefined;

      const priorTurns = userMsgIdx > 0 ? allMsgs.slice(0, userMsgIdx) : [];
      const conversationHistory = priorTurns
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

      if (nextMsg && nextMsg.role === "assistant") {
        await regenerateMessage(activeConvId, nextMsg.id, {
          promptContent: trimmed,
          conversationHistory,
        });
      } else {
        sendMessage(activeConvId, trimmed, { priorMessages: priorTurns, activeDoc: primaryDoc });
      }
    },
    [activeConvId, queryClient, editMessage, regenerateMessage, sendMessage, primaryDoc],
  );

  // Regenerate assistant response preserving prior conversation context
  const handleRegenerateMessage = useCallback(
    async (assistantMessageId: string) => {
      if (!activeConvId || isLoading) return;

      const allMsgs = [
        ...getCachedMessages(queryClient, activeConvId),
        ...(useConversationStore.getState().sessionMessages[activeConvId] || []),
      ];

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

      const conversationHistory = priorTurns
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

      await regenerateMessage(activeConvId, assistantMessageId, {
        promptContent,
        conversationHistory,
      });
    },
    [activeConvId, isLoading, queryClient, regenerateMessage],
  );

  // Retry a failed message or request
  const handleRetryMessage = useCallback(
    async (messageId: string) => {
      if (!activeConvId || isLoading) return;

      const allMsgs = [
        ...getCachedMessages(queryClient, activeConvId),
        ...(useConversationStore.getState().sessionMessages[activeConvId] || []),
      ];

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
          sendMessage(activeConvId, targetMsg.content, { priorMessages: priorTurns, activeDoc: primaryDoc });
        }
      }
    },
    [activeConvId, isLoading, queryClient, handleRegenerateMessage, sendMessage, primaryDoc],
  );

  // Share a message using Web Share API with clipboard fallback
  const handleShareMessage = useCallback(async (message: Message): Promise<boolean> => {
    const isAssistant = message.role === "assistant";
    const headerTitle = isAssistant ? "Docsy Assistant" : "User Prompt";
    const snippet = `### ${headerTitle}\n\n${message.content}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${headerTitle} - Docsy`,
          text: snippet,
          url: typeof window !== "undefined" ? window.location.href : undefined,
        });
        return true;
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          return false;
        }
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(snippet);
        return true;
      } catch {
        return false;
      }
    }

    return false;
  }, []);

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
    handleShareMessage,
    handleDelete,
    handleGenerateTitle,
  };
}
