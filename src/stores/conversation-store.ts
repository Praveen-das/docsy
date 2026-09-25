"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { registerTokenHandlers } from "@/lib/api-client";
import { Message, Document } from "@/types";
import { createMessage, createClientConversation } from "@/features/chat/utils/message-factory";
import { conversationService } from "@/features/chat/services/conversation.service";
import { conversationPollingService } from "@/features/chat/services/conversation-polling.service";
import { streamChatResponse } from "@/features/chat/services/chat-stream.client";
import { STORAGE_KEY_CUSTOM_PROMPT } from "@/features/settings/constants/prompt-presets";
import { updateConversationInCache } from "@/features/conversations/hooks/use-conversations";

// Re-export factories for backward compatibility with existing consumers
export { createMessage, createClientConversation };

export interface ConversationUIState {
  activeConversationId: string | null;
  drafts: Record<string, string>;
  sessionMessages: Record<string, Message[]>;
  streamTokens: Record<string, string>;
  isLoadingAi: boolean;
  isAiTyping: boolean;
  streamingContent: string | null;
  regeneratingMessageId: string | null;

  // Actions
  setActiveConversation: (convId: string | null) => void;
  switchConversation: (targetConvId: string, currentDraft?: string) => void;
  saveDraft: (convId: string, draft: string) => void;
  setStreamToken: (convId: string, token: string) => void;
  getStreamToken: (convId: string) => string | undefined;
  clearSessionMessages: (convId: string) => void;
  pollConversationTitle: (convId: string, initialTitle: string) => void;
  syncConversationTitle: (convId: string) => Promise<void>;
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
  resetToDefaults: () => void;
}

/**
 * Internal helper to coordinate SSE streaming response with Zustand UI state.
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
  set: (fn: (state: ConversationUIState) => Partial<ConversationUIState>) => void;
  get: () => ConversationUIState;
}): Promise<void> {
  const conversationToken = get().getStreamToken(convId);
  const targetId = replaceAssistantMessageId || assistantMessageId;
  const customPrompt =
    typeof window !== "undefined"
      ? window.localStorage.getItem(STORAGE_KEY_CUSTOM_PROMPT) || undefined
      : undefined;

  await streamChatResponse({
    convId,
    assistantMessageId,
    content,
    conversationHistory,
    conversationToken,
    skipUserPersistence,
    replaceAssistantMessageId,
    customPrompt,

    onTyping: () => {
      set(() => ({
        isLoadingAi: false,
        isAiTyping: true,
        streamingContent: "",
      }));
    },

    onChunk: (accumulatedText) => {
      set((state) => {
        const currentSession = state.sessionMessages[convId] || [];
        const existingIdx = currentSession.findIndex((m) => m.id === targetId);

        let updatedSession: Message[];
        if (existingIdx !== -1) {
          updatedSession = currentSession.map((m) =>
            m.id === targetId ? { ...m, content: accumulatedText } : m,
          );
        } else {
          const aiMsg = createMessage(convId, "assistant", accumulatedText, {
            id: targetId,
          });
          updatedSession = [...currentSession, aiMsg];
        }

        return {
          sessionMessages: {
            ...state.sessionMessages,
            [convId]: updatedSession,
          },
          streamingContent: accumulatedText,
          isAiTyping: true,
        };
      });
    },

    onComplete: (fullText) => {
      set((state) => {
        const currentSession = state.sessionMessages[convId] || [];
        const existingIdx = currentSession.findIndex((m) => m.id === targetId);

        let updatedSession: Message[];
        if (existingIdx !== -1) {
          updatedSession = currentSession.map((m) =>
            m.id === targetId ? { ...m, content: fullText } : m,
          );
        } else {
          const aiMsg = createMessage(convId, "assistant", fullText, {
            id: targetId,
          });
          updatedSession = [...currentSession, aiMsg];
        }

        updateConversationInCache(convId, {
          lastMessageSnippet: fullText.slice(0, 100),
          updatedAt: new Date().toISOString(),
        });

        return {
          sessionMessages: {
            ...state.sessionMessages,
            [convId]: updatedSession,
          },
          streamingContent: null,
          isLoadingAi: false,
          isAiTyping: false,
          regeneratingMessageId: null,
        };
      });
    },

    onError: (errorDetail) => {
      set((state) => {
        const currentSession = state.sessionMessages[convId] || [];
        const errorContent = errorDetail.startsWith("⚠️")
          ? errorDetail
          : `⚠️ **Request Notice**: ${errorDetail}`;
        const errorMsg = createMessage(convId, "assistant", errorContent, {
          id: targetId,
        });

        return {
          sessionMessages: {
            ...state.sessionMessages,
            [convId]: [...currentSession.filter((m) => m.id !== targetId), errorMsg],
          },
          streamingContent: null,
          isLoadingAi: false,
          isAiTyping: false,
          regeneratingMessageId: null,
        };
      });
    },
  });
}

/**
 * Global Zustand store strictly for client-side Conversation UI state.
 * Server state (conversations list, pins, mutations) is managed via React Query (useConversations).
 */
export const useConversationStore = create<ConversationUIState>()(
  persist(
    (set, get) => ({
      activeConversationId: null,
      drafts: {},
      sessionMessages: {},
      streamTokens: {},
      isLoadingAi: false,
      isAiTyping: false,
      streamingContent: null,
      regeneratingMessageId: null,

      setActiveConversation: (convId: string | null) => {
        if (get().activeConversationId === convId) return;
        set({ activeConversationId: convId, streamingContent: null });
      },

      setStreamToken: (convId: string, token: string) => {
        set((s) => ({
          streamTokens: {
            ...s.streamTokens,
            [convId]: token,
          },
        }));
      },

      getStreamToken: (convId: string) => {
        return get().streamTokens[convId];
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

      clearSessionMessages: (convId: string) => {
        set((state) => ({
          sessionMessages: {
            ...state.sessionMessages,
            [convId]: [],
          },
        }));
      },

      syncConversationTitle: async (convId: string) => {
        try {
          const newTitle = await conversationService.fetchConversationTitle(convId);
          if (newTitle) {
            updateConversationInCache(convId, { title: newTitle });
          }
        } catch (err) {
          console.warn("Failed to sync conversation title:", err);
        }
      },

      pollConversationTitle: (convId: string, initialTitle: string) => {
        conversationPollingService.startTitlePolling(convId, initialTitle, (serverTitle) => {
          updateConversationInCache(convId, { title: serverTitle });
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

        updateConversationInCache(convId, {
          lastMessageSnippet: content,
          updatedAt: now,
        });

        // Save user message immediately & set loading state
        set({
          sessionMessages: {
            ...state.sessionMessages,
            [convId]: updatedSession,
          },
          drafts: updatedDrafts,
          isLoadingAi: true,
          streamingContent: null,
          regeneratingMessageId: null,
        });

        const placeholderAiMsg = createMessage(convId, "assistant");
        const assistantMessageId = placeholderAiMsg.id;

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

      resetToDefaults: () => {
        conversationPollingService.clearAllTitlePolling();
        set({
          sessionMessages: {},
          drafts: {},
          activeConversationId: null,
          isLoadingAi: false,
          isAiTyping: false,
          streamingContent: null,
          regeneratingMessageId: null,
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
  getToken: (convId) => useConversationStore.getState().getStreamToken(convId),
  setToken: (convId, token) => {
    useConversationStore.getState().setStreamToken(convId, token);
  },
});
