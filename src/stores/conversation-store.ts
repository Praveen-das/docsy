"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { registerTokenHandlers } from "@/lib/api-client";
import { Message } from "@/types";
import { conversationService } from "@/features/chat/services/conversation.service";
import { conversationPollingService } from "@/features/chat/services/conversation-polling.service";
import { streamChatResponse, resumeChatStream } from "@/features/chat/services/chat-stream.client";
import { createMessage } from "@/features/chat/utils/message-factory";
import { STORAGE_KEY_CUSTOM_PROMPT } from "@/features/settings/constants/prompt-presets";
import { updateConversationInCache } from "@/features/conversations/services/conversation-cache.service";
import { getQueryClient } from "@/lib/query-client";
import { appendMessageToCache, updateMessageInCache } from "@/features/chat/services/message-cache.service";

export interface ActiveStreamInfo {
  convId: string;
  assistantMessageId: string;
  streamChannelId: string;
  replaceAssistantMessageId?: string;
  userMessage?: Message;
  startedAt: number;
}

export interface ConversationUIState {
  activeConversationId: string | null;
  drafts: Record<string, string>;
  streamTokens: Record<string, string>;
  activeStreams: Record<string, ActiveStreamInfo>;
  isLoadingAi: boolean;
  isAiTyping: boolean;
  streamingContent: string | null;
  regeneratingMessageId: string | null;

  // Actions
  setActiveConversation: (convId: string | null) => void;
  switchConversation: (targetConvId: string, currentDraft?: string) => void;
  saveDraft: (convId: string, draft: string) => void;
  setStreamToken: (convId: string, token: string) => void;
  setStreamTokens: (tokens: Record<string, string>) => void;
  getStreamToken: (convId: string) => string | undefined;
  removeStreamToken: (convId: string) => void;
  removeConversation: (convId: string) => void;
  setActiveStream: (convId: string, streamInfo: ActiveStreamInfo) => void;
  clearActiveStream: (convId: string) => void;
  pollConversationTitle: (convId: string, initialTitle: string) => void;
  syncConversationTitle: (convId: string) => Promise<void>;
  editMessage: (convId: string, messageId: string, newContent: string) => Promise<void>;
  regenerateMessage: (
    convId: string,
    assistantMessageId: string,
    options: {
      promptContent: string;
      conversationHistory?: { role: "user" | "assistant"; content: string }[];
    },
  ) => Promise<void>;
  sendMessage: (
    convId: string,
    content: string,
    options?: {
      conversationHistory?: { role: "user" | "assistant"; content: string }[];
    },
  ) => Promise<void>;
  resumeActiveStream: (convId: string) => Promise<void>;
  resetToDefaults: () => void;
}

/** In-flight lock to prevent duplicate stream listeners per conversation */
const inFlightStreams = new Set<string>();

/** In-memory storage for active stream text to avoid cross-conversation clobbering */
const streamingChunks = new Map<string, string>();

let isWindowUnloading = false;
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    isWindowUnloading = true;
  });
}

/**
 * Creates standardized stream lifecycle callbacks shared between fresh execution and resumption.
 */
function createStreamCallbacks({
  convId,
  assistantMessageId,
  replaceAssistantMessageId,
  set,
  get,
}: {
  convId: string;
  assistantMessageId: string;
  replaceAssistantMessageId?: string;
  set: (next: Partial<ConversationUIState> | ((state: ConversationUIState) => Partial<ConversationUIState>)) => void;
  get: () => ConversationUIState;
}) {
  return {
    onTyping: () => {
      if (get().activeConversationId === convId) {
        set({
          isLoadingAi: false,
          isAiTyping: true,
          streamingContent: null,
        });
      }
    },

    onChunk: (accumulatedText: string) => {
      streamingChunks.set(convId, accumulatedText);
      if (get().activeConversationId === convId) {
        set({
          streamingContent: accumulatedText,
          isAiTyping: false,
        });
      }
    },

    onComplete: (fullText: string) => {
      streamingChunks.delete(convId);
      set((state) => {
        const updatedStreams = { ...state.activeStreams };
        delete updatedStreams[convId];

        const isCurrent = state.activeConversationId === convId;
        return {
          activeStreams: updatedStreams,
          ...(isCurrent
            ? {
                streamingContent: null,
                isLoadingAi: false,
                isAiTyping: false,
                regeneratingMessageId: null,
              }
            : {}),
        };
      });

      updateConversationInCache(convId, {
        lastMessageSnippet: fullText.slice(0, 100),
        updatedAt: new Date().toISOString(),
      });

      const queryClient = getQueryClient();
      if (replaceAssistantMessageId) {
        updateMessageInCache(queryClient, convId, replaceAssistantMessageId, fullText);
      } else {
        appendMessageToCache(queryClient, convId, {
          id: assistantMessageId,
          conversationId: convId,
          role: "assistant",
          content: fullText,
          createdAt: new Date().toISOString(),
        });
      }
    },

    onError: () => {
      streamingChunks.delete(convId);
      if (!isWindowUnloading) {
        get().clearActiveStream(convId);
      }
      if (get().activeConversationId === convId) {
        set({
          streamingContent: null,
          isLoadingAi: false,
          isAiTyping: false,
          regeneratingMessageId: null,
        });
      }
    },
  };
}

