"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { registerTokenHandlers } from "@/lib/api-client";
import { Conversation, Message, Document } from "@/types";
import { createMessage, createClientConversation } from "@/features/chat/utils/message-factory";
import { conversationService } from "@/features/chat/services/conversation.service";
import { conversationPollingService } from "@/features/chat/services/conversation-polling.service";
import { streamChatResponse } from "@/features/chat/services/chat-stream.client";

// Re-export factories for backward compatibility with existing consumers
export { createMessage, createClientConversation };

export interface ConversationState {
  conversations: Conversation[];
  sessionMessages: Record<string, Message[]>;
  drafts: Record<string, string>;
  activeConversationId: string | null;
  isLoadingAi: boolean;
  isAiTyping: boolean;
  streamingContent: string | null;
  regeneratingMessageId: string | null;
  isLoadingConversations: boolean;
  error: string | null;
  pinnedIds: Set<string>;

  // Actions
  setActiveConversation: (convId: string | null) => void;
  setStreamToken: (convId: string, token: string) => void;
  fetchConversations: () => Promise<void>;
  createConversation: (documentId: string, initialTitle?: string) => Promise<string>;
  switchConversation: (targetConvId: string, currentDraft?: string) => void;
  saveDraft: (convId: string, draft: string) => void;
  renameConversation: (convId: string, newTitle: string) => Promise<void>;
  deleteConversation: (convId: string) => Promise<void>;
  togglePinConversation: (convId: string) => Promise<void>;
  clearSessionMessages: (convId: string) => void;
  syncConversationTitle: (convId: string) => Promise<void>;
  pollConversationTitle: (convId: string, initialTitle: string) => void;
  sendMessage: (
    convId: string,
    content: string,
    options?: { priorMessages?: Message[]; activeDoc?: Document } | Document,
  ) => Promise<void>;
  editMessage: (convId: string, messageId: string, newContent: string) => Promise<void>;
  regenerateMessage: (
    convId: string,
    assistantMessageId: string,
    options: {
      promptContent: string;
      conversationHistory?: { role: "user" | "assistant"; content: string }[];
    },
  ) => Promise<void>;
  deleteMessage: (convId: string, messageId: string) => Promise<void>;
  resetToDefaults: () => void;
}

/**
 * Internal helper to coordinate SSE streaming response with Zustand state updates.
 */