/**
 * Internal helper to coordinate SSE streaming response with Zustand UI state.
 */
async function executeChatStream({
  convId,
  assistantMessageId,
  streamChannelId,
  content,
  conversationHistory,
  skipUserPersistence,
  replaceAssistantMessageId,
  userMessage,
  set,
  get,
}: {
  convId: string;
  assistantMessageId: string;
  streamChannelId: string;
  content: string;
  conversationHistory: { role: "user" | "assistant"; content: string }[];
  skipUserPersistence?: boolean;
  replaceAssistantMessageId?: string;
  userMessage?: Message;
  set: (next: Partial<ConversationUIState> | ((state: ConversationUIState) => Partial<ConversationUIState>)) => void;
  get: () => ConversationUIState;
}): Promise<void> {
  const customPrompt =
    typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY_CUSTOM_PROMPT) || undefined : undefined;

  // Track active stream in persistent state for reload resumption
  set((state) => ({
    activeStreams: {
      ...state.activeStreams,
      [convId]: {
        convId,
        assistantMessageId,
        streamChannelId,
        replaceAssistantMessageId,
        userMessage,
        startedAt: Date.now(),
      },
    },
  }));

  inFlightStreams.add(convId);

  try {
    const callbacks = createStreamCallbacks({
      convId,
      assistantMessageId,
      replaceAssistantMessageId,
      set,
      get,
    });

    await streamChatResponse({
      convId,
      assistantMessageId,
      streamChannelId,
      content,
      conversationHistory,
      skipUserPersistence,
      replaceAssistantMessageId,
      customPrompt,
      ...callbacks,
    });
  } finally {
    inFlightStreams.delete(convId);
  }
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
      streamTokens: {},
      activeStreams: {},
      isLoadingAi: false,
      isAiTyping: false,
      streamingContent: null,
      regeneratingMessageId: null,

      setActiveConversation: (convId: string | null) => {
        const state = get();
        if (state.activeConversationId === convId) return;

        const targetStream = convId ? state.activeStreams[convId] : undefined;
        const activeContent = convId ? streamingChunks.get(convId) || null : null;

        set({
          activeConversationId: convId,
          streamingContent: activeContent,
          isLoadingAi: Boolean(targetStream && !activeContent),
          isAiTyping: false,
          regeneratingMessageId: targetStream?.replaceAssistantMessageId || null,
        });
      },

      setStreamToken: (convId: string, token: string) => {
        set((s) => ({
          streamTokens: {
            ...s.streamTokens,
            [convId]: token,
          },
        }));
      },

      setStreamTokens: (tokens: Record<string, string>) => {
        set((s) => ({
          streamTokens: {
            ...s.streamTokens,
            ...tokens,
          },
        }));
      },

      getStreamToken: (convId: string) => {
        return get().streamTokens[convId];
      },

      removeStreamToken: (convId: string) => {
        set((s) => {
          const updated = { ...s.streamTokens };
          delete updated[convId];
          return { streamTokens: updated };
        });
      },

      removeConversation: (convId: string) => {
        inFlightStreams.delete(convId);
        streamingChunks.delete(convId);
        set((state) => {
          const drafts = { ...state.drafts };
          delete drafts[convId];

          const streamTokens = { ...state.streamTokens };
          delete streamTokens[convId];

          const activeStreams = { ...state.activeStreams };
          delete activeStreams[convId];

          return {
            drafts,
            streamTokens,
            activeStreams,
            activeConversationId: state.activeConversationId === convId ? null : state.activeConversationId,
          };
        });
      },

      setActiveStream: (convId: string, streamInfo: ActiveStreamInfo) => {
        set((s) => ({
          activeStreams: {
            ...s.activeStreams,
            [convId]: streamInfo,
          },
        }));
      },

      clearActiveStream: (convId: string) => {
        inFlightStreams.delete(convId);
        streamingChunks.delete(convId);
        set((s) => {
          const updated = { ...s.activeStreams };
          delete updated[convId];
          return { activeStreams: updated };
        });
      },

      switchConversation: (targetConvId: string, currentDraft?: string) => {
        const state = get();
        const updatedDrafts = { ...state.drafts };

        if (state.activeConversationId) {
          if (typeof currentDraft === "string") {
            updatedDrafts[state.activeConversationId] = currentDraft;
          }
        }

        const targetStream = state.activeStreams[targetConvId];
        const activeContent = streamingChunks.get(targetConvId) || null;

        set({
          activeConversationId: targetConvId,
          drafts: updatedDrafts,
          streamingContent: activeContent,
          isLoadingAi: Boolean(targetStream && !activeContent),
          isAiTyping: false,
          regeneratingMessageId: targetStream?.replaceAssistantMessageId || null,
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

      editMessage: async (convId: string, messageId: string, newContent: string) => {
        try {
          await conversationService.editMessage(convId, messageId, newContent);
        } catch (err) {
          console.error("Failed to edit message on server:", err);
          throw err;
        }
      },

      regenerateMessage: async (
        convId: string,
        assistantMessageId: string,
        options: {
          promptContent: string;
          conversationHistory?: { role: "user" | "assistant"; content: string }[];
        },
      ) => {
        if (inFlightStreams.has(convId)) return;

        const streamChannelId = `regen-${assistantMessageId}-${Date.now()}`;

        if (get().activeConversationId === convId) {
          set({
            isLoadingAi: true,
            regeneratingMessageId: assistantMessageId,
            streamingContent: null,
          });
        }

        const history = options.conversationHistory?.slice(-10) || [];
        await executeChatStream({
          convId,
          assistantMessageId,
          streamChannelId,
          content: options.promptContent,
          conversationHistory: history,
          skipUserPersistence: true,
          replaceAssistantMessageId: assistantMessageId,
          set,
          get,
        });
      },

      sendMessage: async (
        convId: string,
        content: string,
        options?: {
          conversationHistory?: { role: "user" | "assistant"; content: string }[];
        },
      ) => {
        if (inFlightStreams.has(convId)) return;

        const assistantMessageId = crypto.randomUUID();
        const streamChannelId = assistantMessageId;
        const userMessage = createMessage(convId, "user", content);

        // Optimistically add user message to React Query cache immediately
        appendMessageToCache(getQueryClient(), convId, userMessage);

        if (get().activeConversationId === convId) {
          set({
            isLoadingAi: true,
            isAiTyping: false,
            streamingContent: null,
            regeneratingMessageId: null,
          });
        }

        const history = options?.conversationHistory || [];
        await executeChatStream({
          convId,
          assistantMessageId,
          streamChannelId,
          content,
          conversationHistory: history,
          userMessage,
          set,
          get,
        });
      },

      resumeActiveStream: async (convId: string) => {
        const streamInfo = get().activeStreams[convId];
        if (!streamInfo || inFlightStreams.has(convId)) return;

        // Expire streams older than 10 mins
        if (Date.now() - streamInfo.startedAt > 10 * 60 * 1000) {
          get().clearActiveStream(convId);
          return;
        }

        inFlightStreams.add(convId);
        if (get().activeConversationId === convId) {
          set({ isLoadingAi: true, streamingContent: null });
        }

        try {
          const callbacks = createStreamCallbacks({
            convId,
            assistantMessageId: streamInfo.assistantMessageId,
            replaceAssistantMessageId: streamInfo.replaceAssistantMessageId,
            set,
            get,
          });

          await resumeChatStream({
            convId,
            streamChannelId: streamInfo.streamChannelId,
            ...callbacks,
          });
        } finally {
          inFlightStreams.delete(convId);
        }
      },

      resetToDefaults: () => {
        inFlightStreams.clear();
        streamingChunks.clear();
        conversationPollingService.clearAllTitlePolling();
        set({
          drafts: {},
          activeConversationId: null,
          streamTokens: {},
          activeStreams: {},
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
        streamTokens: state.streamTokens,
        activeStreams: state.activeStreams,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const now = Date.now();
        const active = state.activeStreams || {};
        const cleaned: Record<string, ActiveStreamInfo> = {};
        for (const [id, stream] of Object.entries(active)) {
          if (now - stream.startedAt < 10 * 60 * 1000) {
            cleaned[id] = stream;
          }
        }
        state.activeStreams = cleaned;
      },
    },
  ),
);

// Register token handlers so Axios interceptor seamlessly coordinates with Zustand state
registerTokenHandlers({
  getToken: (convId) => useConversationStore.getState().getStreamToken(convId),
  setToken: (convId, token) => {
    useConversationStore.getState().setStreamToken(convId, token);
  },
});