async function executeChatStream({
  convId,
  assistantMessageId,
  content,
  conversationHistory,
  skipUserPersistence,
  replaceAssistantMessageId,
  set,
  get,
}: {
  convId: string;
  assistantMessageId: string;
  content: string;
  conversationHistory: { role: "user" | "assistant"; content: string }[];
  skipUserPersistence?: boolean;
  replaceAssistantMessageId?: string;
  set: (fn: (state: ConversationState) => Partial<ConversationState>) => void;
  get: () => ConversationState;
}): Promise<void> {
  const currentConv = get().conversations.find((c) => c.id === convId);
  const conversationToken = currentConv?.streamToken;
  const targetId = replaceAssistantMessageId || assistantMessageId;

  await streamChatResponse({
    convId,
    assistantMessageId,
    content,
    conversationHistory,
    conversationToken,
    skipUserPersistence,
    replaceAssistantMessageId,
    onTyping: () => set(() => ({ isAiTyping: true })),
    onChunk: (fullText) => set(() => ({ isAiTyping: false, streamingContent: fullText })),
    onComplete: (fullText) => {
      set((s) => {
        const currentSession = s.sessionMessages[convId] || [];
        const existingIdx = currentSession.findIndex((m) => m.id === targetId);

        let updatedSession: Message[];
        if (existingIdx !== -1) {
          updatedSession = currentSession.map((m, idx) =>
            idx === existingIdx ? { ...m, content: fullText } : m
          );
        } else {
          const assistantMsg = createMessage(convId, "assistant", fullText, { id: targetId });
          updatedSession = [...currentSession, assistantMsg];
        }

        return {
          sessionMessages: {
            ...s.sessionMessages,
            [convId]: updatedSession,
          },
          conversations: s.conversations.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messageCount: replaceAssistantMessageId
                    ? c.messageCount
                    : (c.messageCount || 0) + 1,
                  lastMessageSnippet:
                    fullText.slice(0, 90) + (fullText.length > 90 ? "..." : ""),
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
          streamingContent: null,
          regeneratingMessageId: null,
          isLoadingAi: false,
          isAiTyping: false,
        };
      });
    },
    onError: (errorDetail) => {
      const errorMsg = createMessage(
        convId,
        "assistant",
        `⚠️ **Request Notice**: ${errorDetail}`,
        { id: targetId }
      );

      set((s) => {
        const currentSession = s.sessionMessages[convId] || [];
        const existingIdx = currentSession.findIndex((m) => m.id === targetId);

        let updatedSession: Message[];
        if (existingIdx !== -1) {
          updatedSession = currentSession.map((m, idx) => (idx === existingIdx ? errorMsg : m));
        } else {
          updatedSession = [...currentSession, errorMsg];
        }

        return {
          sessionMessages: {
            ...s.sessionMessages,
            [convId]: updatedSession,
          },
          streamingContent: null,
          regeneratingMessageId: null,
          isLoadingAi: false,
          isAiTyping: false,
        };
      });
    },
  });
}

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      conversations: [],
      sessionMessages: {},
      drafts: {},
      activeConversationId: null,
      isLoadingAi: false,
      isAiTyping: false,
      streamingContent: null,
      regeneratingMessageId: null,
      isLoadingConversations: false,
      error: null,
      pinnedIds: new Set<string>(),

      setActiveConversation: (convId: string | null) => {
        if (get().activeConversationId === convId) return;
        set({ activeConversationId: convId, streamingContent: null });
      },

      setStreamToken: (convId: string, token: string) => {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === convId ? { ...c, streamToken: token } : c
          ),
        }));
      },

      fetchConversations: async () => {
        set({ isLoadingConversations: true, error: null });
        try {
          const data = await conversationService.fetchConversations();
          set({
            conversations: data.conversations,
            pinnedIds: new Set(data.pinnedIds),
            isLoadingConversations: false,
          });
        } catch (err: unknown) {
          if (axios.isAxiosError(err) && err.response?.status === 401) {
            set({ isLoadingConversations: false });
            return;
          }
          const message =
            axios.isAxiosError(err) && err.response?.data?.error
              ? err.response.data.error
              : err instanceof Error
                ? err.message
                : "Error fetching conversations";
          set({
            error: message,
            isLoadingConversations: false,
          });
        }
      },

      createConversation: async (documentId: string, initialTitle?: string): Promise<string> => {
        const state = get();
        const existingForDoc = state.conversations.filter((c) =>
          c.documentIds.includes(documentId)
        );
        const title = initialTitle || `Conversation ${existingForDoc.length + 1}`;

        const newConversation = createClientConversation(documentId, title);
        const newConvId = newConversation.id;

        set({
          conversations: [newConversation, ...state.conversations],
          sessionMessages: {
            ...state.sessionMessages,
            [newConvId]: [],
          },
          drafts: {
            ...state.drafts,
            [newConvId]: "",
          },
          activeConversationId: newConvId,
        });

        // Persist to the backend and store stream capability token
        try {
          const data = await conversationService.createConversation(
            newConvId,
            [documentId],
            title
          );
          if (data?.streamToken) {
            set((s) => ({
              conversations: s.conversations.map((c) =>
                c.id === newConvId ? { ...c, streamToken: data.streamToken } : c
              ),
            }));
          }
        } catch (err) {
          console.error("Failed to sync new conversation to server:", err);
        }

        return newConvId;
      },

      switchConversation: (targetConvId: string, currentDraft?: string) => {
        const state = get();
        const updatedDrafts = { ...state.drafts };

        if (state.activeConversationId && typeof currentDraft === "string") {
          updatedDrafts[state.activeConversationId] = currentDraft;
        }

        set({
          activeConversationId: targetConvId,
          drafts: updatedDrafts,
          streamingContent: null,
        });
      },

      saveDraft: (convId: string, draft: string) => {
        set((state) => ({
          drafts: {
            ...state.drafts,
            [convId]: draft,
          },
        }));
      },

      renameConversation: async (convId: string, newTitle: string) => {
        const trimmed = newTitle.trim();
        if (!trimmed) return;

        // Optimistic update
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === convId ? { ...c, title: trimmed, updatedAt: new Date().toISOString() } : c
          ),
        }));

        try {
          await conversationService.renameConversation(convId, trimmed);
        } catch (err) {
          console.error("Failed to rename conversation:", err);
        }
      },

      deleteConversation: async (convId: string) => {
        const state = get();
        const remaining = state.conversations.filter((c) => c.id !== convId);
        const remainingSessionMessages = { ...state.sessionMessages };
        delete remainingSessionMessages[convId];
        const remainingDrafts = { ...state.drafts };
        delete remainingDrafts[convId];

        let newActiveId = state.activeConversationId;
        if (state.activeConversationId === convId) {
          newActiveId = null;
        }

        set({
          conversations: remaining,
          sessionMessages: remainingSessionMessages,
          drafts: remainingDrafts,
          activeConversationId: newActiveId,
        });

        conversationPollingService.stopTitlePolling(convId);

        try {
          await conversationService.deleteConversation(convId);
        } catch (err) {
          console.error("Failed to delete conversation on server:", err);
        }
      },

      togglePinConversation: async (convId: string) => {
        // Optimistic toggle
        set((s) => {
          const next = new Set(s.pinnedIds);
          if (next.has(convId)) next.delete(convId);
          else next.add(convId);
          return { pinnedIds: next };
        });

        try {
          await conversationService.togglePinConversation(convId);
        } catch (err) {
          // Revert on failure
          set((s) => {
            const reverted = new Set(s.pinnedIds);
            if (reverted.has(convId)) reverted.delete(convId);
            else reverted.add(convId);
            return { pinnedIds: reverted };
          });
          console.error("Failed to toggle pin:", err);
        }
      },

      clearSessionMessages: (convId: string) => {
        set((state) => ({
          sessionMessages: {
            ...state.sessionMessages,
            [convId]: [],
          },
          conversations: state.conversations.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messageCount: 0,
                  lastMessageSnippet: undefined,
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        }));
      },

      syncConversationTitle: async (convId: string) => {
        try {
          const newTitle = await conversationService.fetchConversationTitle(convId);
          if (newTitle) {
            set((state) => ({
              conversations: state.conversations.map((c) =>
                c.id === convId ? { ...c, title: newTitle } : c
              ),
            }));
          }
        } catch (err) {
          console.warn("Failed to sync conversation title:", err);
        }
      },

      pollConversationTitle: (convId: string, initialTitle: string) => {
        conversationPollingService.startTitlePolling(convId, initialTitle, (serverTitle) => {
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === convId ? { ...c, title: serverTitle } : c
            ),
          }));
        });
      },

      sendMessage: async (
        convId: string,
        content: string,
        options?: { priorMessages?: Message[]; activeDoc?: Document } | Document
      ) => {
        const state = get();
        const now = new Date().toISOString();

        let priorMessages: Message[] | undefined;
        if (options && "priorMessages" in options) {
          priorMessages = options.priorMessages;
        }

        const userMsg = createMessage(convId, "user", content, { createdAt: now });
        const existingSession = state.sessionMessages[convId] || [];
        const updatedSession = [...existingSession, userMsg];
        const updatedDrafts = { ...state.drafts, [convId]: "" };

        // Save user message immediately & set loading state
        set({
          sessionMessages: {
            ...state.sessionMessages,
            [convId]: updatedSession,
          },
          conversations: state.conversations.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messageCount: (c.messageCount || 0) + 1,
                  lastMessageSnippet: content,
                  updatedAt: now,
                }
              : c
          ),
          drafts: updatedDrafts,
          isLoadingAi: true,
          streamingContent: null,
          regeneratingMessageId: null,
        });

        // Pre-create assistant message reference
        const placeholderAiMsg = createMessage(convId, "assistant");
        const assistantMessageId = placeholderAiMsg.id;

        // Prepare prior conversation history for multi-turn context (last 10 turns)
        const allPrior = priorMessages ?? existingSession;
        const conversationHistory = allPrior
          .filter((m) => m.role === "user" || m.role === "assistant")
          .slice(-10)
          .map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }));

        await executeChatStream({
          convId,
          assistantMessageId,
          content,
          conversationHistory,
          set,
          get,
        });
      },

      editMessage: async (convId: string, messageId: string, newContent: string) => {
        set((state) => {
          const currentSession = state.sessionMessages[convId];
          if (!currentSession) return {};
          return {
            sessionMessages: {
              ...state.sessionMessages,
              [convId]: currentSession.map((m) =>
                m.id === messageId ? { ...m, content: newContent } : m
              ),
            },
          };
        });

        try {
          await conversationService.editMessage(convId, messageId, newContent);
        } catch (err) {
          console.error("Failed to edit message on server:", err);
        }
      },

      regenerateMessage: async (
        convId: string,
        assistantMessageId: string,
        options: {
          promptContent: string;
          conversationHistory?: { role: "user" | "assistant"; content: string }[];
        }
      ) => {
        set({
          isLoadingAi: true,
          regeneratingMessageId: assistantMessageId,
          streamingContent: null,
        });

        const history = options.conversationHistory?.slice(-10) || [];
        await executeChatStream({
          convId,
          assistantMessageId,
          content: options.promptContent,
          conversationHistory: history,
          skipUserPersistence: true,
          replaceAssistantMessageId: assistantMessageId,
          set,
          get,
        });
      },

      deleteMessage: async (convId: string, messageId: string) => {
        set((state) => {
          const currentSession = state.sessionMessages[convId];
          if (!currentSession) return {};
          return {
            sessionMessages: {
              ...state.sessionMessages,
              [convId]: currentSession.filter((m) => m.id !== messageId),
            },
          };
        });

        try {
          await conversationService.deleteMessage(convId, messageId);
        } catch (err) {
          console.error("Failed to delete message on server:", err);
        }
      },

      resetToDefaults: () => {
        conversationPollingService.clearAllTitlePolling();
        set({
          conversations: [],
          sessionMessages: {},
          drafts: {},
          activeConversationId: null,
          isLoadingAi: false,
          isAiTyping: false,
          streamingContent: null,
          regeneratingMessageId: null,
          error: null,
          pinnedIds: new Set<string>(),
        });
      },
    }),
    {
      name: "docsy-conversations-v3",
      partialize: (state) => ({
        drafts: state.drafts,
        activeConversationId: state.activeConversationId,
      }),
    }
  )
);

// Register token handlers so Axios interceptor seamlessly coordinates with Zustand state
registerTokenHandlers({
  getToken: (convId) =>
    useConversationStore.getState().conversations.find((c) => c.id === convId)?.streamToken,
  setToken: (convId, token) => {
    useConversationStore.getState().setStreamToken(convId, token);
  },
});
